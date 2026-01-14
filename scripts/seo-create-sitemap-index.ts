/**
 * Create Sitemap Index
 * 
 * Creates a sitemap index file that references all sitemap types:
 * - Main sitemap
 * - News sitemap
 * - Images sitemap
 * - Listings sitemap (if exists)
 */

import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';

/**
 * Sitemap Index
 * References all sitemap types for better organization
 */
export default function sitemapIndex(): MetadataRoute.SitemapIndex {
  const baseUrl = siteConfig.url;
  
  return [
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-news.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-images.xml`,
      lastModified: new Date(),
    },
  ];
}
