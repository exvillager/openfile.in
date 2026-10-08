package service

import (
	"context"
	"fmt"
	"mime"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"

	"github.com/exvillager/openfile.in/internal/config"
)

const (
	// UploadURLTTL and DownloadURLTTL match the Node backend (UPLOAD_URL_TTL and
	// generateSignedDownloadUrl).
	UploadURLTTL   = time.Hour
	DownloadURLTTL = time.Hour

	// maxDeleteBatch is the S3 limit for one DeleteObjects call.
	maxDeleteBatch = 1000
)

// StorageService talks to S3-compatible object storage. The same client
// serves Cloudflare R2, MinIO and AWS S3; only the endpoint differs.
type StorageService struct {
	client  *s3.Client
	presign *s3.PresignClient
	bucket  string
	region  string
}

func NewStorageService(cfg *config.Config) *StorageService {
	client := s3.New(s3.Options{
		Region:      cfg.StorageRegion,
		Credentials: credentials.NewStaticCredentialsProvider(cfg.StorageAccessKey, cfg.StorageSecretKey, ""),
	}, func(o *s3.Options) {
		// R2 and MinIO need a custom endpoint and path-style URLs.
		// AWS S3 uses neither, so leave STORAGE_ENDPOINT empty there.
		if cfg.StorageEndpoint != "" {
			o.BaseEndpoint = aws.String(cfg.StorageEndpoint)
			o.UsePathStyle = true
		}
	})

	return &StorageService{
		client:  client,
		presign: s3.NewPresignClient(client),
		bucket:  cfg.StorageBucket,
		region:  cfg.StorageRegion,
	}
}

// PresignUpload returns a URL the client can PUT the file to, and the new
// object's key. Content-Type and Content-Length are signed, so the upload must
// be exactly size bytes of mimeType or the storage rejects it.
func (s *StorageService) PresignUpload(ctx context.Context, mimeType string, size int64) (uploadURL, key string, err error) {
	key = NewKey(mimeType)

	req, err := s.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(mimeType),
		ContentLength: aws.Int64(size),
	}, s3.WithPresignExpires(UploadURLTTL))
	if err != nil {
		return "", "", err
	}
	return req.URL, key, nil
}

// PresignDownload returns a temporary URL to download an object.
func (s *StorageService) PresignDownload(ctx context.Context, key string) (string, error) {
	req, err := s.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(DownloadURLTTL))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

// DeleteObjects removes the given keys, in batches of 1000.
// It fails if the storage reports an error for any key.
func (s *StorageService) DeleteObjects(ctx context.Context, keys []string) error {
	for start := 0; start < len(keys); start += maxDeleteBatch {
		end := min(start+maxDeleteBatch, len(keys))

		objects := make([]types.ObjectIdentifier, 0, end-start)
		for _, k := range keys[start:end] {
			objects = append(objects, types.ObjectIdentifier{Key: aws.String(k)})
		}

		out, err := s.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
			Bucket: aws.String(s.bucket),
			Delete: &types.Delete{Objects: objects, Quiet: aws.Bool(true)},
		})
		if err != nil {
			return err
		}
		if len(out.Errors) > 0 {
			e := out.Errors[0]
			return fmt.Errorf("delete %s: %s", aws.ToString(e.Key), aws.ToString(e.Message))
		}
	}
	return nil
}

// ObjectURL is the URL stored on a File row. It keeps the S3-shaped host the
// Node backend writes (even on R2) so all rows look the same; only the path
// matters, since KeyFromURL reads the key back from it.
func (s *StorageService) ObjectURL(key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
}

// KeyFromURL returns the object key from a stored File URL (its path, without
// the leading slash), like the Node backend's extractKeyFromUrl.
func KeyFromURL(fileURL string) (string, error) {
	u, err := url.Parse(fileURL)
	if err != nil {
		return "", err
	}
	return strings.TrimPrefix(u.Path, "/"), nil
}

// NewKey builds an object key like the Node backend's getKey:
// uploads/{images|videos|files}/{uuidv7}.{ext}
func NewKey(mimeType string) string {
	return fmt.Sprintf("uploads/%s/%s.%s", folderFor(mimeType), uuid.Must(uuid.NewV7()), extensionFor(mimeType))
}

func folderFor(mimeType string) string {
	switch {
	case strings.HasPrefix(mimeType, "video/"):
		return "videos"
	case strings.HasPrefix(mimeType, "image/"):
		return "images"
	default:
		return "files"
	}
}

// commonExtensions pins the extension for common types. Go's mime package
// returns several extensions per type in no useful order (image/jpeg gives
// .jfif first), while Node's mime-types picks these.
var commonExtensions = map[string]string{
	"image/jpeg":       "jpeg",
	"image/png":        "png",
	"image/gif":        "gif",
	"image/webp":       "webp",
	"image/svg+xml":    "svg",
	"video/mp4":        "mp4",
	"video/quicktime":  "mov",
	"video/webm":       "webm",
	"application/pdf":  "pdf",
	"application/zip":  "zip",
	"text/plain":       "txt",
	"text/csv":         "csv",
	"application/json": "json",
}

func extensionFor(mimeType string) string {
	base, _, _ := strings.Cut(mimeType, ";")
	base = strings.TrimSpace(strings.ToLower(base))

	if ext, ok := commonExtensions[base]; ok {
		return ext
	}
	if exts, err := mime.ExtensionsByType(base); err == nil && len(exts) > 0 {
		return strings.TrimPrefix(exts[0], ".")
	}
	return "bin"
}
