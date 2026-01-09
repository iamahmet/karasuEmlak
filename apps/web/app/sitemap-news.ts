import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * News Sitemap for Google News
 * Updates daily, includes only recent news (last 2 days)
 */
export default async function sitemapNews(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const supabase = createServiceClient();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  try {
    // Get news articles from last 2 days (Google News requirement)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: news } = await supabase
      .from('news_articles')
      .select('slug, published_at, updated_at')
      .eq('published', true)
      .gte('published_at', twoDaysAgo.toISOString())
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(1000); // Google News limit

    if (news) {
      routing.locales.forEach((locale) => {
        news.forEach((article) => {
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/haberler/${article.slug}`
            : `${baseUrl}/${locale}/haberler/${article.slug}`;
          
          sitemapEntries.push({
            url,
            lastModified: article.updated_at || article.published_at
              ? new Date(article.updated_at || article.published_at)
              : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching news for sitemap:', error);
  }

  return sitemapEntries;
}
