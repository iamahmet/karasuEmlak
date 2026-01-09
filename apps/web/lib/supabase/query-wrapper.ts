/**
 * Supabase Query Wrapper
 * Provides timeout, retry, and error handling for Supabase queries
 */

import type { PostgrestError } from '@supabase/supabase-js';

export interface QueryOptions {
  timeout?: number; // Timeout in milliseconds (default: 3000)
  maxRetries?: number; // Max retry attempts (default: 2)
  retryDelay?: number; // Initial retry delay in ms (default: 500)
  retryableErrors?: string[]; // Error codes to retry on
}

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  success: boolean;
}

/**
 * Default retryable error codes
 */
const DEFAULT_RETRYABLE_ERRORS = [
  'PGRST116', // Connection error
  'PGRST205', // Schema cache error (will retry once)
  'PGRST202', // Function not found (schema cache)
  '500', // Internal server error
  '502', // Bad gateway
  '503', // Service unavailable
  '504', // Gateway timeout
];

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: PostgrestError | null, retryableErrors: string[]): boolean {
  if (!error) return false;
  
  const errorCode = error.code || error.message || '';
  return retryableErrors.some(code => 
    errorCode.includes(code) || error.message?.includes(code)
  );
}

/**
 * Wrap Supabase query with timeout, retry, and error handling
 * 
 * @param queryFn - Function that returns a Supabase query promise
 * @param options - Query options
 * @returns Query result
 */
export async function withQueryWrapper<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: QueryOptions = {}
): Promise<QueryResult<T>> {
  const {
    timeout = 3000,
    maxRetries = 2,
    retryDelay = 500,
    retryableErrors = DEFAULT_RETRYABLE_ERRORS,
  } = options;

  let lastError: PostgrestError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
      });

      // Race query against timeout
      const result = await Promise.race([
        queryFn(),
        timeoutPromise,
      ]);

      // If we got here, query succeeded
      if (result.error) {
        // Check if error is retryable
        if (isRetryableError(result.error, retryableErrors) && attempt < maxRetries) {
          lastError = result.error;
          
          // Special handling for PostgREST cache errors
          if (result.error.code === 'PGRST205' || result.error.code === 'PGRST202') {
            // Wait longer for PostgREST cache to update
            await sleep(2000);
          }
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }

        // Non-retryable error or max retries reached
        return {
          data: null,
          error: result.error,
          success: false,
        };
      }

      // Success
      return {
        data: result.data,
        error: null,
        success: true,
      };
    } catch (error: any) {
      lastError = error instanceof Error 
        ? { message: error.message, code: 'TIMEOUT', details: error.stack } as PostgrestError
        : { message: 'Unknown error', code: 'UNKNOWN' } as PostgrestError;

      // Check if it's a timeout and retryable
      if (error.message?.includes('timeout') && attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      // Non-retryable or max retries
      return {
        data: null,
        error: lastError,
        success: false,
      };
    }
  }

  // Max retries reached
  return {
    data: null,
    error: lastError,
    success: false,
  };
}

/**
 * Helper to wrap Supabase query builder
 * 
 * @example
 * const result = await wrapQuery(
 *   () => supabase.from('articles').select('*').eq('status', 'published'),
 *   { timeout: 5000 }
 * );
 */
export async function wrapQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options?: QueryOptions
): Promise<QueryResult<T>> {
  return withQueryWrapper(queryFn, options);
}
