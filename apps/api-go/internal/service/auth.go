package service

import "github.com/exvillager/openfile.in/internal/db"

type AuthService struct {
	queries db.Querier
}

func NewAuthService(queries db.Querier) *AuthService {
	return &AuthService{queries: queries}
}
