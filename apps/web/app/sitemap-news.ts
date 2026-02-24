import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';

/**
 * News Sitemap for Google News
 * Updates daily, includes only recent news (last 2 days)
 */
export default async function sitemapNews(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'https://karasuemlak.net';
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('[sitemap-news] Failed to create Supabase client:', error?.message);
    return [];
  }
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

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of sitemapEntries) {
    const existing = deduped.get(entry.url);
    if (!existing) {
      deduped.set(entry.url, entry);
      continue;
    }

    const existingDate = existing.lastModified ? new Date(existing.lastModified) : new Date(0);
    const nextDate = entry.lastModified ? new Date(entry.lastModified) : new Date(0);
    deduped.set(entry.url, {
      ...existing,
      lastModified: nextDate > existingDate ? entry.lastModified : existing.lastModified,
      priority: Math.max(existing.priority || 0.8, entry.priority || 0.8),
    });
  }

  const dedupedEntries = Array.from(deduped.values());
  const pathLanguages = new Map<string, Record<string, string>>();

  for (const entry of dedupedEntries) {
    try {
      const url = new URL(entry.url);
      const normalizedPath = normalizeLocalePath(url.pathname || '/');
      const locale = extractLocaleFromPathname(url.pathname || '/');
      const localizedPath = normalizedPath === '/' ? '' : normalizedPath;
      const canonicalUrl =
        locale === routing.defaultLocale
          ? `${baseUrl}${localizedPath}`
          : `${baseUrl}/${locale}${localizedPath}`;

      const languages = pathLanguages.get(normalizedPath) || {};
      languages[locale] = canonicalUrl;
      pathLanguages.set(normalizedPath, languages);
    } catch {
      // Ignore invalid URLs; entry still returned
    }
  }

  return dedupedEntries
    .map((entry) => {
      try {
        const url = new URL(entry.url);
        const normalizedPath = normalizeLocalePath(url.pathname || '/');
        const languages = pathLanguages.get(normalizedPath);
        if (!languages) return entry;

        return {
          ...entry,
          alternates: {
            languages: pruneHreflangLanguages({
              ...languages,
              'x-default': languages[routing.defaultLocale] || entry.url,
            }),
          },
        };
      } catch {
        return entry;
      }
    })
    .sort((a, b) => {
      const aDate = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const bDate = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return bDate - aDate;
    });
}

function extractLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first && routing.locales.includes(first as any) && first !== routing.defaultLocale) {
    return first;
  }

  return routing.defaultLocale;
}

function normalizeLocalePath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first && routing.locales.includes(first as any) && first !== routing.defaultLocale) {
    const stripped = `/${segments.slice(1).join('/')}`.replace(/\/+$/, '');
    return stripped || '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}
