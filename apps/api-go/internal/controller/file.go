package controller

import (
	"math"
	"net/http"

	"github.com/libsib/nanoserve"

	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
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
