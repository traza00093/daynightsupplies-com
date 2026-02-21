import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logSecurityEvent } from '@/lib/security';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// Predefined error types
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
  
  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SHIPPING_ERROR: 'SHIPPING_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // External Services
  STRIPE_ERROR: 'STRIPE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // Generic
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND'
} as const;

// Error factory functions
export const createError = {
  unauthorized: (message = 'Unauthorized access') => 
    new AppError(ErrorCodes.UNAUTHORIZED, message, 401),
    
  forbidden: (message = 'Access forbidden') => 
    new AppError(ErrorCodes.FORBIDDEN, message, 403),
    
  invalidCredentials: (message = 'Invalid email or password') => 
    new AppError(ErrorCodes.INVALID_CREDENTIALS, message, 401),
    
  accountLocked: (message = 'Account is temporarily locked') => 
    new AppError(ErrorCodes.ACCOUNT_LOCKED, message, 423),
    
  validationError: (message: string, details?: any) => 
    new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details),
    
  notFound: (resource = 'Resource') => 
    new AppError(ErrorCodes.RECORD_NOT_FOUND, `${resource} not found`, 404),
    
  duplicateRecord: (field: string) => 
    new AppError(ErrorCodes.DUPLICATE_RECORD, `${field} already exists`, 409),
    
  insufficientStock: (productName: string) => 
    new AppError(ErrorCodes.INSUFFICIENT_STOCK, `Insufficient stock for ${productName}`, 400),
    
  rateLimitExceeded: (message = 'Too many requests') => 
    new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429),
    
  fileTooLarge: (maxSize: string) => 
    new AppError(ErrorCodes.FILE_TOO_LARGE, `File size exceeds ${maxSize} limit`, 413),
    
  invalidFileType: (allowedTypes: string[]) => 
    new AppError(ErrorCodes.INVALID_FILE_TYPE, `Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400),
    
  databaseError: (message = 'Database operation failed') => 
    new AppError(ErrorCodes.DATABASE_ERROR, message, 500),
    
  internalError: (message = 'Internal server error') => 
    new AppError(ErrorCodes.INTERNAL_SERVER_ERROR, message, 500)
};

// Error handler middleware
export async function handleApiError(
  error: unknown,
  request?: Request,
  context?: { userId?: string; ip?: string; userAgent?: string }
): Promise<NextResponse> {
  let apiError: ApiError;
  
  if (error instanceof AppError) {
    apiError = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    };
  } else if (error instanceof ZodError) {
    apiError = {
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed',
      statusCode: 400,
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  } else if (error instanceof Error) {
    // Handle specific database errors
    if (error.message.includes('duplicate key value')) {
      apiError = {
        code: ErrorCodes.DUPLICATE_RECORD,
        message: 'Record already exists',
        statusCode: 409
      };
    } else if (error.message.includes('foreign key constraint')) {
      apiError = {
        code: ErrorCodes.FOREIGN_KEY_VIOLATION,
        message: 'Referenced record does not exist',
        statusCode: 400
      };
    } else if (error.message.includes('connection')) {
      apiError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Database connection error',
        statusCode: 503
      };
    } else {
      apiError = {
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        statusCode: 500
      };
    }
  } else {
    apiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Unknown error occurred',
      statusCode: 500
    };
  }
  
  // Log security-related errors
  if (context && (apiError.statusCode === 401 || apiError.statusCode === 403 || apiError.statusCode === 429)) {
    await logSecurityEvent({
      type: apiError.statusCode === 429 ? 'suspicious_activity' : 'auth_failure',
      userId: context.userId,
      ip: context.ip || 'unknown',
      userAgent: context.userAgent || 'unknown',
      details: `${apiError.code}: ${apiError.message}`,
      metadata: { statusCode: apiError.statusCode, details: apiError.details }
    });
  }
  
  // Log all errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      error: apiError,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
  
  // Log critical errors in production
  if (process.env.NODE_ENV === 'production' && apiError.statusCode >= 500) {
    console.error('Critical Error:', {
      code: apiError.code,
      message: apiError.message,
      statusCode: apiError.statusCode,
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      ip: context?.ip
    });
  }
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        ...(process.env.NODE_ENV === 'development' && { details: apiError.details })
      }
    },
    { status: apiError.statusCode }
  );
}

// Async error wrapper for API routes
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Database error handler
export function handleDatabaseError(error: any): never {
  if (error.code === '23505') { // Unique violation
    throw createError.duplicateRecord('Record');
  } else if (error.code === '23503') { // Foreign key violation
    throw new AppError(ErrorCodes.FOREIGN_KEY_VIOLATION, 'Referenced record does not exist', 400);
  } else if (error.code === '23502') { // Not null violation
    throw createError.validationError('Required field is missing');
  } else if (error.code === '22001') { // String data too long
    throw createError.validationError('Input data is too long');
  } else if (error.code === '08006' || error.code === '08001') { // Connection errors
    throw new AppError(ErrorCodes.DATABASE_ERROR, 'Database connection error', 503);
  } else {
    console.error('Unhandled database error:', error);
    throw createError.databaseError('Database operation failed');
  }
}

// Validation error formatter
export function formatValidationErrors(errors: ZodError): { field: string; message: string }[] {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}

// Success response helper
export function createSuccessResponse<T>(data: T, message?: string, statusCode: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    },
    { status: statusCode }
  );
}

// Paginated response helper
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  },
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1
    },
    ...(message && { message })
  });
}