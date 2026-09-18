package main

import (
	"context"
	"log"

	"github.com/exvillager/openfile.in/internal/config"
	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/router"
)

func main() {
	cfg := config.Load()

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
	app := router.New(queries)

	log.Printf("listening on :%s", cfg.Port)
	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
