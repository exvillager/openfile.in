-- One row per file; a sweep that already queued the file is left alone.
-- name: CreateDeletedFile :exec
INSERT INTO "DeletedFile" (id, "fileId", "linkId", "fileUrl")
VALUES ($1, $2, $3, $4)
ON CONFLICT ("fileId") DO NOTHING;
