package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string

	AccessTokenSecret  string
	AccessTokenExpiry  time.Duration
	RefreshTokenSecret string
	RefreshTokenExpiry time.Duration
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

		AccessTokenSecret:  mustGet("ACCESS_TOKEN_SECRET"),
		AccessTokenExpiry:  mustDuration("ACCESS_TOKEN_EXPIRY"),
		RefreshTokenSecret: mustGet("REFRESH_TOKEN_SECRET"),
		RefreshTokenExpiry: mustDuration("REFRESH_TOKEN_EXPIRY"),
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

// mustDuration reads a duration like "15m", "12h" or "5d". Go's
// time.ParseDuration has no day unit, so "d" is handled here to keep
// the same values the Node backend uses.
func mustDuration(key string) time.Duration {
	val := mustGet(key)

	if days, ok := strings.CutSuffix(val, "d"); ok {
		n, err := strconv.Atoi(days)
		if err != nil {
			panic(key + " is not a valid duration: " + val)
		}
		return time.Duration(n) * 24 * time.Hour
	}

	d, err := time.ParseDuration(val)
	if err != nil {
		panic(key + " is not a valid duration: " + val)
	}
	return d
}
