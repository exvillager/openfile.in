# api-go: port of the Node backend

Tick a box when it's done. The "Node" column is where the existing
behaviour lives in `apps/backend/src`, so the Go version can match it.

## Foundation

- [x] Config from env (`.env` locally)
- [x] Postgres pool (pgx) + sqlc
- [x] Migrations on startup (golang-migrate, embedded)
- [x] `scripts/db-gen.sh` (atlas diff + sqlc generate)
- [x] Local Postgres (`compose.local.yml`)
- [x] Error handler (`ApiError` → JSON) for app and sub-routers
- [x] `GET /health`
- [ ] CORS (allowed origins + credentials), like `app.ts`
- [ ] Request logging
- [ ] Prometheus `/metrics`, like `app.ts`
- [ ] Graceful shutdown
- [ ] Dockerfile + compose for the VPS

## Auth: `/api/v1/auth`

| Status | Route | Node |
|---|---|---|
| [x] | `POST /signup` | `auth.controller.ts` (disabled in Node) |
| [x] | `POST /login` | `auth.controller.ts` |
| [x] | `GET /check` | `auth.controller.ts` + `authJwt` |
| [x] | `GET /logout` | `auth.controller.ts` |
| [x] | `GET /refresh-token` | `fetchUserFromRefreshToken` |

- [x] Sessions table: access + refresh hash, revoke on logout, rotate on refresh
- [x] `RequireAuth` middleware (header or cookie)
- [ ] Rate limit refresh per IP and per user (Node uses Redis)
- [ ] Decide: keep signup open, or disable it like Node

## Links: `/api/v1/link`

| Status | Route | Node |
|---|---|---|
| [ ] | `GET /` (user's links, search + paging) | `fetchUserLinks` + `getUserLinks` |
| [ ] | `GET /count` | `getLinksCount` |
| [ ] | `GET /validate` | `validateLink` |
| [x] | `POST /` (create link, plan limits) | `generateLink` → `GenerateLinkForUpload` |
| [ ] | `DELETE /:id` | `fetchLinkWithUser` + `deleteLink` |

## Files: `/api/v1/file`

| Status | Route | Node |
|---|---|---|
| [ ] | `GET /:id/:token/files` | `fetchFilesByTokenMiddleware` + `getFilesByLinkToken` |
| [ ] | `GET /storage-used` | `storeageUsed` |
| [ ] | `GET /signed-url` (download) | `getDownloadPresignedUrl` |
| [ ] | `POST /upload-url` (presigned upload) | `UploadRateLimit` + `validateToken` + `validateLinkAccess` |
| [ ] | `POST /notify-upload` | `validateToken` + `notifyFileUpload` |
| [ ] | `DELETE /:id/files/:file_id` | `deleteFileFromLink` |

- [ ] S3 / R2 client (`s3.service.ts`, `r2.cloudflare.ts`)
- [ ] Upload rate limit

## Background jobs

Node runs these with BullMQ + Redis (`cleanup.service.ts`).

- [ ] Expired link cleanup (every 10m)
- [ ] Abandoned upload cleanup: PENDING files past `expiresAt`
- [ ] Delete-file queue + worker (storage delete, mark DELETED/FAILED)
- [ ] Requeue PENDING/FAILED `DeletedFile` rows
- [ ] Single-runner lock so only one instance sweeps at a time
- [ ] Expired session cleanup (decide: delete, or keep as login history)

## Other

- [ ] Mail / notifications (`mail.service.ts`, `notification.service.ts`)
- [ ] Payments / subscription webhooks (`SubscriptionLog` table)
- [ ] Redis client (rate limits, queues, cache)

## Follow-ups and known issues

- [ ] nanoserve: route middleware is attached per path, not per method, so a
      wrong method returns an empty 200 instead of 404/405 (fix in nanoserve)
- [ ] Shorten the access token (5d → ~15m) now that refresh works
- [ ] Passwords over 72 bytes: confirm how Bun pre-hashes them before cutover
- [ ] Confirm prod Postgres runs in UTC (session `expiresAt` is a UTC timestamp)
- [ ] Shared prod DB with Node? Decide who owns migrations before deploying
- [ ] GitGuardian finding #27256216: mark as false positive
- [ ] Tests (service + handler)
