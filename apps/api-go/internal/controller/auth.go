package controller

import (
	"net/http"
	"time"
	"unicode/utf8"

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

type authRequest struct {
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
	var req authRequest
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
	var req authRequest
	if err := c.Bind(&req); err != nil {
		return response.NewApiError("Invalid request body", http.StatusBadRequest)
	}
	if err := validateSignup(req); err != nil {
		return err
	}

	res, err := ac.auth.Signup(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		return err
	}

	ac.setAuthCookies(c, res.Tokens)

	return c.Status(http.StatusCreated).JSON(authResponse{
		User:         dto.NewUser(res.User),
		AccessToken:  res.Tokens.AccessToken,
		RefreshToken: res.Tokens.RefreshToken,
	})
}

// validateSignup mirrors the Node backend's registerSchema.
func validateSignup(req authRequest) error {
	switch n := utf8.RuneCountInString(req.Username); {
	case n < 3:
		return response.NewApiError("Username must be at least 3 characters", http.StatusBadRequest)
	case n > 50:
		return response.NewApiError("Username is too long", http.StatusBadRequest)
	}

	if utf8.RuneCountInString(req.Password) < 4 {
		return response.NewApiError("Password must be at least 4 characters", http.StatusBadRequest)
	}
	// Node allows 100 characters, but bcrypt only takes 72 bytes, so that is the real limit.
	if len(req.Password) > 72 {
		return response.NewApiError("Password is too long", http.StatusBadRequest)
	}
	return nil
}

// Logout runs behind RequireAuth, which stores the verified token as "token".
func (ac *AuthController) Logout(c *nanoserve.Context) error {
	token, ok := c.Get("token").(string)
	if !ok {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	if err := ac.auth.Logout(c.Request.Context(), token); err != nil {
		return err
	}

	ac.clearAuthCookies(c)

	return c.Status(http.StatusOK).JSON(map[string]string{"message": "User logged out successfully"})
}

// RefreshToken reads the refreshToken cookie, like the Node backend.
func (ac *AuthController) RefreshToken(c *nanoserve.Context) error {
	cookie, err := c.GetCookie("refreshToken")
	if err != nil || cookie.Value == "" {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	tokens, err := ac.auth.Refresh(c.Request.Context(), cookie.Value)
	if err != nil {
		return err
	}

	ac.setAuthCookies(c, tokens)

	return c.Status(http.StatusOK).JSON(map[string]string{
		"accessToken":  tokens.AccessToken,
		"refreshToken": tokens.RefreshToken,
	})
}

// Check runs behind RequireAuth, which stores the verified claims as "claims".
func (ac *AuthController) Check(c *nanoserve.Context) error {
	claims, ok := c.Get("claims").(*util.Claims)
	if !ok {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	user, err := ac.auth.CurrentUser(c.Request.Context(), claims.ID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]dto.CurrentUser{"user": dto.NewCurrentUser(user)})
}

// setAuthCookies uses the same cookie options as the Node backend.
func (ac *AuthController) setAuthCookies(c *nanoserve.Context, tokens util.TokenPair) {
	c.SetCookie(authCookie("accessToken", tokens.AccessToken, ac.cfg.AccessTokenExpiry))
	c.SetCookie(authCookie("refreshToken", tokens.RefreshToken, ac.cfg.RefreshTokenExpiry))
}

// clearAuthCookies expires both cookies with the same attributes they were set with.
func (ac *AuthController) clearAuthCookies(c *nanoserve.Context) {
	for _, name := range []string{"accessToken", "refreshToken"} {
		cookie := authCookie(name, "", 0)
		cookie.MaxAge = -1
		c.SetCookie(cookie)
	}
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
