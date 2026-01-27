/**
 * Safe JSON Parse Utility
 * 
 * Replaces all unsafe JSON.parse() calls.
 * Provides fallback values and deduplicated logging.
 */

const parseErrors = new Map<string, number>(); // Track errors by key to dedupe

export interface SafeJsonParseOptions {
  context?: string;
  dedupeKey?: string;
}

/**
 * Safely parse JSON string with fallback
 *
 * @param value - Value to parse (string, object, or null)
 * @param fallback - Fallback value if parsing fails
 * @param contextOrOptions - Context string or options object
 * @param dedupeKey - Optional dedupe key when using context string
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T = any>(
  value: any,
  fallback: T,
  contextOrOptions?: string | SafeJsonParseOptions,
  dedupeKey?: string
): T {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return fallback;
  }

  // If already an object/array, return as is
  if (typeof value !== 'string') {
    return value as T;
  }

  // Empty string
  if (value.trim() === '') {
    return fallback;
  }

  // Try to parse
  try {
    return JSON.parse(value) as T;
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown parse error';
    const context =
      typeof contextOrOptions === 'string'
        ? contextOrOptions
        : contextOrOptions?.context;
    const key =
      (typeof contextOrOptions === 'string'
        ? dedupeKey
        : contextOrOptions?.dedupeKey) ||
      context ||
      'unknown';
    const count = parseErrors.get(key) || 0;

    // Log first occurrence or every 100th occurrence
    if (count === 0 || count % 100 === 0) {
      const position = errorMsg.match(/position (\d+)/)?.[1];
      console.warn(`[safeJsonParse] Failed to parse JSON${context ? ` (${context})` : ''}:`, {
        error: errorMsg,
        position: position || 'unknown',
        preview: value.slice(0, 200),
        length: value.length,
        occurrences: count + 1,
      });
    }

    parseErrors.set(key, count + 1);
    return fallback;
  }
}

/**
 * Reset error tracking (useful for tests)
 */
export function resetParseErrorTracking() {
  parseErrors.clear();
}
