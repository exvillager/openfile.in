package handler

import (
	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/service"
)

func Health(queries *db.Queries) nanoserve.HandlerFunction {
	return func(c *nanoserve.Context) error {
		res, err := service.Health(c.Request.Context(), queries)
		if err != nil {
			return err
		}
		return c.Status(res.StatusCode).JSON(res)
	}
}
