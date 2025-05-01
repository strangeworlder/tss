/**
 * Custom error class for application-specific errors
 */
export class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESPONSE_VALIDATION_ERROR = 'RESPONSE_VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * Custom error class for API-related errors with status code support
 */
export class ApiError extends Error {
  /**
   * HTTP status code for the error
   */
  statusCode: number;

  /**
   * Error code for client identification
   */
  code?: string;

  /**
   * Additional error details
   */
  details?: Record<string, any>;

  /**
   * Creates a new ApiError
   *
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param code - Error code for client identification
   * @param details - Additional error details
   */
  constructor(message: string, statusCode = 500, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Properly set prototype for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Converts the error to a JSON response
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }

  /**
   * Creates a BadRequest (400) error
   */
  static badRequest(message: string, code?: string, details?: Record<string, any>) {
    return new ApiError(message, 400, code || 'BAD_REQUEST', details);
  }

  /**
   * Creates an Unauthorized (401) error
   */
  static unauthorized(message = 'Unauthorized', code?: string, details?: Record<string, any>) {
    return new ApiError(message, 401, code || 'UNAUTHORIZED', details);
  }

  /**
   * Creates a Forbidden (403) error
   */
  static forbidden(message = 'Forbidden', code?: string, details?: Record<string, any>) {
    return new ApiError(message, 403, code || 'FORBIDDEN', details);
  }

  /**
   * Creates a Not Found (404) error
   */
  static notFound(message = 'Not found', code?: string, details?: Record<string, any>) {
    return new ApiError(message, 404, code || 'NOT_FOUND', details);
  }

  /**
   * Creates a Conflict (409) error
   */
  static conflict(message: string, code?: string, details?: Record<string, any>) {
    return new ApiError(message, 409, code || 'CONFLICT', details);
  }

  /**
   * Creates a ValidationError (422) error
   */
  static validationError(message: string, details?: Record<string, any>) {
    return new ApiError(message, 422, 'VALIDATION_ERROR', details);
  }

  /**
   * Creates a Server Error (500) error
   */
  static serverError(
    message = 'Internal server error',
    code?: string,
    details?: Record<string, any>
  ) {
    return new ApiError(message, 500, code || 'SERVER_ERROR', details);
  }
}
