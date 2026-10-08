package service

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/exvillager/openfile.in/internal/db"
	"github.com/exvillager/openfile.in/internal/response"
)

// pendingUploadGrace is added on top of the upload URL's lifetime before a
// still-PENDING File row counts as abandoned (Node's PENDING_UPLOAD_GRACE).
const pendingUploadGrace = 15 * time.Minute

var (
	errLinkNotFoundOrExpired = response.NewApiError("Link not found or expired", http.StatusNotFound)
	errUploadNotAllowed      = response.NewApiError("Unable to process upload at this time.", http.StatusForbidden)
)

type FileService struct {
	queries db.Querier
	storage *StorageService
}

func NewFileService(queries db.Querier, storage *StorageService) *FileService {
	return &FileService{queries: queries, storage: storage}
}

// CreateUploadURL checks the link can still take uploads, presigns a PUT URL
// and reserves a PENDING File row for it, like the Node backend.
func (s *FileService) CreateUploadURL(ctx context.Context, token, mimeType string, size int64) (uploadURL, key string, err error) {
	link, err := s.queries.GetLinkByToken(ctx, token)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", "", errLinkNotFoundOrExpired
	}
	if err != nil {
		return "", "", err
	}

	now := time.Now().UTC()
	if link.ExpiresAt.Time.Before(now) {
		return "", "", errLinkNotFoundOrExpired
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
		ExpiresAt:    pgtype.Timestamp{Time: now.Add(UploadURLTTL + pendingUploadGrace), Valid: true},
		UserId:       link.UserId,
		UploadLinkId: link.ID,
	}); err != nil {
		return "", "", err
	}

	return uploadURL, key, nil
}
