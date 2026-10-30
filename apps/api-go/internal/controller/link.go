package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/libsib/nanoserve"

	"github.com/exvillager/openfile.in/internal/dto"
	"github.com/exvillager/openfile.in/internal/response"
	"github.com/exvillager/openfile.in/internal/service"
	"github.com/exvillager/openfile.in/internal/util"
)

type LinkController struct {
	link *service.LinkService
}

func NewLinkController(link *service.LinkService) *LinkController {
	return &LinkController{link: link}
}

// createLinkRequest mirrors the Node backend's createLinkSchema.
// MaxUploads and ExpiresAt are pointers so a missing field can be told apart
// from a zero value.
type createLinkRequest struct {
	Name                   string  `json:"name"`
	MaxUploads             *int32  `json:"maxUploads"`
	ExpiresAt              *string `json:"expiresAt"`
	ExpireAfterFirstUpload bool    `json:"expireAfterFirstUpload"`
}

// Create runs behind RequireAuth, which stores the verified claims as "claims".
func (lc *LinkController) Create(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var req createLinkRequest
	if err := c.Bind(&req); err != nil {
		return response.NewApiError("Invalid request body", http.StatusBadRequest)
	}

	// Same messages zod returns for createLinkSchema.
	if req.MaxUploads == nil {
		return response.NewApiError("maxUploads is required", http.StatusBadRequest)
	}
	if *req.MaxUploads < 1 {
		return response.NewApiError("Number must be greater than or equal to 1", http.StatusBadRequest)
	}
	if req.ExpiresAt == nil {
		return response.NewApiError("expiresAt is required", http.StatusBadRequest)
	}
	expiresAt, err := time.Parse(time.RFC3339, *req.ExpiresAt)
	if err != nil {
		return response.NewApiError("Invalid datetime", http.StatusBadRequest)
	}

	link, err := lc.link.CreateLink(c.Request.Context(), claims.ID, service.CreateLinkInput{
		Name:                   req.Name,
		MaxUploads:             *req.MaxUploads,
		ExpiresAt:              expiresAt,
		ExpireAfterFirstUpload: req.ExpireAfterFirstUpload,
	})
	if err != nil {
		return err
	}

	return c.Status(http.StatusCreated).JSON(map[string]string{
		"id":    link.ID.String(),
		"token": link.Token,
	})
}

// Delete runs behind RequireAuth. A malformed id is treated like a link the
// user doesn't own: 404.
func (lc *LinkController) Delete(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var linkID, userID pgtype.UUID
	if err := linkID.Scan(c.Param("id")); err != nil {
		return response.NewApiError("Not Found", http.StatusNotFound)
	}
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	if err := lc.link.DeleteLink(c.Request.Context(), linkID, userID); err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]string{"message": "link deleted successfully"})
}

// Count runs behind RequireAuth and returns {"links": n}, like the Node backend.
func (lc *LinkController) Count(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var userID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	count, err := lc.link.CountLinks(c.Request.Context(), userID)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]int64{"links": count})
}

// List runs behind RequireAuth. Query params match the Node backend:
// ?query=&page=1&limit=10.
func (lc *LinkController) List(c *nanoserve.Context) error {
	claims := c.Get("claims").(*util.Claims)

	var userID pgtype.UUID
	if err := userID.Scan(claims.ID); err != nil {
		return response.NewApiError("Unauthorized", http.StatusUnauthorized)
	}

	page := queryInt(c, "page", 1, 1_000_000)
	limit := queryInt(c, "limit", 10, 100)

	links, err := lc.link.ListLinks(c.Request.Context(), userID, c.Query("query"), page, limit)
	if err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]any{
		"message": "Links fetched successfully",
		"success": true,
		"data":    dto.NewLinks(links),
		"page":    page,
		"limit":   limit,
	})
}

// Validate is public: the upload page calls it with ?token= before showing the form.
func (lc *LinkController) Validate(c *nanoserve.Context) error {
	token := c.Query("token")
	if token == "" {
		return response.NewApiError("pls provide token", http.StatusNotFound)
	}

	if err := lc.link.ValidateLink(c.Request.Context(), token); err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(map[string]string{"message": "Link is valid"})
}

// queryInt reads a positive integer query param, falling back to def when it's
// missing or invalid and capping it at max.
func queryInt(c *nanoserve.Context, key string, def, max int32) int32 {
	n, err := strconv.Atoi(c.Query(key))
	if err != nil || n < 1 {
		return def
	}
	if n > int(max) {
		return max
	}
	return int32(n)
}
