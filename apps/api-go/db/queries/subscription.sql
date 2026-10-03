-- name: CreateSubscription :one
INSERT INTO "Subscription" (id, "userId", "planName")
VALUES ($1, $2, $3)
RETURNING *;
