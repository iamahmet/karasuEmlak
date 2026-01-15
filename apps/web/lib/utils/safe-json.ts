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
 * Handles both string arrays and object arrays
 */
export function safeParseImages(images: any): Array<{
  public_id?: string;
  url: string;
  alt?: string;
  order: number;
}> {
  const parsed = safeParseJSON<Array<any>>(images, [], 'images');
  if (!Array.isArray(parsed)) {
    return [];
  }
  
  // If it's an array of strings, convert to objects
  if (parsed.length > 0 && typeof parsed[0] === 'string') {
    return parsed.map((url: string, index: number) => ({
      url: url,
      public_id: url.split('/').pop()?.split('.')[0] || `image-${index}`,
      alt: '',
      order: index,
    }));
  }
  
  // If it's already an array of objects, ensure they have the right format
  return parsed.map((img: any, index: number) => {
    if (typeof img === 'string') {
      return {
        url: img,
        public_id: img.split('/').pop()?.split('.')[0] || `image-${index}`,
        alt: '',
        order: index,
      };
    }
    return {
      url: img.url || img,
      public_id: img.public_id || img.url?.split('/').pop()?.split('.')[0] || `image-${index}`,
      alt: img.alt || '',
      order: img.order !== undefined ? img.order : index,
    };
  });
}
