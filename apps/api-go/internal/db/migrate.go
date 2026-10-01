package db

import (
	"errors"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"

	dbfiles "github.com/exvillager/openfile.in/db"
)

// Migrate applies any pending migrations embedded in the binary.
func Migrate(databaseURL string) error {
	src, err := iofs.New(dbfiles.Migrations, "migrations")
	if err != nil {
		return err
	}

	// golang-migrate's pgx v5 driver is registered under the pgx5:// scheme.
	url := databaseURL
	for _, scheme := range []string{"postgresql://", "postgres://"} {
		if strings.HasPrefix(url, scheme) {
			url = "pgx5://" + strings.TrimPrefix(url, scheme)
			break
		}
	}

	m, err := migrate.NewWithSourceInstance("iofs", src, url)
	if err != nil {
		return err
	}
	defer m.Close()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	return nil
}
