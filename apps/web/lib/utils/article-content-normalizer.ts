/**
 * Article Content Normalizer
 * 
 * Normalizes and fixes legacy article content to ensure compatibility
 * with the current blog system. Handles:
 * - Empty or missing content
 * - Legacy HTML formats
 * - Missing excerpts/descriptions
 * - Image URL fixes and validation
 * - HTML sanitization
 * - Content quality checking
 * - AI pattern cleaning
 */

import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { sanitizeAndRepairHTML, validateHTML } from '@/lib/utils/html-content-processor';
import { cleanContent } from '@/lib/utils/content-cleaner';
import { detectLowQualityContent } from '@/lib/utils/content-quality-checker';
import { safeParseJSON } from '@/lib/utils/safe-json';

/**
 * Validate image URL
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  
  // Check if it's a valid HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  
  // Check if it's a Cloudinary public_id
  if (isValidCloudinaryId(trimmed)) {
    return true;
  }
  
  // Check if it's a relative path
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return true;
  }
  
  return false;
}

/**
 * Normalize article content - ensures content is valid and properly formatted
 * Now includes HTML sanitization, content cleaning, and quality checking
 */
export function normalizeArticleContent(
  content: string | null | undefined,
  options: {
    sanitize?: boolean;
    clean?: boolean;
    checkQuality?: boolean;
    title?: string;
  } = {}
): string {
  if (!content || typeof content !== 'string') {
    return '<p>Bu yazının içeriği henüz eklenmemiş.</p>';
  }

  // Trim whitespace
  let normalized = content.trim();

  // If content is empty after trimming
  if (normalized.length === 0) {
    return '<p>Bu yazının içeriği henüz eklenmemiş.</p>';
  }

  // Step 0: Fix content accidentally stored as raw AI JSON response (Gemini/OpenAI)
  // e.g. {"title":"...","content":"<p>...</p>...","excerpt":"...","meta_description":"...","seo_keywords":"..."}
  if (normalized.startsWith('{') && normalized.includes('"content"')) {
    const parsed = safeParseJSON<{ content?: string }>(normalized, null, 'article-content-normalizer');
    if (parsed && typeof parsed.content === 'string' && parsed.content.trim().length > 0) {
      normalized = parsed.content.trim();
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Content Normalizer] Extracted HTML from raw AI JSON response');
      }
    }
  }

  // Step 1: Clean AI placeholders and repetitive content (if enabled)
  if (options.clean !== false) {
    normalized = cleanContent(normalized);
  }

  // Step 2: Fix common legacy HTML issues
  // Remove empty paragraphs
  normalized = normalized.replace(/<p>\s*<\/p>/gi, '');
  
  // Fix broken image tags (legacy format) with improved validation
  normalized = normalized.replace(
    /<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      // Validate image URL
      if (!isValidImageUrl(src)) {
        // Invalid URL, replace with placeholder
        const placeholderSrc = '/images/placeholder-article.jpg';
        const hasAlt = match.includes('alt=');
        const alt = hasAlt ? '' : ' alt="Blog görseli"';
        return `<img${before}src="${placeholderSrc}"${after}${alt} loading="lazy">`;
      }
      
      // Ensure alt attribute exists
      if (!match.includes('alt=')) {
        return `<img${before}src="${src}"${after} alt="Blog görseli">`;
      }
      
      // Ensure loading attribute exists for lazy loading
      if (!match.includes('loading=')) {
        return `<img${before}src="${src}"${after} loading="lazy">`;
      }
      
      return match;
    }
  );
  
  // Fix images without src attribute (broken images)
  normalized = normalized.replace(
    /<img([^>]*?)(?!src=)([^>]*?)>/gi,
    (match, attrs) => {
      // If no src attribute, add placeholder
      if (!match.includes('src=')) {
        const hasAlt = match.includes('alt=');
        const alt = hasAlt ? '' : ' alt="Görsel yüklenemedi"';
        return `<img src="/images/placeholder-article.jpg"${attrs}${alt} loading="lazy">`;
      }
      return match;
    }
  );

  // Step 3: HTML sanitization and repair (if enabled)
  if (options.sanitize !== false) {
    const validation = validateHTML(normalized);
    if (!validation.isValid && validation.fixedHTML) {
      normalized = validation.fixedHTML;
    } else {
      normalized = sanitizeAndRepairHTML(normalized);
    }
  }

  // Step 4: Ensure content is wrapped in proper HTML structure if it's just plain text
  if (!normalized.includes('<') && normalized.length > 0) {
    // Split by double newlines to create paragraphs
    const paragraphs = normalized.split(/\n\n+/).filter(p => p.trim().length > 0);
    normalized = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
  }

  // Step 5: Quality check (optional, for logging/debugging)
  if (options.checkQuality && options.title) {
    try {
      const qualityScore = detectLowQualityContent(normalized, options.title);
      if (qualityScore.overall < 50 && process.env.NODE_ENV === 'development') {
        console.warn(`[Content Normalizer] Low quality content detected (score: ${qualityScore.overall})`);
      }
    } catch (error) {
      // Quality check failed, continue anyway
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Content Normalizer] Quality check failed:', error);
      }
    }
  }

  return normalized;
}

/**
 * Generate excerpt from content if excerpt is missing
 */
export function generateExcerptFromContent(
  content: string | null | undefined,
  maxLength: number = 160
): string {
  if (!content) return '';

  // Strip HTML tags
  const textContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (textContent.length <= maxLength) {
    return textContent;
  }

  // Find the last complete sentence before maxLength
  const truncated = textContent.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > maxLength * 0.5) {
    return textContent.substring(0, lastSentenceEnd + 1);
  }

  return truncated + '...';
}

/**
 * Normalize article featured image URL
 */
export function normalizeFeaturedImage(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  const trimmed = imageUrl.trim();

  // Empty string
  if (trimmed.length === 0) {
    return null;
  }

  // Already a valid URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return null;
    }
  }

  // Cloudinary ID (without full URL)
  if (trimmed.match(/^[a-zA-Z0-9_\/-]+$/)) {
    return trimmed; // Will be handled by Cloudinary optimization
  }

  return null;
}

/**
 * Normalize article metadata
 * Now includes enhanced content normalization with quality checking
 */
export function normalizeArticleMetadata(
  article: {
    content?: string | null;
    excerpt?: string | null;
    meta_description?: string | null;
    featured_image?: string | null;
    author?: string | null;
    category?: string | null;
    tags?: string[] | null;
    title?: string | null;
  },
  options: {
    sanitize?: boolean;
    clean?: boolean;
    checkQuality?: boolean;
  } = {}
) {
  // Normalize content with enhanced options
  const normalizedContent = normalizeArticleContent(article.content, {
    sanitize: options.sanitize,
    clean: options.clean,
    checkQuality: options.checkQuality,
    title: article.title || undefined,
  });

  // Generate excerpt if missing
  const normalizedExcerpt = article.excerpt?.trim() || 
    generateExcerptFromContent(normalizedContent, 200);

  // Generate meta description if missing
  const normalizedMetaDescription = article.meta_description?.trim() || 
    normalizedExcerpt ||
    generateExcerptFromContent(normalizedContent, 160);

  // Normalize featured image
  const normalizedFeaturedImage = normalizeFeaturedImage(article.featured_image);

  // Normalize author
  const normalizedAuthor = article.author?.trim() || 'Karasu Emlak';

  // Normalize category
  const normalizedCategory = article.category?.trim() || null;

  // Normalize tags
  const normalizedTags = Array.isArray(article.tags) && article.tags.length > 0
    ? article.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
    : null;

  return {
    content: normalizedContent,
    excerpt: normalizedExcerpt,
    meta_description: normalizedMetaDescription,
    featured_image: normalizedFeaturedImage,
    author: normalizedAuthor,
    category: normalizedCategory,
    tags: normalizedTags,
  };
}

/**
 * Check if article needs normalization (legacy article)
 */
export function isLegacyArticle(article: {
  content?: string | null;
  excerpt?: string | null;
  meta_description?: string | null;
}): boolean {
  const hasEmptyContent = !article.content || article.content.trim().length === 0;
  const hasNoExcerpt = !article.excerpt || article.excerpt.trim().length === 0;
  const hasNoMetaDescription = !article.meta_description || article.meta_description.trim().length === 0;

  return hasEmptyContent || (hasNoExcerpt && hasNoMetaDescription);
}
