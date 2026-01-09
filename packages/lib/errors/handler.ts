import { logAuditEvent } from '../audit';

/**
 * Error types
 */
export type ErrorType = 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'external_api';

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Log error to audit logs and console
 * 
 * @param error - Error object
 * @param context - Additional context
 */
export async function logError(error: Error | AppError, context?: string): Promise<void> {
  const errorType = error instanceof AppError ? error.type : 'server';
  const metadata = {
    message: error.message,
    stack: error.stack,
    context,
    ...(error instanceof AppError ? error.metadata : {}),
  };

  // Log to audit
  await logAuditEvent({
    type: 'error.occurred',
    metadata: {
      error_type: errorType,
      ...metadata,
    },
  });

  // Log to console
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ Error [${errorType}]:`, error.message);
    if (context) {
      console.error('Context:', context);
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

/**
 * Handle API route errors
 * 
 * @param error - Error object
 * @param context - Additional context
 * @returns Error response data
 */
export async function handleApiError(error: unknown, context?: string): Promise<{
  message: string;
  statusCode: number;
  type: ErrorType;
}> {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError('server', error.message, 500);
  } else {
    appError = new AppError('server', 'An unexpected error occurred', 500);
  }

  await logError(appError, context);

  return {
    message: appError.message,
    statusCode: appError.statusCode,
    type: appError.type,
  };
}

/**
 * Create error response for Next.js API routes
 * 
 * @param error - Error object
 * @param context - Additional context
 * @returns Error response object
 */
export async function createErrorResponse(error: unknown, context?: string) {
  const errorInfo = await handleApiError(error, context);
  
  return {
    error: errorInfo.message,
    type: errorInfo.type,
    ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined }),
  };
}

