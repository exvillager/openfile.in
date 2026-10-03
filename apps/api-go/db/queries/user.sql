-- name: GetUserByUsername :one
SELECT * FROM "User"
WHERE username = $1
LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM "User"
WHERE id = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO "User" (id, username, name, passoword)
VALUES ($1, $2, $2, $3)
RETURNING *;

-- name: GetUserWithPlan :one
SELECT u.id, u.name, u.email, u.username, u."linkCount", u."linkCountExpireAt", s."planName"
FROM "User" u
LEFT JOIN "Subscription" s ON s."userId" = u.id
WHERE u.id = $1
LIMIT 1;
