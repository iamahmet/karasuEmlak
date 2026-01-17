/**
 * Content Freshness System
 * Manages lastModified dates and content update tracking
 */

export interface ContentFreshness {
  lastModified: Date;
  updateFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0-1
}

/**
 * Get lastModified date for a page
 */
export async function getLastModified(
  type: 'listing' | 'article' | 'news' | 'neighborhood' | 'page',
  slug?: string,
  updatedAt?: string | Date
): Promise<Date> {
  // If updatedAt is provided, use it
  if (updatedAt) {
    return updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // For static pages, try to get from file system
  if (type === 'page') {
    // In production, this could read from file system
    // For now, return current date (will be improved)
    return new Date();
  }

  // Default to current date
  return new Date();
}

/**
 * Generate lastModified meta tag
 */
export function generateLastModifiedMeta(lastModified: Date): {
  'last-modified'?: string;
} {
  return {
    'last-modified': lastModified.toISOString(),
  };
}

/**
 * Get update frequency for content type
 */
export function getUpdateFrequency(
  type: 'listing' | 'article' | 'news' | 'neighborhood' | 'page'
): ContentFreshness['updateFrequency'] {
  const frequencies: Record<typeof type, ContentFreshness['updateFrequency']> = {
    listing: 'weekly',
    article: 'monthly',
    news: 'daily',
    neighborhood: 'monthly',
    page: 'monthly',
  };

  return frequencies[type];
}

/**
 * Get priority for content type
 */
export function getContentPriority(
  type: 'listing' | 'article' | 'news' | 'neighborhood' | 'page',
  isFeatured?: boolean
): number {
  const basePriorities: Record<typeof type, number> = {
    listing: 0.9,
    article: 0.7,
    news: 0.7,
    neighborhood: 0.8,
    page: 0.6,
  };

  const basePriority = basePriorities[type];
  return isFeatured ? Math.min(basePriority + 0.1, 1.0) : basePriority;
}
