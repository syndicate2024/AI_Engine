import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Custom error classes
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Not authorized') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class AIServiceError extends BaseError {
  constructor(message: string) {
    super(message, 'AI_SERVICE_ERROR', 503);
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

// Error handlers
export const handleZodError = (error: z.ZodError) => {
  const messages = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return new ValidationError(`Validation failed: ${JSON.stringify(messages)}`);
};

interface APIErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

export const handleAIServiceError = (error: APIErrorResponse) => {
  return new AIServiceError(
    error.response?.data?.error || error.message || 'AI service unavailable'
  );
};

// Global error logger
export const logError = (error: Error) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  };

  if (error instanceof BaseError && error.isOperational) {
    console.warn('Operational error:', errorLog);
  } else {
    console.error('Programming error:', errorLog);
  }
};

// Error handler middleware (for Express/API routes)
export const errorHandlerMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  logError(error);

  if (error instanceof BaseError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message
    });
  }

  if (error instanceof z.ZodError) {
    const validationError = handleZodError(error);
    return res.status(validationError.statusCode).json({
      status: 'error',
      code: validationError.code,
      message: validationError.message
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : error.message
  });
};

// Usage example:
/*
try {
  // Your code here
} catch (error) {
  if (error instanceof z.ZodError) {
    throw handleZodError(error);
  }
  if (error.response?.status === 503) {
    throw handleAIServiceError(error);
  }
  throw error;
}
*/ 