/**
 * Safe Supabase Query Wrapper
 * Wraps Supabase queries to handle JSON parsing errors gracefully
 */

import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Safely execute a Supabase query with error handling
 */
export async function safeSupabaseQuery<T>(
  queryPromise: Promise<PostgrestResponse<T>>,
  fallback: T
): Promise<PostgrestResponse<T>> {
  try {
    const result = await queryPromise;
    
    // If there's an error, return fallback
    if (result.error) {
      console.error('[SafeSupabaseQuery] Query error:', result.error);
      return {
        data: fallback as any,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      } as PostgrestResponse<T>;
    }
    
    // Safely process data to handle any JSON parsing issues
    if (result.data && Array.isArray(result.data)) {
      const safeData = result.data.map((item: any) => {
        // Recursively check and fix any JSON fields
        return safeProcessItem(item);
      });
      
      return {
        ...result,
        data: safeData as any,
      } as PostgrestResponse<T>;
    }
    
    return result;
  } catch (error: any) {
    console.error('[SafeSupabaseQuery] Query execution error:', error.message);
    return {
      data: fallback as any,
      error: {
        message: error.message,
        details: null,
        hint: null,
        code: 'QUERY_ERROR',
      },
      count: null,
      status: 500,
      statusText: 'Internal Server Error',
    } as PostgrestResponse<T>;
  }
}

/**
 * Recursively process an item to safely handle JSON fields
 */
function safeProcessItem(item: any): any {
  if (!item || typeof item !== 'object') {
    return item;
  }
  
  const processed = { ...item };
  
  // Check each field
  for (const key in processed) {
    const value = processed[key];
    
    // If it's a string that looks like JSON, try to parse it safely
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          // Clean the string first - remove control characters that might break parsing
          const cleaned = value.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
          // Only parse if it's actually JSON
          const parsed = JSON.parse(cleaned);
          processed[key] = parsed;
        } catch (parseError: any) {
          // Log warning but don't crash - keep as string
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[SafeSupabaseWrapper] Failed to parse JSON field "${key}":`, parseError.message);
          }
          // Not valid JSON, keep as string
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      processed[key] = safeProcessItem(value);
    }
  }
  
  return processed;
}
