import { ICache, SetOptions } from "../interface/cache.interface";
import { redis } from "../config/redis";

export class RedisCache implements ICache {
  private static instance: RedisCache;

  private constructor() {}

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async get(key: string): Promise<string | null> {
    return redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<string | null> {
    if (ttl) {
      return redis.set(key, value, "EX", ttl);
    }
    return redis.set(key, value);
  }

  async setWithOptions(key: string, value: string, options: SetOptions): Promise<string | null> {
    const args: (string | number)[] = [key, value];

    if (options.PX) {
      args.push("PX", options.PX);
    } else if (options.EX) {
      args.push("EX", options.EX);
    }

    if (options.NX) {
      args.push("NX");
    } else if (options.XX) {
      args.push("XX");
    }

    if (args.length > 2) {
      return redis.set(
        args[0] as string,
        args[1] as string,
        ...(args.slice(2) as [any, any, any, any]),
      );
    }
    return redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return redis.del(key);
  }

  async incr(key: string): Promise<number> {
    return redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return redis.expire(key, seconds);
  }
}
