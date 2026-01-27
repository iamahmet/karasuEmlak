/**
 * Safe Supabase response parsing
 * Handles malformed JSON in database fields gracefully
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

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

  const PARSE_FAILED = "__SAFE_JSON_PARSE_FAILED__";
  const parsed = safeJsonParse(data, PARSE_FAILED as any, {
    context: "supabase.safe-parse.response",
    dedupeKey: "supabase.safe-parse.response",
  });
  if (parsed === PARSE_FAILED) {
    return fallback;
  }
  return parsed as T;
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

  const processed: Record<string, any> = { ...result };

  // Safely parse JSON fields
  for (const field of jsonFields) {
    if (processed[field] && typeof processed[field] === 'string') {
      const PARSE_FAILED = "__SAFE_JSON_PARSE_FAILED__";
      const parsedField = safeJsonParse(processed[field], PARSE_FAILED as any, {
        context: `supabase.safe-parse.field.${field}`,
        dedupeKey: `supabase.safe-parse.field.${field}`,
      });
      if (parsedField === PARSE_FAILED) {
        if (field === 'features') {
          processed[field] = {};
        } else if (field === 'images') {
          processed[field] = [];
        } else {
          // Keep original string value
        }
      } else {
        processed[field] = parsedField;
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
