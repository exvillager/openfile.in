package dto

import (
	"time"

	"github.com/exvillager/openfile.in/internal/db"
)

// Link is one entry in the user's link list, matching the Node backend's findUserLinks.
type Link struct {
	ID          string    `json:"id"`
	Name        *string   `json:"name"`
	Token       string    `json:"token"`
	CreatedAt   time.Time `json:"createdAt"`
	MaxUploads  int32     `json:"maxUploads"`
	ExpiresAt   time.Time `json:"expiresAt"`
	UploadCount int32     `json:"uploadCount"`
}

// NewLinks never returns nil, so an empty list encodes as [] and clients can
// read .length on it.
func NewLinks(rows []db.ListUserLinksRow) []Link {
	links := make([]Link, 0, len(rows))
	for _, r := range rows {
		links = append(links, Link{
			ID:          r.ID.String(),
			Name:        r.Name,
			Token:       r.Token,
			CreatedAt:   r.CreatedAt.Time,
			MaxUploads:  r.MaxUploads,
			ExpiresAt:   r.ExpiresAt.Time,
			UploadCount: r.UploadCount,
		})
	}
	return links
}
