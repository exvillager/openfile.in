package controller

import (
	"net/http"
	"time"

	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/dto"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
	"github.com/exvillager/openfile.in/internal/util"
)

type AuthController struct {
	auth *service.AuthService
	cfg  *config.Config
}

func NewAuthController(auth *service.AuthService, cfg *config.Config) *AuthController {
	return &AuthController{auth: auth, cfg: cfg}
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// authResponse matches the body the Node backend returns from login and signup.
type authResponse struct {
	User         dto.User `json:"user"`
	AccessToken  string   `json:"accessToken"`
	RefreshToken string   `json:"refreshToken"`
}

func (ac *AuthController) Login(c *nanoserve.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return response.NewApiError("Invalid request body", http.StatusBadRequest)
	}
	if req.Username == "" {
		return response.NewApiError("Username is required", http.StatusBadRequest)
	}
	if req.Password == "" {
		return response.NewApiError("Password is required", http.StatusBadRequest)
	}

	res, err := ac.auth.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		return err
	}

	ac.setAuthCookies(c, res.Tokens)

	return c.Status(http.StatusOK).JSON(authResponse{
		User:         dto.NewUser(res.User),
		AccessToken:  res.Tokens.AccessToken,
		RefreshToken: res.Tokens.RefreshToken,
	})
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

// setAuthCookies uses the same cookie options as the Node backend.
func (ac *AuthController) setAuthCookies(c *nanoserve.Context, tokens util.TokenPair) {
	c.SetCookie(authCookie("accessToken", tokens.AccessToken, ac.cfg.AccessTokenExpiry))
	c.SetCookie(authCookie("refreshToken", tokens.RefreshToken, ac.cfg.RefreshTokenExpiry))
}

func authCookie(name, value string, maxAge time.Duration) http.Cookie {
	return http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
}
