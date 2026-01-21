import type { Context } from "hono";
import { AppError } from "../errors";

export function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json(
      { error: err.message, code: err.code },
      err.statusCode as 400 | 404 | 409 | 500
    );
  }

  // Zod validation errors from @hono/zod-validator
  if (err.name === "ZodError") {
    return c.json(
      { error: "Validation failed", code: "VALIDATION_ERROR" },
      400
    );
  }

  // Unexpected errors
  console.error("Unhandled error:", err);
  return c.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    500
  );
}
