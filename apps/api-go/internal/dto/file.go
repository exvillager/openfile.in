package dto

import (
	"time"

	"github.com/exvillager/openfile.in/internal/db"
)

// File is one entry in a link's file list, matching the Node backend.
type File struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Url       string    `json:"url"`
	Size      int64     `json:"size"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewFiles never returns nil, so an empty list encodes as [].
func NewFiles(rows []db.ListLinkFilesRow) []File {
	files := make([]File, 0, len(rows))
	for _, r := range rows {
		files = append(files, File{
			ID:        r.ID.String(),
			Name:      r.Name,
			Url:       r.Url,
			Size:      r.Size,
			CreatedAt: r.CreatedAt.Time,
		})
	}
	return files
}
