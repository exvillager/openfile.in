-- name: GetUserByUsername :one
SELECT * FROM "User"
WHERE username = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO "User" (id, username, name, passoword)
VALUES ($1, $2, $2, $3)
RETURNING *;
