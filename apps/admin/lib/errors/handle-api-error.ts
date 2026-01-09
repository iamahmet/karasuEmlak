/**
 * Standardized error handling for admin panel API routes
 */

export interface APIErrorInfo {
  message: string;
  code: string;
  statusCode: number;
  userFriendly?: boolean;
}

/**
 * Handles API errors and returns standardized error information
 */
export function handleAPIError(error: unknown): APIErrorInfo {
  // Handle Error instances
  if (error instanceof Error) {
    // Check for known error codes
    if ('code' in error) {
      const code = String(error.code);
      
      // Supabase errors
      if (code === 'PGRST116' || code === '42P01') {
        return {
          message: 'Table not found or empty',
          code: 'TABLE_NOT_FOUND',
          statusCode: 404,
          userFriendly: true,
        };
      }
      
      if (code === '23505') {
        return {
          message: 'Duplicate entry',
          code: 'DUPLICATE_ENTRY',
          statusCode: 409,
          userFriendly: true,
        };
      }
      
      if (code === '23503') {
        return {
          message: 'Foreign key constraint violation',
          code: 'FOREIGN_KEY_VIOLATION',
          statusCode: 400,
          userFriendly: true,
        };
      }
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      userFriendly: false,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR',
      statusCode: 500,
      userFriendly: true,
    };
  }
  
  // Handle objects with error properties
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return {
        message: errorObj.message,
        code: String(errorObj.code || 'OBJECT_ERROR'),
        statusCode: Number(errorObj.statusCode || errorObj.status || 500),
        userFriendly: Boolean(errorObj.userFriendly),
      };
    }
  }
  
  // Fallback
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    userFriendly: false,
  };
}

/**
 * Gets user-friendly error messages
 */
export function getUserFriendlyMessage(error: APIErrorInfo | Error | string): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    const handled = handleAPIError(error);
    return handled.userFriendly ? handled.message : 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
  
  return error.userFriendly 
    ? error.message 
    : 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

/**
 * Logs errors with context (only in development)
 */
export function logError(error: unknown, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
  // In production, you might want to send to error tracking service
}

