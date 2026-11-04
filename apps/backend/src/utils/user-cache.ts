import { ICache } from "../interface/cache.interface";
import { UserWithPlan } from "../interface/user.interface";
import { USER_CACHE_TTL } from "../../constant";

// Centralised keys + helpers for caching authenticated user lookups in Redis.
//
// Why: `authJwt` / `fetchUser` style middlewares hit the DB on every request to
// resolve the user from the token. The user row changes rarely, so we front it
// with a short-TTL Redis cache (read-through + explicit eviction on writes).
//
// Keys are keyed by user id (not token) so a single cache entry is shared across
// all of a user's tokens/requests, and eviction is a single, predictable key.

const planKey = (id: string) => `user:plan:${id}`;
const idKey = (id: string) => `user:id:${id}`;

type CachedUserId = { id: string };

// Drizzle returns Date objects; JSON round-trips them to strings. Revive the few
// date fields we cache so downstream code (e.g. linkCountExpireAt comparisons /
// writes) keeps working exactly as if it came straight from the DB.
function reviveUserWithPlan(raw: any): UserWithPlan {
  return {
    ...raw,
    linkCountExpireAt: raw.linkCountExpireAt ? new Date(raw.linkCountExpireAt) : null,
  };
}

async function safeGet(cache: ICache, key: string): Promise<string | null> {
  try {
    return await cache.get(key);
  } catch (err) {
    // Cache must never break auth — fall back to the DB on any Redis error.
    console.error("user-cache get error:", key, err);
    return null;
  }
}

async function safeSet(cache: ICache, key: string, value: unknown): Promise<void> {
  try {
    await cache.set(key, JSON.stringify(value), USER_CACHE_TTL);
  } catch (err) {
    console.error("user-cache set error:", key, err);
  }
}

export async function getCachedUserWithPlan(
  cache: ICache,
  id: string,
): Promise<UserWithPlan | null> {
  const cached = await safeGet(cache, planKey(id));
  if (!cached) return null;
  try {
    return reviveUserWithPlan(JSON.parse(cached));
  } catch {
    return null;
  }
}

export async function setCachedUserWithPlan(
  cache: ICache,
  id: string,
  user: UserWithPlan,
): Promise<void> {
  await safeSet(cache, planKey(id), user);
}

export async function getCachedUserId(cache: ICache, id: string): Promise<CachedUserId | null> {
  const cached = await safeGet(cache, idKey(id));
  if (!cached) return null;
  try {
    return JSON.parse(cached) as CachedUserId;
  } catch {
    return null;
  }
}

export async function setCachedUserId(
  cache: ICache,
  id: string,
  user: CachedUserId,
): Promise<void> {
  await safeSet(cache, idKey(id), user);
}

// Drop every cached representation of a user. Call after any write that mutates
// the user row (link creation bumps linkCount/linkCountExpireAt, plan changes,
// logout, etc.) so the next request re-reads fresh data from the DB.
export async function invalidateUserCache(cache: ICache, id: string): Promise<void> {
  try {
    await Promise.all([cache.del(planKey(id)), cache.del(idKey(id))]);
  } catch (err) {
    console.error("user-cache invalidate error:", id, err);
  }
}
