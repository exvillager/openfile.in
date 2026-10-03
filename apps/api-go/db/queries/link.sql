-- name: CreateLink :one
INSERT INTO "Link" (id, token, name, "maxUploads", "uploadCount", "expiresAt", "expireAfterFirstUpload", "userId")
VALUES ($1, $2, $3, $4, 0, $5, $6, $7)
RETURNING *;

-- name: ResetUserLinkCount :exec
UPDATE "User"
SET "linkCount" = 1, "linkCountExpireAt" = $2
WHERE id = $1;

-- name: IncrementUserLinkCount :exec
UPDATE "User"
SET "linkCount" = "linkCount" + 1
WHERE id = $1;
