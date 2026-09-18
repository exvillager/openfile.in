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

func Health(ctx context.Context, queries *db.Queries) (response.ApiResponse[HealthStatus], error) {
	if _, err := queries.Ping(ctx); err != nil {
		return response.ApiResponse[HealthStatus]{}, response.NewApiError("database unreachable", http.StatusServiceUnavailable)
	}

	return response.New(http.StatusOK, "", HealthStatus{Status: "ok", DB: "ok"}), nil
}
