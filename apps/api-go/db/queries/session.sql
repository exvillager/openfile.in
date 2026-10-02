-- name: CreateSession :one
INSERT INTO "Session" (id, "userId", "tokenHash", "expiresAt")
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetActiveSessionByTokenHash :one
SELECT * FROM "Session"
WHERE "tokenHash" = $1
  AND "revokedAt" IS NULL
  AND "expiresAt" > now()
LIMIT 1;

-- Logout keeps the row as a login record and marks it revoked.
-- name: RevokeSession :exec
UPDATE "Session"
SET "revokedAt" = now()
WHERE "tokenHash" = $1 AND "revokedAt" IS NULL;

-- name: RevokeUserSessions :exec
UPDATE "Session"
SET "revokedAt" = now()
WHERE "userId" = $1 AND "revokedAt" IS NULL;
