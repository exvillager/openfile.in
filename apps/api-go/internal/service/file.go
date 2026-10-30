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
	errNoFilesOrUnauthorized = response.NewApiError("No files found or unauthorized access", http.StatusNotFound)
	errInvalidLink           = response.NewApiError("Invalid link or unauthorized", http.StatusNotFound)
	errFileNotFound          = response.NewApiError("File not found or unauthorized", http.StatusNotFound)
	errLinkGone              = response.NewApiError("Link is expired or doesn't exist.", http.StatusNotFound)
	errFileGone              = response.NewApiError("File doesn't exist or Unauthorized", http.StatusNotFound)
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

// ListLinkFiles returns one page of a link's uploaded files. The link must
// belong to the user and match both its id and token, like the Node backend.
func (s *FileService) ListLinkFiles(ctx context.Context, userID, linkID pgtype.UUID, token string, page, limit int32) ([]db.ListLinkFilesRow, error) {
	if _, err := s.queries.GetUserLinkByIDAndToken(ctx, db.GetUserLinkByIDAndTokenParams{
		ID:     linkID,
		UserId: userID,
		Token:  token,
	}); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errNoFilesOrUnauthorized
		}
		return nil, err
	}

	return s.queries.ListLinkFiles(ctx, db.ListLinkFilesParams{
		LinkID:     linkID,
		PageOffset: (page - 1) * limit,
		PageLimit:  limit,
	})
}

// DownloadURL returns a temporary download URL for one of the user's
// uploaded files on the link with this token.
func (s *FileService) DownloadURL(ctx context.Context, userID pgtype.UUID, token string, fileID pgtype.UUID) (string, error) {
	link, err := s.queries.GetLinkByToken(ctx, token)
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && link.UserId != userID) {
		return "", errInvalidLink
	}
	if err != nil {
		return "", err
	}

	file, err := s.queries.GetConfirmedLinkFile(ctx, db.GetConfirmedLinkFileParams{
		ID:           fileID,
		UserId:       userID,
		UploadLinkId: link.ID,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errFileNotFound
	}
	if err != nil {
		return "", err
	}

	return s.storage.PresignDownload(ctx, file.Key)
}

// StorageUsed returns the total bytes of the user's uploaded files.
func (s *FileService) StorageUsed(ctx context.Context, userID pgtype.UUID) (int64, error) {
	return s.queries.SumUserStorage(ctx, userID)
}

// DeleteFile removes one file from a user's link. Like DeleteLink, it first
// queues the object in DeletedFile for the delete worker, all in one
// transaction. uploadCount isn't decremented: it counts uploads over the
// link's lifetime.
func (s *FileService) DeleteFile(ctx context.Context, userID, linkID, fileID pgtype.UUID) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	q := db.New(tx)

	if _, err := q.GetUserLink(ctx, db.GetUserLinkParams{ID: linkID, UserId: userID}); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errLinkGone
		}
		return err
	}

	file, err := q.GetUserFile(ctx, db.GetUserFileParams{ID: fileID, UserId: userID})
	if errors.Is(err, pgx.ErrNoRows) {
		return errFileGone
	}
	if err != nil {
		return err
	}
	if file.UploadLinkId != linkID {
		return response.NewApiError("Unauthorized", http.StatusForbidden)
	}

	if err := q.CreateDeletedFile(ctx, db.CreateDeletedFileParams{
		ID:      newID(),
		FileId:  file.ID,
		LinkId:  linkID,
		FileUrl: file.Url,
	}); err != nil {
		return err
	}

	deleted, err := q.DeleteLinkFile(ctx, db.DeleteLinkFileParams{ID: fileID, UploadLinkId: linkID, UserId: userID})
	if err != nil {
		return err
	}
	if deleted == 0 {
		return response.NewApiError("Failed to delete file.", http.StatusInternalServerError)
	}

	return tx.Commit(ctx)
}
