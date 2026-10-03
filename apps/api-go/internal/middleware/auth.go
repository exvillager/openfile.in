package middleware

import (
	"net/http"
	"strings"

	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
)

var errUnauthorized = response.NewApiError("Unauthorized", http.StatusUnauthorized)

// RequireAuth lets a request through only with a valid access token whose
// session is still active. It stores the verified token as "token" and its
// *util.Claims as "claims".
// Like the Node backend, it reads the Authorization header first and falls
// back to the accessToken cookie.
func RequireAuth(auth *service.AuthService) nanoserve.HandlerFunction {
	return func(c *nanoserve.Context) error {
		token := accessToken(c)
		if token == "" {
			return errUnauthorized
		}

		claims, err := auth.Authenticate(c.Request.Context(), token)
		if err != nil {
			return err
		}

		c.Set("token", token)
		c.Set("claims", claims)
		return c.Next()
	}
}

func accessToken(c *nanoserve.Context) string {
	if h := c.GetHeader("Authorization"); h != "" {
		return strings.TrimPrefix(h, "Bearer ")
	}
	if cookie, err := c.GetCookie("accessToken"); err == nil {
		return cookie.Value
	}
	return ""
}
