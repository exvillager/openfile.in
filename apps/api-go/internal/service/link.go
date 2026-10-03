package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
)

const oneDay = 24 * time.Hour

type planLimit struct {
	maxLinks          int32 // links per 24h window
	maxUploadsPerLink int32
	maxExpiration     time.Duration
}

// planLimits matches the Node backend's link.service.ts.
var planLimits = map[string]planLimit{
	"free":       {maxLinks: 5, maxUploadsPerLink: 2, maxExpiration: 1 * oneDay},
	"pro":        {maxLinks: 100, maxUploadsPerLink: 100, maxExpiration: 15 * oneDay},
	"enterprise": {maxLinks: math.MaxInt32, maxUploadsPerLink: 100, maxExpiration: 30 * oneDay},
}

type LinkService struct {
	pool    *pgxpool.Pool
	queries db.Querier
}

func NewLinkService(pool *pgxpool.Pool, queries db.Querier) *LinkService {
	return &LinkService{pool: pool, queries: queries}
}

type CreateLinkInput struct {
	Name                   string
	MaxUploads             int32
	ExpiresAt              time.Time
	ExpireAfterFirstUpload bool
}

// CreateLink applies the user's plan limits, counts the link against their
// daily quota and creates it, the same way the Node backend does.
func (s *LinkService) CreateLink(ctx context.Context, userID string, in CreateLinkInput) (db.Link, error) {
	var id pgtype.UUID
	if err := id.Scan(userID); err != nil {
		return db.Link{}, errUnauthorized
	}

	user, err := s.queries.GetUserWithPlan(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return db.Link{}, errUnauthorized
	}
	if err != nil {
		return db.Link{}, err
	}

	planName := "free"
	if user.PlanName != nil {
		planName = *user.PlanName
	}
	limits, ok := planLimits[planName]
	if !ok {
		limits = planLimits["free"]
	}

	now := time.Now().UTC()

	// A new 24h window starts on the first link, or once the old window is over.
	resetWindow := user.LinkCount == 0 || !user.LinkCountExpireAt.Valid || now.After(user.LinkCountExpireAt.Time)

	// Only check the limit inside a running window. Node checks it before the
	// reset, so a user who once hit the limit stays blocked forever.
	if !resetWindow && user.LinkCount >= limits.maxLinks {
		return db.Link{}, response.NewApiError(
			fmt.Sprintf("You have reached your daily limit of %d links. Try again after %s",
				limits.maxLinks, user.LinkCountExpireAt.Time.Format("2006-01-02 15:04 UTC")),
			http.StatusForbidden)
	}

	var maxUploads int32
	switch {
	case in.ExpireAfterFirstUpload:
		maxUploads = 1
	case planName == "free":
		maxUploads = limits.maxUploadsPerLink
	case in.MaxUploads > limits.maxUploadsPerLink:
		return db.Link{}, response.NewApiError(
			fmt.Sprintf("You can only upload %d files per link.", limits.maxUploadsPerLink),
			http.StatusBadRequest)
	default:
		maxUploads = in.MaxUploads
	}

	expiresAt := in.ExpiresAt.UTC()
	if expiresAt.Sub(now) > limits.maxExpiration {
		expiresAt = now.Add(limits.maxExpiration)
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return db.Link{}, err
	}
	defer tx.Rollback(ctx)

	q := db.New(tx)

	if resetWindow {
		err = q.ResetUserLinkCount(ctx, db.ResetUserLinkCountParams{
			ID:                id,
			LinkCountExpireAt: pgtype.Timestamp{Time: now.Add(oneDay), Valid: true},
		})
	} else {
		err = q.IncrementUserLinkCount(ctx, id)
	}
	if err != nil {
		return db.Link{}, err
	}

	name := in.Name
	link, err := q.CreateLink(ctx, db.CreateLinkParams{
		ID:                     newID(),
		Token:                  uuid.Must(uuid.NewV7()).String(),
		Name:                   &name,
		MaxUploads:             maxUploads,
		ExpiresAt:              pgtype.Timestamp{Time: expiresAt, Valid: true},
		ExpireAfterFirstUpload: in.ExpireAfterFirstUpload,
		UserId:                 id,
	})
	if err != nil {
		return db.Link{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return db.Link{}, err
	}

	return link, nil
}
