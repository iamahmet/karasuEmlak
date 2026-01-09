/**
 * Google Search Console Helper
 * 
 * Utilities for Search Console integration:
 * - Sitemap submission
 * - URL inspection
 * - Indexing status
 * - Performance data
 */

import { siteConfig } from '@karasu-emlak/config';

/**
 * Generate sitemap URLs for Search Console submission
 */
export function getSitemapUrls(): string[] {
  return [
    `${siteConfig.url}/sitemap.xml`,
    `${siteConfig.url}/sitemap-news.xml`,
    `${siteConfig.url}/sitemap-images.xml`,
  ];
}

/**
 * Generate robots.txt content with sitemap references
 */
export function generateRobotsTxtContent(): string {
  const sitemaps = getSitemapUrls();
  
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /favorilerim
Disallow: /karsilastir

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/

${sitemaps.map(sitemap => `Sitemap: ${sitemap}`).join('\n')}
`;
}

/**
 * Search Console verification meta tag
 * Add this to your layout.tsx head section
 */
export function getSearchConsoleVerificationMeta(): { name: string; content: string } | null {
  const verificationCode = process.env.GOOGLE_SITE_VERIFICATION;
  
  if (!verificationCode) {
    return null;
  }
  
  return {
    name: 'google-site-verification',
    content: verificationCode,
  };
}

/**
 * Generate Search Console API request for sitemap submission
 * Requires service account credentials
 */
export async function submitSitemapToSearchConsole(
  sitemapUrl: string,
  credentials?: {
    email: string;
    privateKey: string;
  }
): Promise<{ success: boolean; message: string }> {
  if (!credentials) {
    return {
      success: false,
      message: 'Search Console credentials not provided',
    };
  }

  try {
    // This would require googleapis package
    // For now, return instructions
    return {
      success: false,
      message: 'Manual submission required. Submit sitemaps at: https://search.google.com/search-console',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate URL for manual Search Console sitemap submission
 */
export function getSearchConsoleSitemapSubmissionUrl(): string {
  return `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteConfig.url)}`;
}

/**
 * Check if URL is indexed (requires Search Console API)
 */
export async function checkUrlIndexingStatus(
  url: string,
  credentials?: {
    email: string;
    privateKey: string;
  }
): Promise<{ indexed: boolean; lastCrawled?: string }> {
  // This would require Search Console API integration
  // For now, return placeholder
  return {
    indexed: false,
  };
}
