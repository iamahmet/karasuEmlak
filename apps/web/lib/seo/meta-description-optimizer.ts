/**
 * Meta Description Optimizer
 * 
 * Utility functions to optimize meta descriptions for SEO:
 * - Ensures 150-160 character length
 * - Removes AI-like phrases
 * - Adds call-to-action when appropriate
 * - Ensures keyword inclusion
 */

export interface MetaDescriptionOptions {
  minLength?: number;
  maxLength?: number;
  includeCTA?: boolean;
  keywords?: string[];
}

const DEFAULT_OPTIONS: Required<MetaDescriptionOptions> = {
  minLength: 150,
  maxLength: 160,
  includeCTA: true,
  keywords: [],
};

const AI_PHRASES = [
  'kapsamlı rehber',
  'detaylı bilgi',
  'geniş yelpaze',
  'çeşitli seçenekler',
  'geniş seçenek',
];

const CTA_PHRASES = [
  'hemen inceleyin',
  'şimdi keşfedin',
  'detaylı bilgi alın',
  'iletişime geçin',
  'uzman danışmanlık',
];

/**
 * Optimize meta description
 */
export function optimizeMetaDescription(
  description: string,
  options: MetaDescriptionOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let optimized = description.trim();

  // Remove AI-like phrases
  for (const phrase of AI_PHRASES) {
    optimized = optimized.replace(new RegExp(phrase, 'gi'), '');
  }

  // Clean up extra spaces
  optimized = optimized.replace(/\s+/g, ' ').trim();

  // Ensure keywords are included
  if (opts.keywords.length > 0) {
    const hasKeyword = opts.keywords.some(keyword =>
      optimized.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!hasKeyword && opts.keywords[0]) {
      optimized = `${opts.keywords[0]}. ${optimized}`;
    }
  }

  // Add CTA if needed and space allows
  if (opts.includeCTA && optimized.length < opts.maxLength - 20) {
    const cta = CTA_PHRASES[0];
    if (!optimized.toLowerCase().includes(cta)) {
      optimized = `${optimized} ${cta}.`;
    }
  }

  // Trim to max length if needed
  if (optimized.length > opts.maxLength) {
    optimized = optimized.substring(0, opts.maxLength - 3).trim() + '...';
  }

  // Ensure minimum length
  if (optimized.length < opts.minLength) {
    const padding = ' Detaylı bilgi için sayfamızı ziyaret edin.';
    optimized = optimized + padding;
    if (optimized.length > opts.maxLength) {
      optimized = optimized.substring(0, opts.maxLength - 3).trim() + '...';
    }
  }

  return optimized;
}

/**
 * Validate meta description
 */
export function validateMetaDescription(description: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (description.length < 120) {
    issues.push('Too short (should be 150-160 chars)');
  } else if (description.length > 165) {
    issues.push('Too long (should be 150-160 chars)');
  }

  // Check for AI-like phrases
  const hasAIPhrase = AI_PHRASES.some(phrase =>
    description.toLowerCase().includes(phrase.toLowerCase())
  );
  if (hasAIPhrase) {
    issues.push('Contains generic AI-like phrase');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
