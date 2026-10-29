import { uuidv7 } from "uuidv7";
import * as mime from "mime-types";

export const getFolderByMime = (mimeType: string) => {
  if (mimeType.startsWith("video/")) return "videos";
  if (mimeType.startsWith("image/")) return "images";
  return "files";
};

export const getKey = (mimeType: string) => {
  const ext = mime.extension(mimeType) || "bin";
  const folder = getFolderByMime(mimeType);
  return `uploads/${folder}/${uuidv7()}.${ext}`;
};

export function calculateTTL(fileSizeBytes: number): number {
  const MB = 1024 * 1024;
  const sizeInMB = fileSizeBytes / MB;

  // Base time: 30 seconds per 10MB
  const baseTTL = Math.ceil(sizeInMB / 10) * 30;

  // Cap TTL between 30s and 600s (10 min)
  return Math.min(Math.max(baseTTL, 30), 600);
}

export const script = `
local key = KEYS[1]
local max = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local expireAfterFirst = tonumber(ARGV[3])

local current = redis.call("GET", key)
if not current then
  redis.call("SET", key, 1, "EX", ttl)
  return 1
end

current = tonumber(current)
if current >= max then
  return -1
end

current = redis.call("INCR", key)

-- If expireAfterFirstUpload and count > 1, reject
if expireAfterFirst == 1 and current > 1 then
  return -2
end

return current
`;
