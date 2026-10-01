package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
}

func Load() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:        port,
		DatabaseURL: mustGet("DATABASE_URL"),
	}
}

func getEnv(key string) string {
	return os.Getenv(key)
}

func mustGet(key string) string {
	val := getEnv(key)
	if val == "" {
		panic(key + " is missing from env")
	}
	return val
}
