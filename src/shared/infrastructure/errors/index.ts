// Base error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
  };
}

// Global error handler for Elysia
export function createErrorHandler() {
  return (error: Error & { statusCode?: number; code?: string }) => {
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_SERVER_ERROR';
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code,
        statusCode,
        timestamp: new Date().toISOString(),
      },
    };

    // Log error for debugging
    if (statusCode >= 500) {
      console.error('🚨 Server Error:', {
        message: error.message,
        stack: error.stack,
        code,
        statusCode,
      });
    } else {
      console.warn('⚠️ Client Error:', {
        message: error.message,
        code,
        statusCode,
      });
    }

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
}
