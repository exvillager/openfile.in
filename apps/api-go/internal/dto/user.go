package dto

import (
	"time"

	"github.com/exvillager/openfile.in/internal/db"
)

// User is the public shape of a user, matching the Node backend's UserDTO.
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     *string   `json:"email"`
	Avatar    *string   `json:"avatar"`
	Name      *string   `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Plan      string    `json:"plan"`
}

func NewUser(u db.User) User {
	return User{
		ID:        u.ID.String(),
		Username:  u.Username,
		Email:     u.Email,
		Avatar:    u.Avatar,
		Name:      u.Name,
		CreatedAt: u.CreatedAt.Time,
		UpdatedAt: u.UpdatedAt.Time,
		Plan:      "free",
	}
}
