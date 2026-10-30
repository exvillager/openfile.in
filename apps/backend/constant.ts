export const RATE_LIMIT = parseInt(process.env.UPLOAD_RATE_LIMIT) || 60;
export const WINDOW = parseInt(process.env.UPLOAD_RATE_WINDOW) || 60;

export const REFRESH_TOKEN_RATE_LIMIT = parseInt(process.env.REFRESH_TOKEN_RATE_LIMIT) || 10;
export const REFRESH_TOKEN_RATE_WINDOW = parseInt(process.env.REFRESH_TOKEN_RATE_WINDOW) || 60;

// Brute-force protection for credential endpoints (login/signup), per client IP.
export const AUTH_RATE_LIMIT = parseInt(process.env.AUTH_RATE_LIMIT) || 10;
export const AUTH_RATE_WINDOW = parseInt(process.env.AUTH_RATE_WINDOW) || 60;

// How long a presigned upload URL stays valid, in seconds.
export const UPLOAD_URL_TTL = 3600;

// Hard upper bound on a single upload's size, in bytes. The presigned URL pins
// content-length to exactly this value, so without a ceiling a caller could
// reserve an arbitrarily huge object (storage/cost abuse). Tune as needed.
export const MAX_UPLOAD_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1 GiB

// Grace period added on top of UPLOAD_URL_TTL before a still-PENDING File row is
// treated as abandoned. Covers a slow upload that started just before the URL expired.
export const PENDING_UPLOAD_GRACE = 15 * 60;
