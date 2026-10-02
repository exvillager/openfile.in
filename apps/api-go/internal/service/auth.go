package service

import (
	"context"
	"errors"
	"net/http"

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

// Login checks the username and password and issues a new token pair.
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

	tokens, err := util.GenerateTokens(user, s.cfg)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{User: user, Tokens: tokens}, nil
}

// Signup creates the user and their free subscription in one transaction,
// then issues a token pair.
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

	if err := tx.Commit(ctx); err != nil {
		return AuthResult{}, err
	}

	tokens, err := util.GenerateTokens(user, s.cfg)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{User: user, Tokens: tokens}, nil
}

// newID returns a UUIDv7, the same id format the Node backend uses.
func newID() pgtype.UUID {
	return pgtype.UUID{Bytes: uuid.Must(uuid.NewV7()), Valid: true}
}
