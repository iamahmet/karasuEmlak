/**
 * Article Content Image Processor
 * 
 * Processes images in article content HTML to ensure:
 * - Lazy loading
 * - Error handling
 * - Alt text generation
 * - URL validation and optimization
 * - Cloudinary URL optimization
 */

import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';

/**
 * Check if a URL is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Check if it's a valid URL
  try {
    const urlObj = new URL(trimmed);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Not a valid URL, might be a Cloudinary public_id
    return trimmed.length > 0;
  }
}

/**
 * Check if URL is a Cloudinary URL or public_id
 */
function isCloudinaryImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Full Cloudinary URL
  if (trimmed.includes('res.cloudinary.com')) {
    return true;
  }

  // Cloudinary public_id (no http/https, no slashes at start)
  if (isValidCloudinaryId(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Optimize image URL (Cloudinary or external)
 */
function optimizeImageUrl(url: string, articleTitle: string): string {
  if (!url || typeof url !== 'string') return url;

  const trimmed = url.trim();

  // If it's a Cloudinary public_id, optimize it
  if (isValidCloudinaryId(trimmed)) {
    try {
      const optimized = getOptimizedCloudinaryUrl(trimmed, {
        width: 1200,
        height: 800,
        quality: 85,
        format: 'auto',
        crop: 'fill',
      });
      return optimized || trimmed;
    } catch {
      return trimmed;
    }
  }

  // If it's already a full Cloudinary URL, return as-is
  if (trimmed.includes('res.cloudinary.com')) {
    return trimmed;
  }

  // External URL - validate and return
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Generate alt text for image if missing
 */
function generateImageAlt(src: string, articleTitle: string, existingAlt?: string): string {
  if (existingAlt && existingAlt.trim().length > 0) {
    return existingAlt.trim();
  }

  // Try to extract meaningful alt from filename
  try {
    const url = new URL(src);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    if (nameWithoutExt && nameWithoutExt.length > 0) {
      // Decode URL-encoded characters
      const decoded = decodeURIComponent(nameWithoutExt);
      // Clean up the name
      const cleaned = decoded
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length > 0 && cleaned.length < 100) {
        return `${cleaned} - ${articleTitle}`;
      }
    }
  } catch {
    // Not a valid URL, continue with default
  }

  // Default alt text
  return `${articleTitle} - Görsel`;
}

/**
 * Process article content HTML to optimize images
 */
export function processArticleContentImages(
  html: string,
  articleTitle: string
): string {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Process all img tags
  const processedHtml = html.replace(
    /<img([^>]*?)>/gi,
    (match, attributes) => {
      // Extract src attribute
      const srcMatch = attributes.match(/src=["']([^"']*?)["']/i);
      if (!srcMatch || !srcMatch[1]) {
        // No src attribute, return as-is but add error handling
        return `<img${attributes} loading="lazy" data-fallback-src="/images/placeholder-article.jpg">`;
      }

      const originalSrc = srcMatch[1];

      // Validate URL
      if (!isValidImageUrl(originalSrc)) {
        // Invalid URL, use placeholder
        const placeholderSrc = '/images/placeholder-article.jpg';
        const alt = generateImageAlt(originalSrc, articleTitle);
        return `<img src="${placeholderSrc}" alt="${alt}" loading="lazy" class="article-image" style="max-width: 100%; height: auto;">`;
      }

      // Optimize URL
      const optimizedSrc = optimizeImageUrl(originalSrc, articleTitle);

      // Extract existing alt attribute
      const altMatch = attributes.match(/alt=["']([^"']*?)["']/i);
      const existingAlt = altMatch ? altMatch[1] : undefined;

      // Generate alt text
      const alt = generateImageAlt(optimizedSrc, articleTitle, existingAlt);

      // Build new attributes
      let newAttributes = attributes;

      // Replace src
      newAttributes = newAttributes.replace(
        /src=["'][^"']*?["']/i,
        `src="${optimizedSrc}"`
      );

      // Replace or add alt
      if (altMatch) {
        newAttributes = newAttributes.replace(
          /alt=["'][^"']*?["']/i,
          `alt="${alt.replace(/"/g, '&quot;')}"`
        );
      } else {
        newAttributes += ` alt="${alt.replace(/"/g, '&quot;')}"`;
      }

      // Add loading="lazy" if not present
      if (!newAttributes.match(/loading=["']/i)) {
        newAttributes += ' loading="lazy"';
      }

      // Add data-fallback attribute for error handling (no inline onerror - CSP violation)
      // Actual fallback handled by ArticleImageErrorHandler component
      if (!newAttributes.match(/data-fallback-src=/i)) {
        const fallbackSrc = '/images/placeholder-article.jpg';
        newAttributes += ` data-fallback-src="${fallbackSrc}"`;
      }

      // Add class if not present
      if (!newAttributes.match(/class=["']/i)) {
        newAttributes += ' class="article-image"';
      } else {
        // Add article-image class if not already present
        newAttributes = newAttributes.replace(
          /class=["']([^"']*?)["']/i,
          (match: string, classes: string) => {
            if (classes.includes('article-image')) {
              return match;
            }
            return `class="${classes} article-image"`;
          }
        );
      }

      // Add style for responsive images if not present
      if (!newAttributes.match(/style=["']/i)) {
        newAttributes += ' style="max-width: 100%; height: auto;"';
      } else {
        // Ensure max-width is set
        newAttributes = newAttributes.replace(
          /style=["']([^"']*?)["']/i,
          (match: string, styles: string) => {
            if (styles.includes('max-width')) {
              return match;
            }
            return `style="${styles}; max-width: 100%; height: auto;"`;
          }
        );
      }

      return `<img${newAttributes}>`;
    }
  );

  return processedHtml;
}

/**
 * Process article content to enhance all images
 * This is a wrapper that also handles other content processing
 */
export function processArticleContent(
  html: string,
  articleTitle: string
): string {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Process images
  const processed = processArticleContentImages(html, articleTitle);

  // Additional processing can be added here:
  // - Link processing
  // - Video processing
  // - etc.

  return processed;
}
