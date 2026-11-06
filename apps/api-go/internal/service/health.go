package service

import (
	"context"
	"net/http"

	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
)

type HealthStatus struct {
	Status string `json:"status"`
	DB     string `json:"db"`
}

type HealthService struct {
	queries db.Querier
}

func NewHealthService(queries db.Querier) *HealthService {
	return &HealthService{queries: queries}
}

func (s *HealthService) Check(ctx context.Context) (response.ApiResponse[HealthStatus], error) {
	if _, err := s.queries.Ping(ctx); err != nil {
		return response.ApiResponse[HealthStatus]{}, response.NewApiError("database unreachable", http.StatusServiceUnavailable)
	}

	return response.New(http.StatusOK, "", HealthStatus{Status: "ok", DB: "ok"}), nil
}
