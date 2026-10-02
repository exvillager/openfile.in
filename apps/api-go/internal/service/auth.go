package service

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/util"
)

var (
	errInvalidCredentials = response.NewApiError("Invalid credentials", http.StatusUnauthorized)
	errUsernameTaken      = response.NewApiError("Username already taken", http.StatusConflict)
	errUnauthorized       = response.NewApiError("Unauthorized", http.StatusUnauthorized)
)

// bcryptCost matches the Node backend's Bun.password settings.
const bcryptCost = 10

type AuthService struct {
	pool    *pgxpool.Pool
	queries db.Querier
	cfg     *config.Config
}

func NewAuthService(pool *pgxpool.Pool, queries db.Querier, cfg *config.Config) *AuthService {
	return &AuthService{pool: pool, queries: queries, cfg: cfg}
}

// AuthResult carries the tokens back to the controller, which sets the cookies.
type AuthResult struct {
	User   db.User
	Tokens util.TokenPair
}

// Login checks the username and password, then starts a new session.
// Passwords are bcrypt hashes, the same format the Node backend writes.
func (s *AuthService) Login(ctx context.Context, username, password string) (AuthResult, error) {
	user, err := s.queries.GetUserByUsername(ctx, username)
	if errors.Is(err, pgx.ErrNoRows) {
		return AuthResult{}, errInvalidCredentials
	}
	if err != nil {
		return AuthResult{}, err
	}

	if user.Passoword == nil {
		return AuthResult{}, errInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Passoword), []byte(password)); err != nil {
		return AuthResult{}, errInvalidCredentials
	}

	tokens, err := s.createSession(ctx, s.queries, user)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{User: user, Tokens: tokens}, nil
}

// Signup creates the user, their free subscription and the first session
// in one transaction, then returns the token pair.
func (s *AuthService) Signup(ctx context.Context, username, password string) (AuthResult, error) {
	_, err := s.queries.GetUserByUsername(ctx, username)
	if err == nil {
		return AuthResult{}, errUsernameTaken
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return AuthResult{}, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return AuthResult{}, err
	}
	hashed := string(hash)

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return AuthResult{}, err
	}
	defer tx.Rollback(ctx)

	q := db.New(tx)

	user, err := q.CreateUser(ctx, db.CreateUserParams{
		ID:        newID(),
		Username:  username,
		Passoword: &hashed,
	})
	if err != nil {
		// Another signup took the username between the check and the insert.
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok && pgErr.Code == "23505" {
			return AuthResult{}, errUsernameTaken
		}
		return AuthResult{}, err
	}

	if _, err := q.CreateSubscription(ctx, db.CreateSubscriptionParams{
		ID:       newID(),
		UserId:   user.ID,
		PlanName: "free",
	}); err != nil {
		return AuthResult{}, err
	}

	tokens, err := s.createSession(ctx, q, user)
	if err != nil {
		return AuthResult{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return AuthResult{}, err
	}

	return AuthResult{User: user, Tokens: tokens}, nil
}

// createSession signs a token pair and stores both hashes in one session row,
// so requests and refreshes can be checked against it and logout kills both.
// It takes the querier so Signup can run it inside its transaction.
func (s *AuthService) createSession(ctx context.Context, q db.Querier, user db.User) (util.TokenPair, error) {
	tokens, err := util.GenerateTokens(user, s.cfg)
	if err != nil {
		return util.TokenPair{}, err
	}

	if _, err := q.CreateSession(ctx, db.CreateSessionParams{
		ID:               newID(),
		UserId:           user.ID,
		TokenHash:        util.HashToken(tokens.AccessToken),
		RefreshTokenHash: util.HashToken(tokens.RefreshToken),
		ExpiresAt:        s.sessionExpiry(),
	}); err != nil {
		return util.TokenPair{}, err
	}

	return tokens, nil
}

// Refresh swaps a refresh token for a new token pair in the same session.
// The old access and refresh tokens stop working right away.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (util.TokenPair, error) {
	if _, err := util.VerifyRefreshToken(refreshToken, s.cfg); err != nil {
		return util.TokenPair{}, errUnauthorized
	}

	oldHash := util.HashToken(refreshToken)

	session, err := s.queries.GetActiveSessionByRefreshHash(ctx, oldHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return util.TokenPair{}, errUnauthorized
	}
	if err != nil {
		return util.TokenPair{}, err
	}

	user, err := s.queries.GetUserByID(ctx, session.UserId)
	if errors.Is(err, pgx.ErrNoRows) {
		return util.TokenPair{}, errUnauthorized
	}
	if err != nil {
		return util.TokenPair{}, err
	}

	tokens, err := util.GenerateTokens(user, s.cfg)
	if err != nil {
		return util.TokenPair{}, err
	}

	rotated, err := s.queries.RotateSession(ctx, db.RotateSessionParams{
		ID:                  session.ID,
		OldRefreshTokenHash: oldHash,
		TokenHash:           util.HashToken(tokens.AccessToken),
		RefreshTokenHash:    util.HashToken(tokens.RefreshToken),
		ExpiresAt:           s.sessionExpiry(),
	})
	if err != nil {
		return util.TokenPair{}, err
	}
	// Another refresh with the same token got there first.
	if rotated == 0 {
		return util.TokenPair{}, errUnauthorized
	}

	return tokens, nil
}

// sessionExpiry follows the refresh token, the longest-lived token in a session.
// The access token's shorter lifetime is still enforced by its JWT exp.
// UTC because the column is a timestamp without time zone.
func (s *AuthService) sessionExpiry() pgtype.Timestamp {
	return pgtype.Timestamp{Time: time.Now().UTC().Add(s.cfg.RefreshTokenExpiry), Valid: true}
}

// Authenticate accepts an access token only if its JWT is valid and its
// session is still active (not logged out, not expired).
func (s *AuthService) Authenticate(ctx context.Context, token string) (*util.Claims, error) {
	claims, err := util.VerifyAccessToken(token, s.cfg)
	if err != nil {
		return nil, errUnauthorized
	}

	_, err = s.queries.GetActiveSessionByTokenHash(ctx, util.HashToken(token))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errUnauthorized
	}
	if err != nil {
		return nil, err
	}

	return claims, nil
}

// Logout revokes the session behind this access token. The row is kept as a
// login record; the token stops working right away.
func (s *AuthService) Logout(ctx context.Context, token string) error {
	return s.queries.RevokeSession(ctx, util.HashToken(token))
}

// CurrentUser loads the user behind an authenticated request, with their plan.
func (s *AuthService) CurrentUser(ctx context.Context, userID string) (db.GetUserWithPlanRow, error) {
	var id pgtype.UUID
	if err := id.Scan(userID); err != nil {
		return db.GetUserWithPlanRow{}, errUnauthorized
	}

	user, err := s.queries.GetUserWithPlan(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return db.GetUserWithPlanRow{}, response.NewApiError("Unauthorized: User not found", http.StatusUnauthorized)
	}
	return user, err
}

// newID returns a UUIDv7
func newID() pgtype.UUID {
	return pgtype.UUID{Bytes: uuid.Must(uuid.NewV7()), Valid: true}
}
