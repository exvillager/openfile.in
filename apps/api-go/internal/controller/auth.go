package controller

import (
	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/service"
)

type AuthController struct {
	auth *service.AuthService
}

func NewAuthController(auth *service.AuthService) *AuthController {
	return &AuthController{auth: auth}
}

func (ac *AuthController) Login(c *nanoserve.Context) error {
	return nil
}

func (ac *AuthController) Signup(c *nanoserve.Context) error {
	return nil
}

func (ac *AuthController) Logout(c *nanoserve.Context) error {
	return nil
}

func (ac *AuthController) RefreshToken(c *nanoserve.Context) error {
	return nil
}

func (ac *AuthController) Check(c *nanoserve.Context) error {
	return nil
}
