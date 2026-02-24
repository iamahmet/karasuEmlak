/**
 * HTML Content Processor
 * 
 * Advanced HTML sanitization, repair, and normalization
 * with DOMPurify integration, broken tag fixing, and XSS protection.
 */

import { sanitizeHTML } from '@/lib/security/sanitize';

export interface SanitizeOptions {
  allowImages?: boolean;
  allowTables?: boolean;
  allowBlockquotes?: boolean;
  allowCode?: boolean;
  strict?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedHTML?: string;
}

/**
 * Sanitize and repair HTML
 * IMPORTANT: This must return the same result on both server and client
 * to avoid React hydration mismatches.
 */
export function sanitizeAndRepairHTML(html: string, options: SanitizeOptions = {}): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let processed = html.trim();

  // Step 1: Fix broken tags
  processed = fixBrokenTags(processed);

  // Step 2: Normalize HTML structure
  processed = normalizeHTMLStructure(processed);

  // Step 3: Sanitize with DOMPurify (ensures same output on server and client)
  // DOMPurify will handle XSS protection without escaping HTML entities
  processed = sanitizeHTML(processed);

  // Step 4: Final cleanup
  processed = cleanupHTML(processed);

  return processed;
}

/**
 * Fix broken HTML tags
 */
export function fixBrokenTags(html: string): string {
  let fixed = html;

  // Fix unclosed tags (basic approach)
  const tagStack: string[] = [];
  const selfClosingTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

  // Extract all tags
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  const tags: Array<{ full: string; name: string; isClosing: boolean; position: number }> = [];
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');
    
    if (!selfClosingTags.has(tagName)) {
      tags.push({
        full: match[0],
        name: tagName,
        isClosing,
        position: match.index,
      });
    }
  }

  // Build fixed HTML by tracking tag stack
  let result = '';
  let lastIndex = 0;

  tags.forEach(tag => {
    result += html.substring(lastIndex, tag.position);
    
    if (tag.isClosing) {
      // Find matching open tag
      const lastOpenIndex = tagStack.lastIndexOf(tag.name);
      if (lastOpenIndex !== -1) {
        tagStack.splice(lastOpenIndex, 1);
        result += tag.full; // Valid closing tag
      } else {
        // Orphan closing tag - remove it
        // result += ''; // Skip it
      }
    } else {
      tagStack.push(tag.name);
      result += tag.full;
    }
    
    lastIndex = tag.position + tag.full.length;
  });

  result += html.substring(lastIndex);

  // Close any remaining open tags
  tagStack.reverse().forEach(tagName => {
    result += `</${tagName}>`;
  });

  // Fix incomplete tags at the end of content
  // Fix incomplete headings (e.g., "<h3>Buzdolabında Saklama" without closing tag)
  result = result.replace(/<h([1-6])>([^<]+?)(?<!<\/h\1>)(?=\s*$)/gm, (match, level, text) => {
    // If heading is not closed and appears at end of content, close it
    if (text && !text.includes('</h')) {
      return `<h${level}>${text.trim()}</h${level}>`;
    }
    return match;
  });
  
  // Fix incomplete list items
  result = result.replace(/<li>([^<]+?)(?<!<\/li>)(?=\s*$)/gm, (match, text) => {
    if (text && !text.includes('</li>')) {
      return `<li>${text.trim()}</li>`;
    }
    return match;
  });
  
  // Fix incomplete paragraphs
  result = result.replace(/<p>([^<]+?)(?<!<\/p>)(?=\s*$)/gm, (match, text) => {
    if (text && !text.includes('</p>')) {
      return `<p>${text.trim()}</p>`;
    }
    return match;
  });
  
  // Fix incomplete list items within ul/ol
  result = result.replace(/(<ul[^>]*>|<ol[^>]*>)([^<]*?)(?<!<\/li>)(?=\s*<\/[uo]l>)/gi, (match, listTag, content) => {
    // If there's text after last </li> but before </ul>, wrap it in <li>
    const lastLiIndex = content.lastIndexOf('</li>');
    if (lastLiIndex !== -1) {
      const afterLastLi = content.substring(lastLiIndex + 5).trim();
      if (afterLastLi && !afterLastLi.startsWith('<')) {
        return `${listTag}${content.substring(0, lastLiIndex + 5)}<li>${afterLastLi}</li>`;
      }
    } else if (content.trim() && !content.trim().startsWith('<li>')) {
      // No li tags at all, wrap content in li
      return `${listTag}<li>${content.trim()}</li>`;
    }
    return match;
  });

  // Fix broken image tags
  fixed = result;
  
  // Fix images without src
  fixed = fixed.replace(/<img([^>]*?)(?!src=)([^>]*?)>/gi, (match, before, after) => {
    if (!match.includes('src=')) {
      const hasAlt = match.includes('alt=');
      const alt = hasAlt ? '' : ' alt="Görsel"';
      return `<img src="/images/placeholder-article.jpg"${before}${after}${alt} loading="lazy">`;
    }
    return match;
  });

  // Fix images with empty src
  fixed = fixed.replace(/<img([^>]*?)src=["']\s*["']([^>]*?)>/gi, (match, before, after) => {
    const hasAlt = match.includes('alt=');
    const alt = hasAlt ? '' : ' alt="Görsel"';
    return `<img${before}src="/images/placeholder-article.jpg"${after}${alt} loading="lazy">`;
  });

  // Fix broken links (href without quotes or empty)
  fixed = fixed.replace(/<a([^>]*?)href=([^"'\s>]+)([^>]*?)>/gi, (match, before, href, after) => {
    // If href doesn't start with quote, add quotes
    if (!href.startsWith('"') && !href.startsWith("'")) {
      return `<a${before}href="${href}"${after}>`;
    }
    return match;
  });

  // Fix empty href
  fixed = fixed.replace(/<a([^>]*?)href=["']\s*["']([^>]*?)>/gi, '<a$1href="#"$2>');

  return fixed;
}

/**
 * Normalize HTML structure
 */
export function normalizeHTMLStructure(html: string): string {
  let normalized = html;

  // Remove empty paragraphs
  normalized = normalized.replace(/<p>\s*<\/p>/gi, '');
  normalized = normalized.replace(/<p><\/p>/gi, '');

  // Remove empty divs
  normalized = normalized.replace(/<div>\s*<\/div>/gi, '');
  normalized = normalized.replace(/<div><\/div>/gi, '');

  // Remove empty list items
  normalized = normalized.replace(/<li>\s*<\/li>/gi, '');
  normalized = normalized.replace(/<li><\/li>/gi, '');

  // Fix multiple consecutive line breaks
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Fix spaces in tags
  normalized = normalized.replace(/<(\w+)([^>]*?)\s+>/gi, '<$1$2>');

  // Ensure proper paragraph structure
  // If content starts with text (not a tag), wrap in paragraph
  if (normalized.trim() && !normalized.trim().startsWith('<')) {
    normalized = `<p>${normalized}</p>`;
  }

  // Fix nested paragraphs (not allowed in HTML)
  normalized = normalized.replace(/<p[^>]*>([^<]*)<p[^>]*>/gi, '<p>$1');

  // Fix heading hierarchy (ensure h1 comes before h2, etc.)
  // This is a basic check - full validation would require DOM parsing
  const h1Count = (normalized.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count > 1) {
    // Multiple h1 tags - convert extras to h2
    let h1Index = 0;
    normalized = normalized.replace(/<h1([^>]*)>/gi, (match) => {
      h1Index++;
      return h1Index === 1 ? match : `<h2${match.substring(3, match.length - 1)}>`;
    });
  }

  return normalized;
}

/**
 * Escape unsafe HTML (for display as text)
 */
export function escapeUnsafeHTML(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate HTML
 */
export function validateHTML(html: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!html || typeof html !== 'string') {
    return {
      isValid: false,
      errors: ['HTML içeriği boş veya geçersiz'],
      warnings: [],
    };
  }

  // Check for unclosed tags
  const openTags: string[] = [];
  const selfClosingTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');

    if (selfClosingTags.has(tagName)) {
      continue; // Skip self-closing tags
    }

    if (isClosing) {
      const lastOpenIndex = openTags.lastIndexOf(tagName);
      if (lastOpenIndex === -1) {
        warnings.push(`Kapatılmamış tag: </${tagName}>`);
      } else {
        openTags.splice(lastOpenIndex, 1);
      }
    } else {
      openTags.push(tagName);
    }
  }

  if (openTags.length > 0) {
    errors.push(`Açık kalan tag'ler: ${openTags.join(', ')}`);
  }

  // Check for broken image tags
  const brokenImages = html.match(/<img[^>]*(?!src=)[^>]*>/gi);
  if (brokenImages) {
    errors.push(`${brokenImages.length} adet bozuk görsel tag'i (src eksik)`);
  }

  // Check for empty tags
  const emptyTags = html.match(/<(p|div|span|h[1-6])[^>]*>\s*<\/\1>/gi);
  if (emptyTags) {
    warnings.push(`${emptyTags.length} adet boş tag bulundu`);
  }

  // Check for nested paragraphs (invalid HTML)
  const nestedParagraphs = html.match(/<p[^>]*>.*?<p[^>]*>/gi);
  if (nestedParagraphs) {
    errors.push('İç içe paragraf tag\'leri bulundu (geçersiz HTML)');
  }

  // Check for script tags (security risk)
  if (/<script[^>]*>/gi.test(html)) {
    errors.push('Script tag\'leri güvenlik riski oluşturuyor');
  }

  // Check for iframe tags (security risk)
  if (/<iframe[^>]*>/gi.test(html)) {
    warnings.push('Iframe tag\'leri güvenlik riski oluşturabilir');
  }

  // Try to fix if there are errors
  let fixedHTML: string | undefined;
  if (errors.length > 0) {
    try {
      fixedHTML = sanitizeAndRepairHTML(html);
    } catch (error) {
      // Fix failed
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedHTML,
  };
}

/**
 * Cleanup HTML (final pass)
 */
function cleanupHTML(html: string): string {
  let cleaned = html;

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Fix spacing around tags
  cleaned = cleaned.replace(/>\s+</g, '><');

  // Restore necessary spacing
  cleaned = cleaned.replace(/><(p|h[1-6]|div|ul|ol|li)/gi, '>\n<$1');
  cleaned = cleaned.replace(/(<\/p>|<\/h[1-6]>|<\/div>|<\/ul>|<\/ol>|<\/li>)</gi, '$1\n<');

  // Remove empty attributes
  cleaned = cleaned.replace(/\s+(\w+)=["']\s*["']/gi, '');

  return cleaned.trim();
}
