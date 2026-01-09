/**
 * Environment-aware logger
 * Only logs in development mode
 */

/**
 * Log debug message (development only)
 */
export function debug(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Log info message (development only)
 */
export function info(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.info('[INFO]', ...args);
  }
}

/**
 * Log warning (always)
 */
export function warn(...args: unknown[]): void {
  console.warn('[WARN]', ...args);
}

/**
 * Log error (always, but with context)
 */
export function error(context: string, error: unknown, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR:${context}]`, error, ...args);
  } else {
    // In production, you might want to send to error tracking service
    console.error(`[ERROR:${context}]`, error instanceof Error ? error.message : String(error));
  }
}
