export const RATE_LIMIT = parseInt(process.env.UPLOAD_RATE_LIMIT) || 60
export const WINDOW = parseInt(process.env.UPLOAD_RATE_WINDOW) || 60

export const REFRESH_TOKEN_RATE_LIMIT = parseInt(process.env.REFRESH_TOKEN_RATE_LIMIT) || 10
export const REFRESH_TOKEN_RATE_WINDOW = parseInt(process.env.REFRESH_TOKEN_RATE_WINDOW) || 60

// How long a presigned upload URL stays valid, in seconds.
export const UPLOAD_URL_TTL = 3600

// Grace period added on top of UPLOAD_URL_TTL before a still-PENDING File row is
// treated as abandoned. Covers a slow upload that started just before the URL expired.
export const PENDING_UPLOAD_GRACE = 15 * 60

// Rows pulled per iteration by the abandoned-upload sweep.
export const PENDING_UPLOAD_BATCH_SIZE = 100
