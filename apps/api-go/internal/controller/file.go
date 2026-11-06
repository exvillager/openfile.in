package controller

import (
	"math"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/libsib/nanoserve"

	"github.com/exvillager/openfile.in/internal/dto"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
	"github.com/exvillager/openfile.in/internal/util"
)

type FileController struct {
	file *service.FileService
}

func NewFileController(file *service.FileService) *FileController {
	return &FileController{file: file}
}

// uploadURLRequest mirrors the Node backend's uploadRequestSchema. FileSize is
// `any` so a missing value and a non-number can get their own messages.
type uploadURLRequest struct {
	MimeType string `json:"mimeType"`
	FileSize any    `json:"fileSize"`
}

// UploadURL is public: the uploader only has the link token (?token=).
func (fc *FileController) UploadURL(c *nanoserve.Context) error {
	token := c.Query("token")
	if token == "" {
		return response.NewApiError("Token is required", http.StatusNotFound)
	}

	var req uploadURLRequest
	if err := c.Bind(&req); err != nil {
		return response.NewApiError("Invalid request body", http.StatusBadRequest)
	}

	// Same messages as uploadRequestSchema.
	size, err := validFileSize(req.FileSize)
	if err != nil {
		return err
	}
	if size != math.Trunc(size) {
		return response.NewApiError("File size must be a whole number of bytes.", http.StatusBadRequest)
	}

	mimeType := req.MimeType
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	url, key, err := fc.file.CreateUploadURL(c.Request.Context(), token, mimeType, int64(size))
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]string{"url": url, "key": key})
}

// notifyUploadRequest mirrors the Node backend's notifyUploadSchema.
type notifyUploadRequest struct {
	S3Key    string `json:"s3Key"`
	FileSize any    `json:"fileSize"`
	Name     string `json:"name"`
}

// NotifyUpload is public, like UploadURL: the uploader calls it with the link
// token once the PUT to storage has finished.
func (fc *FileController) NotifyUpload(c *nanoserve.Context) error {
	token := c.Query("token")
	if token == "" {
		return response.NewApiError("Token is required", http.StatusNotFound)
	}

	var req notifyUploadRequest
	if err := c.Bind(&req); err != nil {
		return response.NewApiError("Invalid request body", http.StatusBadRequest)
	}

	// Same messages as notifyUploadSchema. fileSize is only validated: the
	// stored size comes from the PENDING row the upload URL was signed for.
	if req.S3Key == "" {
		return response.NewApiError("s3Key required", http.StatusBadRequest)
	}
	if _, err := validFileSize(req.FileSize); err != nil {
		return err
	}

	if err := fc.file.ConfirmUpload(c.Request.Context(), token, req.S3Key, req.Name); err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(map[string]string{"message": "File metadata stored and link updated."})
}

// validFileSize checks a JSON fileSize is a positive number.
func validFileSize(v any) (float64, error) {
	if v == nil {
		return 0, response.NewApiError("File size is required.", http.StatusBadRequest)
	}
	size, ok := v.(float64)
	if !ok {
		return 0, response.NewApiError("File size must be a number.", http.StatusBadRequest)
	}
	if size <= 0 {
		return 0, response.NewApiError("File size must be greater than zero.", http.StatusBadRequest)
	}
	return size, nil
}

// ListLinkFiles runs behind RequireAuth: GET /:id/:token/files?page=1&limit=10.
// A malformed id is treated like a link the user doesn't own.
func (fc *FileController) ListLinkFiles(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var userID, linkID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}
	if err := linkID.Scan(c.Param("id")); err != nil {
		return response.NewApiError("No files found or unauthorized access", http.StatusNotFound)
	}

	page := queryInt(c, "page", 1, 1_000_000)
	limit := queryInt(c, "limit", 10, 100)

	files, err := fc.file.ListLinkFiles(c.Request.Context(), userID, linkID, c.Param("token"), page, limit)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]any{
		"message": "Files fetched successfully",
		"success": true,
		"data":    dto.NewFiles(files),
		"page":    page,
		"limit":   limit,
	})
}

// DownloadURL runs behind RequireAuth: GET /signed-url?token=&fileId=.
// Like the Node backend it answers with the full ApiResponse envelope; the
// clients read data.url.
func (fc *FileController) DownloadURL(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	token, rawFileID := c.Query("token"), c.Query("fileId")
	if token == "" || rawFileID == "" {
		return response.NewApiError("Missing or invalid parameters", http.StatusBadRequest)
	}

	var userID, fileID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}
	if err := fileID.Scan(rawFileID); err != nil {
		return response.NewApiError("File not found or unauthorized", http.StatusNotFound)
	}

	url, err := fc.file.DownloadURL(c.Request.Context(), userID, token, fileID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(response.New(http.StatusOK, "URL generated successfully", map[string]string{"url": url}))
}

// StorageUsed runs behind RequireAuth. Full ApiResponse envelope, like Node:
// the clients read data.storageUsed.
func (fc *FileController) StorageUsed(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var userID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	used, err := fc.file.StorageUsed(c.Request.Context(), userID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(response.New(http.StatusOK, "Storage used fetched successfully", map[string]int64{"storageUsed": used}))
}

// DeleteFile runs behind RequireAuth: DELETE /:id/files/:file_id.
func (fc *FileController) DeleteFile(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var userID, linkID, fileID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}
	if err := linkID.Scan(c.Param("id")); err != nil {
		return response.NewApiError("Link is expired or doesn't exist.", http.StatusNotFound)
	}
	if err := fileID.Scan(c.Param("file_id")); err != nil {
		return response.NewApiError("File doesn't exist or Unauthorized", http.StatusNotFound)
	}

	if err := fc.file.DeleteFile(c.Request.Context(), userID, linkID, fileID); err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]string{"message": "File deleted successfully"})
}
