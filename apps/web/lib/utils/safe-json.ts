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
    // Check for common issues before parsing
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return fallback;
    }
    
    // Check if it looks like JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return fallback;
    }
    
    // Try to find and fix common issues
    let cleaned = value;
    
    // Remove BOM if present
    if (cleaned.charCodeAt(0) === 0xFEFF) {
      cleaned = cleaned.slice(1);
    }
    
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove control characters that might break parsing
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const position = errorMsg.match(/position (\d+)/)?.[1];
    const preview = value.substring(0, 200);
    const aroundPosition = position 
      ? value.substring(Math.max(0, parseInt(position) - 50), Math.min(value.length, parseInt(position) + 50))
      : '';
    
    console.error(`[SafeJSON] Failed to parse JSON${context ? ` (${context})` : ''}:`, {
      error: errorMsg,
      position: position || 'unknown',
      preview: preview,
      aroundPosition: aroundPosition,
      length: value.length,
      firstChars: value.substring(0, 100),
      lastChars: value.substring(Math.max(0, value.length - 100)),
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
    // Clean circular references and functions
    const cleaned = cleanForJSON(value);
    return JSON.stringify(cleaned);
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[SafeJSON] Failed to stringify JSON${context ? ` (${context})` : ''}:`, errorMsg);
    return fallback;
  }
}

/**
 * Clean object for JSON stringification
 * Removes circular references, functions, and undefined values
 */
function cleanForJSON(obj: any, seen = new WeakSet()): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  // Handle primitives
  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForJSON(item, seen));
  }

  // Handle circular references
  if (seen.has(obj)) {
    return '[Circular]';
  }
  seen.add(obj);

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle objects
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Skip functions
      if (typeof value === 'function') {
        continue;
      }
      
      // Skip undefined
      if (value === undefined) {
        continue;
      }
      
      try {
        cleaned[key] = cleanForJSON(value, seen);
      } catch {
        // Skip problematic values
        continue;
      }
    }
  }
  
  return cleaned;
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
