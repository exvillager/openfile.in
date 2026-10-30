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
		Name:      u.Name,
		CreatedAt: u.CreatedAt.Time,
		UpdatedAt: u.UpdatedAt.Time,
		Plan:      "free",
	}
}

// CurrentUser is what /auth/check returns, matching the Node backend's
// findUserAndPlanName shape.
type CurrentUser struct {
	ID                string        `json:"id"`
	Name              *string       `json:"name"`
	Email             *string       `json:"email"`
	Username          string        `json:"username"`
	LinkCount         int32         `json:"linkCount"`
	LinkCountExpireAt *time.Time    `json:"linkCountExpireAt"`
	Subscription      *Subscription `json:"subscription"`
}

type Subscription struct {
	PlanName string `json:"planName"`
}

func NewCurrentUser(u db.GetUserWithPlanRow) CurrentUser {
	cu := CurrentUser{
		ID:        u.ID.String(),
		Name:      u.Name,
		Email:     u.Email,
		Username:  u.Username,
		LinkCount: u.LinkCount,
	}
	if u.LinkCountExpireAt.Valid {
		cu.LinkCountExpireAt = &u.LinkCountExpireAt.Time
	}
	if u.PlanName != nil {
		cu.Subscription = &Subscription{PlanName: *u.PlanName}
	}
	return cu
}
