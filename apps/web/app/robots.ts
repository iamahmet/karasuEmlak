import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';

/**
 * SEO-Optimized Robots.txt
 * 
 * Features:
 * - Proper crawl directives for search engines
 * - Sitemap references for all sitemap types
 * - Allow/disallow rules for optimal indexing
 * - Personal pages (favorilerim, karsilastir, aramalarim) disallowed
 * - Google ignores crawl-delay; AI bots use it where supported
 */
export default function robots(): MetadataRoute.Robots {
  try {
    const baseUrl = siteConfig.url || 'https://karasuemlak.net';
    
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
            '/listings/new',
            '/*?*sort=*', // Disallow sorted/filtered URLs to prevent duplicate content
          ],
        },
        {
          userAgent: 'Googlebot',
          allow: '/',
          disallow: ['/api/', '/admin/', '/favorilerim', '/karsilastir', '/aramalarim', '/listings/new'],
        },
        {
          userAgent: 'Googlebot-Image',
          allow: '/',
          disallow: ['/api/', '/admin/', '/favorilerim', '/karsilastir', '/aramalarim'],
        },
        {
          userAgent: 'Bingbot',
          allow: '/',
          disallow: ['/api/', '/admin/', '/favorilerim', '/karsilastir', '/aramalarim', '/listings/new'],
        },
        {
          userAgent: 'GPTBot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
        {
          userAgent: 'ChatGPT-User',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
        {
          userAgent: 'CCBot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
        {
          userAgent: 'anthropic-ai',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
        {
          userAgent: 'Claude-Web',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
        {
          userAgent: 'PerplexityBot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
          crawlDelay: 0.5,
        },
      ],
      sitemap: [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-news.xml`,
        `${baseUrl}/sitemap-images.xml`,
      ],
      host: baseUrl.replace('https://', '').replace('http://', ''),
    };
  } catch (error: any) {
    console.error('[robots] Error generating robots.txt:', error);
    // Return minimal robots.txt on error
    return {
      rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
      sitemap: [`https://karasuemlak.net/sitemap.xml`],
      host: 'karasuemlak.net',
    };
  }
}
