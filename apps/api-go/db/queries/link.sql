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

-- name: CountLink :one
SELECT COUNT(*) AS count 
FROM "Link" 
WHERE "userId" = $1;

-- name: DeleteLink :exec
DELETE FROM "Link" WHERE "userId"=$1 AND "id"=$2;

-- name: GetUserLink :one
SELECT * FROM "Link"
WHERE id = $1 AND "userId" = $2
LIMIT 1;

-- ListUserLinks searches the user's links by name or token, newest first.
-- name: ListUserLinks :many
SELECT id, name, token, "createdAt", "maxUploads", "expiresAt", "uploadCount"
FROM "Link"
WHERE "userId" = @user_id
  AND (name ILIKE '%' || @query::text || '%' OR token ILIKE '%' || @query::text || '%')
ORDER BY "createdAt" DESC
LIMIT @page_limit OFFSET @page_offset;

-- name: GetLinkByToken :one
SELECT * FROM "Link"
WHERE token = $1
LIMIT 1;

-- Counts one more upload only while the link is under maxUploads, so parallel
-- uploads can't push it past the limit. 0 rows means the link is full.
-- name: IncrementLinkUploadCount :execrows
UPDATE "Link"
SET "uploadCount" = "uploadCount" + 1, "updatedAt" = now()
WHERE id = $1 AND "uploadCount" < "maxUploads";

-- name: GetUserLinkByIDAndToken :one
SELECT id FROM "Link"
WHERE id = $1 AND "userId" = $2 AND token = $3
LIMIT 1;
