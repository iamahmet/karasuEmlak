import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';

/**
 * SEO-Optimized Robots.txt
 * 
 * Features:
 * - Proper crawl directives for search engines
 * - Sitemap references for all sitemap types
 * - Crawl-delay for respectful crawling
 * - Allow/disallow rules for optimal indexing
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/favorilerim',
          '/karsilastir',
          '/aramalarim',
          '/yorumlar',
          '/*?*sort=*', // Disallow sorted/filtered URLs to prevent duplicate content
          '/*?*page=*', // Disallow pagination URLs (use canonical instead)
        ],
        crawlDelay: 0.5, // Respectful crawl delay (500ms)
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 0.1, // Faster for Googlebot
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 0.5,
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-news.xml`,
      `${siteConfig.url}/sitemap-images.xml`,
    ],
    host: siteConfig.url.replace('https://', '').replace('http://', ''),
  };
}

