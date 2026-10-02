package middleware

import (
	"net/http"
	"strings"

	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
)

// ClaimsKey is where RequireAuth stores the *util.Claims on the context.
const ClaimsKey = "claims"

func RequireAuth(auth *service.AuthService) nanoserve.HandlerFunction {
	return func(c *nanoserve.Context) error {
		token := AccessToken(c)
		if token == "" {
			return response.NewApiError("Unauthorized", http.StatusUnauthorized)
		}

		claims, err := auth.Authenticate(c.Request.Context(), token)
		if err != nil {
			return err
		}

		c.Set(ClaimsKey, claims)
		return c.Next()
	}
}

// AccessToken returns the raw access token from the request, if any.
func AccessToken(c *nanoserve.Context) string {
	if h := c.GetHeader("Authorization"); h != "" {
		return strings.TrimPrefix(h, "Bearer ")
	}
	if cookie, err := c.GetCookie("accessToken"); err == nil {
		return cookie.Value
	}
	return ""
}
