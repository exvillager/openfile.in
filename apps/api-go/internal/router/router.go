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
}

func New(c Controllers) *nanoserve.NanoServe {
	app := nanoserve.New()
	app.ErrorHandler = handleError

	app.GET("/health", c.Health.Check)

	// sub routes application
	app.Sub("/api/v1/auth/*", AuthRouter(c.Auth))
	return app
}

func AuthRouter(auth *controller.AuthController) *nanoserve.NanoServe {
	r := nanoserve.New()
	r.POST("/login", auth.Login)
	r.POST("/signup", auth.Signup)
	r.POST("/logout", auth.Logout)
	r.POST("/refresh-token", auth.RefreshToken)
	r.POST("/check", auth.Check)
	return r
}
