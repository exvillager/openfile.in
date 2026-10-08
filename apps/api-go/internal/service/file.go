package service

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
)

// pendingUploadGrace is added on top of the upload URL's lifetime before a
// still-PENDING File row counts as abandoned (Node's PENDING_UPLOAD_GRACE).
const pendingUploadGrace = 15 * time.Minute

var (
	errLinkNotFoundOrExpired = response.NewApiError("Link not found or expired", http.StatusNotFound)
	errUploadNotAllowed      = response.NewApiError("Unable to process upload at this time.", http.StatusForbidden)
	errNoPendingUpload       = response.NewApiError("No pending upload found for this key.", http.StatusNotFound)
)

type FileService struct {
	pool    *pgxpool.Pool
	queries db.Querier
	storage *StorageService
}

func NewFileService(pool *pgxpool.Pool, queries db.Querier, storage *StorageService) *FileService {
	return &FileService{pool: pool, queries: queries, storage: storage}
}

// activeLink returns the link for an upload token, or 404 if it doesn't exist
// or has expired (Node's validateToken middleware).
func (s *FileService) activeLink(ctx context.Context, token string) (db.Link, error) {
	link, err := s.queries.GetLinkByToken(ctx, token)
	if errors.Is(err, pgx.ErrNoRows) {
		return db.Link{}, errLinkNotFoundOrExpired
	}
	if err != nil {
		return db.Link{}, err
	}
	if link.ExpiresAt.Time.Before(time.Now().UTC()) {
		return db.Link{}, errLinkNotFoundOrExpired
	}
	return link, nil
}

// CreateUploadURL checks the link can still take uploads, presigns a PUT URL
// and reserves a PENDING File row for it, like the Node backend.
func (s *FileService) CreateUploadURL(ctx context.Context, token, mimeType string, size int64) (uploadURL, key string, err error) {
	link, err := s.activeLink(ctx, token)
	if err != nil {
		return "", "", err
	}

	// Node also reserves a slot in Redis first; without Redis this is the only check.
	if link.UploadCount >= link.MaxUploads {
		return "", "", errUploadNotAllowed
	}

	uploadURL, key, err = s.storage.PresignUpload(ctx, mimeType, size)
	if err != nil {
		return "", "", err
	}

	// Refuse to hand out a URL for a key we aren't tracking.
	if _, err := s.queries.CreatePendingFile(ctx, db.CreatePendingFileParams{
		ID:           newID(),
		Url:          s.storage.ObjectURL(key),
		Key:          key,
		Size:         size,
		ExpiresAt:    pgtype.Timestamp{Time: time.Now().UTC().Add(UploadURLTTL + pendingUploadGrace), Valid: true},
		UserId:       link.UserId,
		UploadLinkId: link.ID,
	}); err != nil {
		return "", "", err
	}

	return uploadURL, key, nil
}

// ConfirmUpload marks the PENDING file for key as CONFIRMED and counts it
// against the link, in one transaction. Unlike Node, the link's maxUploads is
// enforced here, so parallel uploads can't go over it.
func (s *FileService) ConfirmUpload(ctx context.Context, token, key, name string) error {
	link, err := s.activeLink(ctx, token)
	if err != nil {
		return err
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	q := db.New(tx)

	counted, err := q.IncrementLinkUploadCount(ctx, link.ID)
	if err != nil {
		return err
	}
	if counted == 0 {
		return errUploadNotAllowed
	}

	if _, err := q.ConfirmPendingFile(ctx, db.ConfirmPendingFileParams{
		Name:   name,
		Key:    key,
		LinkID: link.ID,
		UserID: link.UserId,
	}); err != nil {
		// No PENDING row for this key on this link: never issued here, already
		// confirmed, or swept after its deadline. The count rolls back too.
		if errors.Is(err, pgx.ErrNoRows) {
			return errNoPendingUpload
		}
		return err
	}

	return tx.Commit(ctx)
}
