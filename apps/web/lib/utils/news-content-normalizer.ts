/**
 * News Content Normalizer
 * 
 * News-specific content normalization for RSS feeds and external sources.
 * Handles:
 * - RSS feed content cleaning
 * - External source content processing
 * - HTML sanitization for news
 * - emlak_analysis and original_summary normalization
 */

import { sanitizeAndRepairHTML, validateHTML } from '@/lib/utils/html-content-processor';
import { cleanContent } from '@/lib/utils/content-cleaner';

/**
 * Normalize news content (original_summary and emlak_analysis)
 */
export function normalizeNewsContent(
  content: string | null | undefined,
  options: {
    sanitize?: boolean;
    clean?: boolean;
    type?: 'summary' | 'analysis';
  } = {}
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let normalized = content.trim();

  // If content is empty after trimming
  if (normalized.length === 0) {
    return '';
  }

  // Step 1: Clean AI placeholders and repetitive content (if enabled)
  if (options.clean !== false) {
    normalized = cleanContent(normalized);
  }

  // Step 2: Remove RSS feed artifacts
  normalized = removeRSSArtifacts(normalized);

  // Step 3: Clean external source formatting
  normalized = cleanExternalSourceFormatting(normalized, options.type);

  // Step 4: HTML sanitization and repair (if enabled)
  if (options.sanitize !== false) {
    const validation = validateHTML(normalized);
    if (!validation.isValid && validation.fixedHTML) {
      normalized = validation.fixedHTML;
    } else {
      normalized = sanitizeAndRepairHTML(normalized);
    }
  }

  // Step 5: Ensure proper text formatting for news
  normalized = formatNewsText(normalized, options.type);

  return normalized.trim();
}

/**
 * Remove RSS feed artifacts
 */
function removeRSSArtifacts(content: string): string {
  let cleaned = content;

  // Remove RSS feed metadata
  cleaned = cleaned.replace(/<rss[^>]*>.*?<\/rss>/gis, '');
  cleaned = cleaned.replace(/<channel[^>]*>.*?<\/channel>/gis, '');
  cleaned = cleaned.replace(/<item[^>]*>.*?<\/item>/gis, '');

  // Remove CDATA sections (keep content)
  cleaned = cleaned.replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1');

  // Remove RSS namespace attributes
  cleaned = cleaned.replace(/\s+xmlns[^=]*="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+[a-z]+:[a-z]+="[^"]*"/gi, '');

  // Remove feed-specific tags
  cleaned = cleaned.replace(/<pubDate[^>]*>.*?<\/pubDate>/gi, '');
  cleaned = cleaned.replace(/<guid[^>]*>.*?<\/guid>/gi, '');
  cleaned = cleaned.replace(/<link[^>]*>.*?<\/link>/gi, '');

  return cleaned;
}

/**
 * Clean external source formatting
 */
function cleanExternalSourceFormatting(content: string, type?: 'summary' | 'analysis'): string {
  let cleaned = content;

  // Remove source attribution if it's at the end
  cleaned = cleaned.replace(/\s*\(Kaynak:[^)]+\)\s*$/i, '');
  cleaned = cleaned.replace(/\s*Kaynak:[^\n]+\s*$/i, '');

  // Remove "Read more" links
  cleaned = cleaned.replace(/<a[^>]*>.*?devamını oku.*?<\/a>/gi, '');
  cleaned = cleaned.replace(/<a[^>]*>.*?read more.*?<\/a>/gi, '');

  // Remove social media sharing buttons
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*share[^"']*["'][^>]*>.*?<\/div>/gis, '');
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*social[^"']*["'][^>]*>.*?<\/div>/gis, '');

  // Remove author bylines (for summary, keep for analysis if relevant)
  if (type === 'summary') {
    cleaned = cleaned.replace(/<p[^>]*>.*?Yazar:[^<]*<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>.*?Author:[^<]*<\/p>/gi, '');
  }

  // Remove timestamps
  cleaned = cleaned.replace(/\d{1,2}[./]\d{1,2}[./]\d{2,4}\s+\d{1,2}:\d{2}/g, '');

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s{3,}/g, ' ');

  return cleaned;
}

/**
 * Format news text appropriately
 */
function formatNewsText(content: string, type?: 'summary' | 'analysis'): string {
  let formatted = content;

  // For summary: ensure it's a single paragraph or short list
  if (type === 'summary') {
    // If content has multiple paragraphs, take first one or combine
    const paragraphs = formatted.match(/<p[^>]*>.*?<\/p>/gi);
    if (paragraphs && paragraphs.length > 1) {
      // Take first paragraph or combine first two if short
      const firstPara = paragraphs[0];
      const secondPara = paragraphs[1];
      const combinedLength = (firstPara + secondPara).replace(/<[^>]*>/g, '').length;
      
      if (combinedLength < 300) {
        formatted = `<p>${(firstPara + secondPara).replace(/<p[^>]*>|<\/p>/gi, '')}</p>`;
      } else {
        formatted = firstPara;
      }
    }

    // Remove headings from summary
    formatted = formatted.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '');
  }

  // For analysis: ensure proper structure
  if (type === 'analysis') {
    // Ensure it starts with a paragraph if it doesn't start with a heading
    if (!formatted.trim().startsWith('<h')) {
      const firstTagIndex = formatted.indexOf('<');
      if (firstTagIndex > 0) {
        const textBefore = formatted.substring(0, firstTagIndex).trim();
        if (textBefore.length > 0) {
          formatted = `<p>${textBefore}</p>${formatted.substring(firstTagIndex)}`;
        }
      } else if (firstTagIndex === -1) {
        // No tags, wrap in paragraph
        formatted = `<p>${formatted}</p>`;
      }
    }
  }

  // Ensure proper spacing
  formatted = formatted.replace(/(<\/p>)\s*(<p)/gi, '$1\n$2');
  formatted = formatted.replace(/(<\/h[1-6]>)\s*(<p)/gi, '$1\n\n$2');

  return formatted;
}

/**
 * Normalize news article metadata
 */
export function normalizeNewsMetadata(news: {
  original_summary?: string | null;
  emlak_analysis?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | string[] | null;
}, options: {
  sanitize?: boolean;
  clean?: boolean;
} = {}) {
  // Normalize original_summary
  const normalizedSummary = normalizeNewsContent(news.original_summary, {
    sanitize: options.sanitize,
    clean: options.clean,
    type: 'summary',
  });

  // Normalize emlak_analysis
  const normalizedAnalysis = normalizeNewsContent(news.emlak_analysis, {
    sanitize: options.sanitize,
    clean: options.clean,
    type: 'analysis',
  });

  // Normalize SEO description
  const normalizedSEODescription = news.seo_description?.trim() || 
    normalizedSummary.replace(/<[^>]*>/g, '').substring(0, 155).trim();

  // Normalize SEO keywords
  const normalizedSEOKeywords = news.seo_keywords 
    ? (Array.isArray(news.seo_keywords) 
        ? news.seo_keywords.filter(kw => kw && typeof kw === 'string' && kw.trim().length > 0)
        : typeof news.seo_keywords === 'string'
          ? news.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
          : [])
    : null;

  return {
    original_summary: normalizedSummary,
    emlak_analysis: normalizedAnalysis,
    seo_description: normalizedSEODescription,
    seo_keywords: normalizedSEOKeywords as string[] | null,
  };
}
