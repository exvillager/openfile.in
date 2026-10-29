export type SetOptions = {
  PX?: number; // TTL in milliseconds
  EX?: number; // TTL in seconds
  NX?: boolean; // Set only if key does not exist
  XX?: boolean; // Set only if key already exists
};

export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void | string | null>;
  setWithOptions(key: string, value: string, options: SetOptions): Promise<string | null>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}
