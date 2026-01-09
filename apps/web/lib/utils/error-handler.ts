/**
 * Enhanced Error Handler
 * 
 * Centralized error handling with categorization, recovery strategies, and user-friendly messages
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorCategory {
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'not-found' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userMessage: string;
  recoveryAction?: string;
}

/**
 * Categorize error based on error type and message
 */
export function categorizeError(error: Error | unknown): ErrorCategory {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const errorName = error instanceof Error ? error.name : 'UnknownError';

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorName === 'NetworkError' ||
    errorName === 'TimeoutError'
  ) {
    return {
      type: 'network',
      severity: 'medium',
      recoverable: true,
      userMessage: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
      recoveryAction: 'retry',
    };
  }

  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorName === 'ValidationError'
  ) {
    return {
      type: 'validation',
      severity: 'low',
      recoverable: true,
      userMessage: 'Girdiğiniz bilgiler geçersiz. Lütfen kontrol edip tekrar deneyin.',
      recoveryAction: 'fix-input',
    };
  }

  // Authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('login') ||
    errorName === 'UnauthorizedError'
  ) {
    return {
      type: 'authentication',
      severity: 'medium',
      recoverable: true,
      userMessage: 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.',
      recoveryAction: 'login',
    };
  }

  // Authorization errors
  if (
    errorMessage.includes('forbidden') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('access denied') ||
    errorName === 'ForbiddenError'
  ) {
    return {
      type: 'authorization',
      severity: 'high',
      recoverable: false,
      userMessage: 'Bu işlem için yetkiniz bulunmamaktadır.',
    };
  }

  // Not found errors
  if (
    errorMessage.includes('not found') ||
    errorMessage.includes('404') ||
    errorName === 'NotFoundError'
  ) {
    return {
      type: 'not-found',
      severity: 'low',
      recoverable: true,
      userMessage: 'Aradığınız içerik bulunamadı.',
      recoveryAction: 'go-home',
    };
  }

  // Server errors
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('server error') ||
    errorMessage.includes('internal server') ||
    errorName === 'ServerError'
  ) {
    return {
      type: 'server',
      severity: 'high',
      recoverable: true,
      userMessage: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
      recoveryAction: 'retry',
    };
  }

  // Client errors
  if (
    errorMessage.includes('400') ||
    errorMessage.includes('bad request') ||
    errorName === 'BadRequestError'
  ) {
    return {
      type: 'client',
      severity: 'medium',
      recoverable: true,
      userMessage: 'Geçersiz istek. Lütfen sayfayı yenileyip tekrar deneyin.',
      recoveryAction: 'refresh',
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    severity: 'medium',
    recoverable: true,
    userMessage: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    recoveryAction: 'retry',
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: Error | unknown, context?: ErrorContext): string {
  const category = categorizeError(error);
  
  // Override with context-specific message if available
  if (context?.action) {
    const actionMessages: Record<string, string> = {
      'save': 'Kaydetme sırasında bir hata oluştu.',
      'delete': 'Silme işlemi sırasında bir hata oluştu.',
      'load': 'Yükleme sırasında bir hata oluştu.',
      'submit': 'Gönderme sırasında bir hata oluştu.',
      'update': 'Güncelleme sırasında bir hata oluştu.',
    };
    
    if (actionMessages[context.action]) {
      return actionMessages[context.action];
    }
  }
  
  return category.userMessage;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: Error | unknown): boolean {
  const category = categorizeError(error);
  return category.recoverable;
}

/**
 * Get recovery action for error
 */
export function getRecoveryAction(error: Error | unknown): string | undefined {
  const category = categorizeError(error);
  return category.recoveryAction;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: Error | unknown, context?: ErrorContext): {
  message: string;
  stack?: string;
  name: string;
  category: ErrorCategory;
  context?: ErrorContext;
  timestamp: string;
} {
  const category = categorizeError(error);
  
  return {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : 'UnknownError',
    category,
    context,
    timestamp: new Date().toISOString(),
  };
}
