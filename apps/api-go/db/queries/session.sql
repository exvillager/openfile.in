-- name: CreateSession :one
INSERT INTO "Session" (id, "userId", "tokenHash", "refreshTokenHash", "expiresAt")
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetActiveSessionByTokenHash :one
SELECT * FROM "Session"
WHERE "tokenHash" = $1
  AND "revokedAt" IS NULL
  AND "expiresAt" > now()
LIMIT 1;

-- name: GetActiveSessionByRefreshHash :one
SELECT * FROM "Session"
WHERE "refreshTokenHash" = $1
  AND "revokedAt" IS NULL
  AND "expiresAt" > now()
LIMIT 1;

-- RotateSession swaps in the new token pair only if the old refresh token
-- still matches, so two refreshes racing with the same token can't both win.
-- name: RotateSession :execrows
UPDATE "Session"
SET "tokenHash" = @token_hash,
    "refreshTokenHash" = @refresh_token_hash,
    "expiresAt" = @expires_at
WHERE id = @id
  AND "refreshTokenHash" = @old_refresh_token_hash
  AND "revokedAt" IS NULL;

-- Logout keeps the row as a login record and marks it revoked.
-- name: RevokeSession :exec
UPDATE "Session"
SET "revokedAt" = now()
WHERE "tokenHash" = $1 AND "revokedAt" IS NULL;

-- name: RevokeUserSessions :exec
UPDATE "Session"
SET "revokedAt" = now()
WHERE "userId" = $1 AND "revokedAt" IS NULL;
