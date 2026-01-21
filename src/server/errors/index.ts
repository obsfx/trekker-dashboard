export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(404, "NOT_FOUND", `${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, "DATABASE_ERROR", message);
    this.name = "DatabaseError";
  }
}
