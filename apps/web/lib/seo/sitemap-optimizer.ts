/**
 * Sitemap Optimization Utilities
 * Handles sitemap splitting, lastModified optimization, and priority calculation
 */

import { MetadataRoute } from 'next';
import { stat } from 'fs/promises';
import { join } from 'path';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Get file system lastModified date for static pages
 */
export async function getFileLastModified(filePath: string): Promise<Date | null> {
  try {
    const stats = await stat(filePath);
    return stats.mtime;
  } catch (error) {
    // File doesn't exist or can't be accessed
    return null;
  }
}

/**
 * Split sitemap into chunks (max 50,000 URLs per sitemap)
 */
export function splitSitemap(
  entries: SitemapEntry[],
  maxUrlsPerSitemap: number = 50000
): SitemapEntry[][] {
  const chunks: SitemapEntry[][] = [];
  
  for (let i = 0; i < entries.length; i += maxUrlsPerSitemap) {
    chunks.push(entries.slice(i, i + maxUrlsPerSitemap));
  }
  
  return chunks;
}

/**
 * Generate sitemap index
 */
export function generateSitemapIndex(
  sitemaps: Array<{ url: string; lastModified: Date }>
): MetadataRoute.Sitemap {
  return sitemaps.map((sitemap) => ({
    url: sitemap.url,
    lastModified: sitemap.lastModified,
    changeFrequency: 'daily',
    priority: 1.0,
  }));
}

/**
 * Optimize priority based on content type and importance
 */
export function calculatePriority(
  type: 'homepage' | 'cornerstone' | 'hub' | 'listing' | 'article' | 'news' | 'neighborhood' | 'page',
  isFeatured?: boolean,
  isNew?: boolean
): number {
  const basePriorities: Record<typeof type, number> = {
    homepage: 1.0,
    cornerstone: 0.9,
    hub: 0.9,
    listing: 0.8,
    article: 0.7,
    news: 0.7,
    neighborhood: 0.8,
    page: 0.6,
  };

  let priority = basePriorities[type] || 0.5;

  // Boost featured content
  if (isFeatured) {
    priority = Math.min(priority + 0.1, 1.0);
  }

  // Slight boost for new content
  if (isNew) {
    priority = Math.min(priority + 0.05, 1.0);
  }

  return priority;
}

/**
 * Get change frequency based on content type
 */
export function getChangeFrequency(
  type: 'listing' | 'article' | 'news' | 'neighborhood' | 'page'
): SitemapEntry['changeFrequency'] {
  const frequencies: Record<typeof type, SitemapEntry['changeFrequency']> = {
    listing: 'weekly',
    article: 'monthly',
    news: 'daily',
    neighborhood: 'monthly',
    page: 'monthly',
  };

  return frequencies[type];
}

/**
 * Sort sitemap entries by priority (highest first)
 */
export function sortSitemapEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return [...entries].sort((a, b) => b.priority - a.priority);
}
