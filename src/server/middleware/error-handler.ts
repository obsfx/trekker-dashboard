import { AppError } from '@server/errors';
import {
  type AppErrorStatusCode,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '@server/lib/constants';
import type { Context } from 'hono';

export function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json({ error: err.message, code: err.code }, err.statusCode as AppErrorStatusCode);
  }

  // Zod validation errors from @hono/zod-validator
  if (err.name === 'ZodError') {
    return c.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      HTTP_STATUS_BAD_REQUEST
    );
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  return c.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    HTTP_STATUS_INTERNAL_SERVER_ERROR
  );
}
