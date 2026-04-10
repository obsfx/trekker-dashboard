import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
} from '@server/lib/constants';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(HTTP_STATUS_NOT_FOUND, 'NOT_FOUND', `${entity} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS_BAD_REQUEST, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS_CONFLICT, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS_INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', message);
    this.name = 'DatabaseError';
  }
}
