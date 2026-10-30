import { ContextType } from "diesel-core";
import { ApiError } from "./apiError";

export function mustGet<T>(c: ContextType, key: string, status: 400 | 401 | 404 | 500 = 401): T {
  const value = c.get<T>(key);
  if (value === undefined) {
    throw new ApiError(`Missing "${key}" in request context`, status);
  }
  return value;
}
