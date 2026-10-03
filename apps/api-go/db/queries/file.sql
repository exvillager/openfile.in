-- name: GetLinkFiles :many
SELECT id, url FROM "File"
WHERE "uploadLinkId" = $1;
