package service

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/util"
)

var errInvalidCredentials = response.NewApiError("Invalid credentials", http.StatusUnauthorized)

type AuthService struct {
	queries db.Querier
	cfg     *config.Config
}

func NewAuthService(queries db.Querier, cfg *config.Config) *AuthService {
	return &AuthService{queries: queries, cfg: cfg}
}

// LoginResult carries the tokens back to the controller, which sets the cookies.
type LoginResult struct {
	User   db.User
	Tokens util.TokenPair
}

// Login checks the username and password and issues a new token pair.
// Passwords are bcrypt hashes, the same format the Node backend writes.
func (s *AuthService) Login(ctx context.Context, username, password string) (LoginResult, error) {
	user, err := s.queries.GetUserByUsername(ctx, username)
	if errors.Is(err, pgx.ErrNoRows) {
		return LoginResult{}, errInvalidCredentials
	}
	if err != nil {
		return LoginResult{}, err
	}

	if user.Passoword == nil {
		return LoginResult{}, errInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Passoword), []byte(password)); err != nil {
		return LoginResult{}, errInvalidCredentials
	}

	tokens, err := util.GenerateTokens(user, s.cfg)
	if err != nil {
		return LoginResult{}, err
	}

	return LoginResult{User: user, Tokens: tokens}, nil
}
