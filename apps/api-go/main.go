package main

import (
	"context"
	"log"

	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/controller"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/middleware"
	"github.com/exvillager/openfile.in/internal/router"
	"github.com/exvillager/openfile.in/internal/service"
)

func main() {
	cfg := config.Load()

	if err := db.Migrate(cfg.DatabaseURL); err != nil {
		log.Fatalf("db migrate: %v", err)
	}

	ctx := context.Background()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("db ping: %v", err)
	}

	queries := db.New(pool)

	authService := service.NewAuthService(pool, queries, cfg)

	app := router.New(router.Controllers{
		Health: controller.NewHealthController(service.NewHealthService(queries)),
		Auth:   controller.NewAuthController(authService, cfg),
		Link:   controller.NewLinkController(service.NewLinkService(pool, queries)),
	}, router.Middlewares{
		RequireAuth: middleware.RequireAuth(authService),
	})

	log.Printf("listening on :%s", cfg.Port)
	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
