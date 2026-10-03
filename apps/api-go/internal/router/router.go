package router

import (
	"errors"
	"log"
	"net/http"

	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/controller"
	"github.com/exvillager/openfile.in/internal/response"
)

func handleError(c *nanoserve.Context, err error) {
	if apiErr, ok := errors.AsType[*response.ApiError](err); ok {
		c.Status(apiErr.StatusCode).JSON(map[string]string{"error": apiErr.Message})
		return
	}

	log.Println(err)
	c.Status(http.StatusInternalServerError).JSON(map[string]string{"error": "Something went wrong. Please try again."})
}

// Controllers groups every controller the router mounts. Add new ones here.
type Controllers struct {
	Health *controller.HealthController
	Auth   *controller.AuthController
	Link   *controller.LinkController
}

// newRouter returns a nanoserve instance that reports errors with handleError.
// Sub-routers need it too: Sub runs a sub-router's errors through its own
// ErrorHandler, and nanoserve's default turns every error into a plain-text 500.
func newRouter() *nanoserve.NanoServe {
	r := nanoserve.New()
	r.ErrorHandler = handleError
	return r
}

// Middlewares groups the middleware the router attaches to routes.
type Middlewares struct {
	RequireAuth nanoserve.HandlerFunction
}

func New(c Controllers, m Middlewares) *nanoserve.NanoServe {
	app := newRouter()

	app.GET("/health", c.Health.Check)

	// sub routes application
	app.Sub("/api/v1/auth/*", AuthRouter(c.Auth, m))
	app.Sub("/api/v1/link/*", LinkRouter(c.Link, m))
	return app
}

func AuthRouter(auth *controller.AuthController, m Middlewares) *nanoserve.NanoServe {
	r := newRouter()
	r.POST("/login", auth.Login)
	r.POST("/signup", auth.Signup)
	r.GET("/logout", m.RequireAuth, auth.Logout)
	r.GET("/refresh-token", auth.RefreshToken)
	r.GET("/check", m.RequireAuth, auth.Check)
	return r
}

func LinkRouter(link *controller.LinkController, m Middlewares) *nanoserve.NanoServe {
	r := newRouter()
	r.POST("/", m.RequireAuth, link.Create)
	return r
}
