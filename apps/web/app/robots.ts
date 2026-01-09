import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/favorilerim', '/karsilastir'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-news.xml`,
      `${siteConfig.url}/sitemap-images.xml`,
    ],
  };
}

