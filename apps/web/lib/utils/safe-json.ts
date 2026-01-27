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
    // If value is already an object/array, return as is (Supabase sometimes returns parsed JSON)
    if (typeof value === 'object' && value !== null) {
      return value as T;
    }

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
    
    // Try to find and remove trailing garbage (common issue: JSON + extra text)
    // Look for the last valid closing brace/bracket
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const lastValidClose = Math.max(lastBrace, lastBracket);
    
    if (lastValidClose > 0 && lastValidClose < cleaned.length - 1) {
      // There's content after the last closing brace/bracket - might be garbage
      const potentialGarbage = cleaned.substring(lastValidClose + 1).trim();
      if (potentialGarbage.length > 0 && !potentialGarbage.match(/^[,\s]*$/)) {
        // Try parsing without the garbage
        const cleanedWithoutGarbage = cleaned.substring(0, lastValidClose + 1);
        try {
          const testParse = JSON.parse(cleanedWithoutGarbage);
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[SafeJSON] Removed trailing garbage (${potentialGarbage.length} chars)${context ? ` (${context})` : ''}`);
          }
          return testParse as T;
        } catch {
          // Continue with original cleaned value
        }
      }
    }
    
    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const position = errorMsg.match(/position (\d+)/)?.[1];
    const pos = position ? parseInt(position, 10) : NaN;
    
    // Log error immediately in development to catch the source
    if (process.env.NODE_ENV === 'development' && context) {
      console.error(`[SafeJSON] Parse error in ${context}:`, {
        error: errorMsg,
        position: position || 'unknown',
        valueLength: typeof value === 'string' ? value.length : 'N/A',
        valuePreview: typeof value === 'string' ? value.substring(0, 200) : value,
        aroundPosition: pos && typeof value === 'string' ? value.substring(Math.max(0, pos - 50), Math.min(value.length, pos + 50)) : 'N/A',
      });
    }
    // "Unexpected non-whitespace character after JSON at position N" -> sonda çöp olabilir; ilk geçerli JSON'u dene
    if (!Number.isNaN(pos) && pos > 0 && typeof value === 'string') {
      try {
        // Strategy 1: Try to find the last valid JSON position by searching backwards from error position
        // Start from error position and go backwards to find valid JSON
        let lastValidPos = -1;
        const searchStart = Math.min(pos, value.length - 1);
        const searchEnd = Math.max(0, pos - 1000); // Search up to 1000 chars back
        
        for (let i = searchStart; i >= searchEnd; i--) {
          try {
            const testValue = value.substring(0, i + 1);
            // Try to find closing brace/bracket
            const lastChar = testValue.trim().slice(-1);
            if (lastChar === '}' || lastChar === ']') {
              JSON.parse(testValue);
              lastValidPos = i + 1;
              break;
            }
          } catch {
            continue;
          }
        }
        
        // Strategy 2: If Strategy 1 failed, try binary search for valid JSON
        if (lastValidPos === -1 && pos > 100) {
          let left = Math.max(0, pos - 2000);
          let right = pos;
          while (left < right) {
            const mid = Math.floor((left + right) / 2);
            try {
              const testValue = value.substring(0, mid + 1);
              JSON.parse(testValue);
              lastValidPos = mid + 1;
              left = mid + 1;
            } catch {
              right = mid;
            }
          }
        }
        
        if (lastValidPos > 0) {
          const truncated = value.substring(0, lastValidPos);
          const partial = JSON.parse(truncated);
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[SafeJSON] Parsed truncated JSON at position ${lastValidPos} (original: ${pos}, length: ${value.length})${context ? ` (${context})` : ''}`);
          }
          return partial as T;
        }
      } catch (truncateError) {
        // truncated parse de olmadı, aşağıdaki fallback kullanılacak
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[SafeJSON] Truncate strategy failed for position ${pos}${context ? ` (${context})` : ''}`);
        }
      }
    }
    const preview = value.substring(0, 200);
    const aroundPosition = position
      ? value.substring(Math.max(0, parseInt(position, 10) - 50), Math.min(value.length, parseInt(position, 10) + 50))
      : '';
    if (process.env.NODE_ENV === 'development') {
      console.error(`[SafeJSON] Failed to parse JSON${context ? ` (${context})` : ''}:`, {
        error: errorMsg,
        position: position || 'unknown',
        preview,
        aroundPosition,
        length: value.length,
      });
    }
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
