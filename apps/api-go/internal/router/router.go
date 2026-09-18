package router

import (
	"errors"
	"log"
	"net/http"

	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/handler"
	"github.com/exvillager/openfile.in/internal/response"
)

func New(queries *db.Queries) *nanoserve.NanoServe {
	app := nanoserve.New()
	app.ErrorHandler = handleError

	app.GET("/health", handler.Health(queries))

	return app
}

func handleError(c *nanoserve.Context, err error) {
	if apiErr, ok := errors.AsType[*response.ApiError](err); ok {
		c.Status(apiErr.StatusCode).JSON(map[string]string{"error": apiErr.Message})
		return
	}

	log.Println(err)
	c.Status(http.StatusInternalServerError).JSON(map[string]string{"error": "Something went wrong. Please try again."})
}
