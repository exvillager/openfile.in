package controller

import (
	"github.com/exvillager/nanoserve"
	"github.com/exvillager/openfile.in/internal/service"
)

type HealthController struct {
	health *service.HealthService
}

func NewHealthController(health *service.HealthService) *HealthController {
	return &HealthController{health: health}
}

func (hc *HealthController) Check(c *nanoserve.Context) error {
	res, err := hc.health.Check(c.Request.Context())
	if err != nil {
		return err
	}
	return c.Status(res.StatusCode).JSON(res)
}
