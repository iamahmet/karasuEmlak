/**
 * Safe Supabase response parsing
 * Handles malformed JSON in database fields gracefully
 */

/**
 * Safely parse a Supabase response, handling any JSON parsing errors
 */
export function safeParseSupabaseResponse<T = any>(
  data: any,
  fallback: T
): T {
  if (!data) {
    return fallback;
  }

  // If data is already parsed (object/array), return as is
  if (typeof data !== 'string') {
    return data as T;
  }

  // Try to parse JSON string
  try {
    return JSON.parse(data) as T;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const position = errorMsg.match(/position (\d+)/)?.[1];
    
    console.warn('[SafeSupabaseParse] Failed to parse response:', {
      error: errorMsg,
      position: position || 'unknown',
      preview: data.substring(0, 200),
      length: data.length,
    });
    
    return fallback;
  }
}

/**
 * Safely process Supabase query result
 * Handles malformed JSON in any field
 */
export function safeProcessSupabaseResult<T extends Record<string, any>>(
  result: T | null | undefined,
  jsonFields: string[] = []
): T | null {
  if (!result) {
    return null;
  }

  const processed = { ...result };

  // Safely parse JSON fields
  for (const field of jsonFields) {
    if (processed[field] && typeof processed[field] === 'string') {
      try {
        processed[field] = JSON.parse(processed[field]);
      } catch {
        // If parsing fails, keep original value or set to fallback
        if (field === 'features') {
          processed[field] = {};
        } else if (field === 'images') {
          processed[field] = [];
        } else {
          // Keep original string value
        }
      }
    }
  }

  return processed as T;
}

/**
 * Safely process array of Supabase results
 */
export function safeProcessSupabaseResults<T extends Record<string, any>>(
  results: T[] | null | undefined,
  jsonFields: string[] = []
): T[] {
  if (!results || !Array.isArray(results)) {
    return [];
  }

  return results.map(result => safeProcessSupabaseResult(result, jsonFields) as T).filter(Boolean);
}
