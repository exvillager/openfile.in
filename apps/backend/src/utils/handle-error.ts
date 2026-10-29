import { ApiError } from "./apiError";
import { Context } from "diesel-core";

type c = Context;

export function handleErrorResponse(c: c, error: unknown) {
  if (error instanceof ApiError) {
    return c.json({ error: error.message }, error.statusCode);
  }
  console.error(error);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
}
