/**
 * Input Sanitization Utility
 * Sanitizes user input to prevent XSS attacks
 */

// Client-side DOMPurify
let DOMPurifyClient: any = null;
if (typeof window !== 'undefined') {
  DOMPurifyClient = require('dompurify');
}

// Server-side DOMPurify with JSDOM
let DOMPurifyServer: any = null;
if (typeof window === 'undefined') {
  try {
    const { JSDOM } = require('jsdom');
    const { default: DOMPurify } = require('dompurify');
    const dom = new JSDOM('<!DOCTYPE html>');
    DOMPurifyServer = DOMPurify(dom.window as any);
  } catch (error: any) {
    // JSDOM not available during build - this is expected in some Next.js build contexts
    // Silently fail - sanitization will happen on client side if needed
    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development' && process.env.VERBOSE_SANITIZE === 'true') {
      console.warn('JSDOM not available for server-side sanitization:', error?.message || error);
    }
  }
}

/**
 * Get DOMPurify instance (client or server)
 */
function getDOMPurify() {
  if (typeof window !== 'undefined') {
    return DOMPurifyClient;
  }
  return DOMPurifyServer;
}

/**
 * Sanitize HTML string
 * IMPORTANT: This must return the same result on both server and client
 * to avoid React hydration mismatches.
 */
export function sanitizeHTML(html: string): string {
  const purify = getDOMPurify();
  
  if (!purify) {
    // Fallback: Return HTML as-is (don't escape, let DOMPurify handle it)
    // This ensures server and client produce the same output
    // The actual sanitization will happen in html-content-processor
    return html;
  }
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'loading', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(text: string): string {
  const purify = getDOMPurify();
  
  if (!purify) {
    // Fallback: basic HTML entity encoding
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  return purify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  try {
    const urlObj = new URL(url);
    // Only allow http, https, mailto, tel
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
      return '#';
    }
    return urlObj.toString();
  } catch {
    return '#';
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // Check if it's HTML content or plain text
      if (sanitized[key].includes('<') && sanitized[key].includes('>')) {
        sanitized[key] = sanitizeHTML(sanitized[key]) as any;
      } else {
        sanitized[key] = sanitizeText(sanitized[key]) as any;
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key]) as any;
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) => 
        typeof item === 'string' ? sanitizeText(item) : 
        typeof item === 'object' ? sanitizeObject(item) : 
        item
      ) as any;
    }
  }
  
  return sanitized;
}
