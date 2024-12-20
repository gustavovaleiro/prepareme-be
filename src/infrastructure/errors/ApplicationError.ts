export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id?: string) {
    super(
      'RESOURCE_NOT_FOUND',
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      404
    );
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super('DATABASE_ERROR', message, 500, details);
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(service: string, message: string, details?: unknown) {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502, details);
  }
}

export class TimeoutError extends ApplicationError {
  constructor(operation: string) {
    super('TIMEOUT_ERROR', `Operation ${operation} timed out`, 504);
  }
}