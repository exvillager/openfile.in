import { HTTPException } from "diesel-core/http-exception";
import { ContextType } from "diesel-core";
import { connInfo } from "diesel-core/bun";
import { redis } from "../config/redis";
import { AUTH_RATE_LIMIT, AUTH_RATE_WINDOW } from "../../constant";

export const getClientIp = (c: ContextType): string | null => {
  // Behind the prod reverse proxy (Caddy) the TCP peer is always the proxy
  // itself, which would collapse every caller into one rate-limit bucket. We
  // therefore read the real client IP from X-Forwarded-For.
  //
  // Trust model: Caddy's reverse_proxy APPENDS the real client IP to any
  // incoming X-Forwarded-For, so the genuine client is the LAST entry. A client
  // can prepend spoofed values, but it cannot forge the entry Caddy appends, so
  // we read from the end. We deliberately do NOT trust X-Real-IP because Caddy
  // does not set/overwrite it by default, which would make it client-spoofable.
  const forwarded = c.req?.headers?.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  const ipInfo: string | object | null = connInfo(c as any) as any;
  if (ipInfo && typeof ipInfo === "object" && "address" in ipInfo) return (ipInfo as any).address;
  if (typeof ipInfo === "string") return ipInfo;
  return null;
};

export const enforceRateLimit = async (
  key: string,
  limit: number,
  window: number,
): Promise<void> => {
  const current = Number(await redis.incr(key));
  if (current === 1) await redis.expire(key, window);

  if (current > limit) {
    throw new HTTPException(429, {
      message: "Too many requests. Try again later.",
      cause: "Too many requests. Try again later.",
    });
  }
};

// Per-IP brute-force guard for credential endpoints (login/signup).
export const authRateLimit = async (c: ContextType): Promise<Response | void | any> => {
  const ip = getClientIp(c) ?? "unknown";
  await enforceRateLimit(`auth:rate:ip:${ip}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW);
};
