-- name: GetLinkFiles :many
SELECT id, url FROM "File"
WHERE "uploadLinkId" = $1;

-- A PENDING row is reserved before the client uploads, so abandoned uploads
-- can be swept once expiresAt passes. notify-upload confirms it.
-- name: CreatePendingFile :one
INSERT INTO "File" (id, url, key, name, size, status, "expiresAt", "userId", "uploadLinkId")
VALUES ($1, $2, $3, '', $4, 'PENDING', $5, $6, $7)
RETURNING *;

-- Size isn't taken from the client: the upload URL was signed for the
-- PENDING row's size, so that is the real size.
-- name: ConfirmPendingFile :one
UPDATE "File"
SET name = @name, status = 'CONFIRMED', "expiresAt" = NULL, "updatedAt" = now()
WHERE key = @key
  AND "uploadLinkId" = @link_id
  AND "userId" = @user_id
  AND status = 'PENDING'
RETURNING *;
