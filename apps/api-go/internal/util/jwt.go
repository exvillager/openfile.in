package util

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/db"
)

// Claims matches the payload the Node backend signs, so tokens work in both.
type Claims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func GenerateTokens(user db.User, cfg *config.Config) (TokenPair, error) {
	access, err := sign(user, cfg.AccessTokenSecret, cfg.AccessTokenExpiry)
	if err != nil {
		return TokenPair{}, err
	}

	refresh, err := sign(user, cfg.RefreshTokenSecret, cfg.RefreshTokenExpiry)
	if err != nil {
		return TokenPair{}, err
	}

	return TokenPair{AccessToken: access, RefreshToken: refresh}, nil
}

func VerifyAccessToken(token string, cfg *config.Config) (*Claims, error) {
	return verify(token, cfg.AccessTokenSecret)
}

func VerifyRefreshToken(token string, cfg *config.Config) (*Claims, error) {
	return verify(token, cfg.RefreshTokenSecret)
}

// HashToken returns the sha256 of a token, which is what the Session table stores.
func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func sign(user db.User, secret string, expiry time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		ID:       user.ID.String(),
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			// a random id as ID so that same users login attempt cannt create same jwt and same hash
			ID:        uuid.NewString(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(expiry)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func verify(token string, secret string) (*Claims, error) {
	claims := &Claims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil {
		return nil, err
	}
	if !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
