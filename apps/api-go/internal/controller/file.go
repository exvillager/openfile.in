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
	if req.FileSize == nil {
		return response.NewApiError("File size is required.", http.StatusBadRequest)
	}
	size, ok := req.FileSize.(float64)
	if !ok {
		return response.NewApiError("File size must be a number.", http.StatusBadRequest)
	}
	if size != math.Trunc(size) {
		return response.NewApiError("File size must be a whole number of bytes.", http.StatusBadRequest)
	}
	if size <= 0 {
		return response.NewApiError("File size must be greater than zero.", http.StatusBadRequest)
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
