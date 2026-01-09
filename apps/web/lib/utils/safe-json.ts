/**
 * Safe JSON parsing utilities
 * Prevents JSON parse errors from crashing the application
 */

/**
 * Safely parse JSON string with fallback
 */
export function safeParseJSON<T = any>(
  value: any,
  fallback: T,
  context?: string
): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  // If already parsed, return as is
  if (typeof value !== 'string') {
    return value as T;
  }

  // Empty string check
  if (value.trim() === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const position = errorMsg.match(/position (\d+)/)?.[1];
    const preview = value.substring(0, 200);
    
    console.warn(`[SafeJSON] Failed to parse JSON${context ? ` (${context})` : ''}:`, {
      error: errorMsg,
      position: position || 'unknown',
      preview: preview,
      length: value.length,
    });
    
    return fallback;
  }
}

/**
 * Safely stringify JSON with fallback
 */
export function safeStringifyJSON(
  value: any,
  fallback: string = '{}',
  context?: string
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  try {
    return JSON.stringify(value);
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[SafeJSON] Failed to stringify JSON${context ? ` (${context})` : ''}:`, errorMsg);
    return fallback;
  }
}

/**
 * Parse listing features safely
 */
export function safeParseFeatures(features: any): Record<string, any> {
  return safeParseJSON<Record<string, any>>(features, {}, 'features');
}

/**
 * Parse listing images safely
 */
export function safeParseImages(images: any): Array<any> {
  const parsed = safeParseJSON<Array<any>>(images, [], 'images');
  return Array.isArray(parsed) ? parsed : [];
}
