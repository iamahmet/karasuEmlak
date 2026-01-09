/**
 * Timeout Utilities
 * Prevents blocking operations from hanging indefinitely
 */

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
export function createTimeout(ms: number, message = 'Operation timed out'): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Race a promise against a timeout
 * Returns fallback if timeout occurs (graceful degradation)
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T | null = null
): Promise<T | null> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  try {
    const result = await Promise.race([
      promise.then((value) => {
        clearTimeout(timeoutId);
        return value;
      }),
      timeoutPromise,
    ]);
    return result;
  } catch (error) {
    // If it's a timeout error, return fallback
    if (error instanceof Error && error.message.includes('timed out')) {
      return fallback;
    }
    // For other errors, also return fallback (graceful degradation)
    console.warn('Operation failed, using fallback:', error);
    return fallback;
  }
}

/**
 * Race multiple promises against a timeout
 * Returns array of results (null for failed/timeout operations)
 */
export async function withTimeoutAll<T>(
  promises: Promise<T>[],
  ms: number,
  fallback: T | null = null
): Promise<(T | null)[]> {
  return Promise.all(
    promises.map((promise) => withTimeout(promise, ms, fallback))
  );
}

