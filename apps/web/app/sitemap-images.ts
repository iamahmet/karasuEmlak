import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';

/**
 * Images Sitemap
 * Includes all images from listings, articles, news, and neighborhoods
 */
export default async function sitemapImages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url || 'https://karasuemlak.net';
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('[sitemap-images] Failed to create Supabase client:', error?.message);
    return [];
  }

  const pageToImages = new Map<string, Set<string>>();
  const pageMeta = new Map<string, Omit<MetadataRoute.Sitemap[number], 'url' | 'images'>>();

  const upsertImageEntry = (params: {
    pageUrl: string;
    imageSource: unknown;
    lastModified?: string | Date | null;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }) => {
    const imageUrl = resolveSitemapImageUrl(params.imageSource);
    if (!imageUrl) return;

    const existingImages = pageToImages.get(params.pageUrl) || new Set<string>();
    existingImages.add(imageUrl);
    pageToImages.set(params.pageUrl, existingImages);

    const existingMeta = pageMeta.get(params.pageUrl);
    const candidateDate = params.lastModified ? new Date(params.lastModified) : new Date();

    if (!existingMeta) {
      pageMeta.set(params.pageUrl, {
        lastModified: candidateDate,
        changeFrequency: params.changeFrequency,
        priority: params.priority,
      });
      return;
    }

    const existingDate = existingMeta.lastModified ? new Date(existingMeta.lastModified) : new Date(0);
    pageMeta.set(params.pageUrl, {
      ...existingMeta,
      lastModified: candidateDate > existingDate ? candidateDate : existingMeta.lastModified,
      priority: Math.max(existingMeta.priority || 0.5, params.priority),
      changeFrequency: existingMeta.changeFrequency || params.changeFrequency,
    });
  };

  try {
    // Get listings with images
    const { data: listings } = await supabase
      .from('listings')
      .select('slug, images, updated_at')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null)
      .not('images', 'is', null);

    if (listings) {
      routing.locales.forEach((locale) => {
        listings.forEach((listing) => {
          const listingUrl = locale === routing.defaultLocale
            ? `${baseUrl}/ilan/${listing.slug}`
            : `${baseUrl}/${locale}/ilan/${listing.slug}`;

          // Add each image
          if (listing.images && Array.isArray(listing.images)) {
            listing.images.forEach((image: any) => {
              upsertImageEntry({
                pageUrl: listingUrl,
                imageSource: image,
                lastModified: listing.updated_at,
                changeFrequency: 'weekly',
                priority: 0.8,
              });
            });
          }
        });
      });
    }

    // Get articles with images
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, featured_image, updated_at')
      .eq('status', 'published')
      .is('deleted_at', null)
      .not('featured_image', 'is', null);

    if (articles) {
      routing.locales.forEach((locale) => {
        articles.forEach((article) => {
          const articleUrl = locale === routing.defaultLocale
            ? `${baseUrl}/blog/${article.slug}`
            : `${baseUrl}/${locale}/blog/${article.slug}`;

          if (article.featured_image) {
            upsertImageEntry({
              pageUrl: articleUrl,
              imageSource: article.featured_image,
              lastModified: article.updated_at,
              changeFrequency: 'monthly',
              priority: 0.7,
            });
          }
        });
      });
    }

    // Get news articles with images
    const { data: news } = await supabase
      .from('news_articles')
      .select('slug, featured_image, updated_at')
      .eq('published', true)
      .is('deleted_at', null)
      .not('featured_image', 'is', null);

    if (news) {
      routing.locales.forEach((locale) => {
        news.forEach((article) => {
          const newsUrl = locale === routing.defaultLocale
            ? `${baseUrl}/haberler/${article.slug}`
            : `${baseUrl}/${locale}/haberler/${article.slug}`;

          if (article.featured_image) {
            upsertImageEntry({
              pageUrl: newsUrl,
              imageSource: article.featured_image,
              lastModified: article.updated_at,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        });
      });
    }

    // Get neighborhoods with images
    const { data: neighborhoods } = await supabase
      .from('neighborhoods')
      .select('slug, image_url, updated_at')
      .eq('published', true)
      .not('image_url', 'is', null);

    if (neighborhoods) {
      routing.locales.forEach((locale) => {
        neighborhoods.forEach((neighborhood) => {
          const neighborhoodUrl = locale === routing.defaultLocale
            ? `${baseUrl}/mahalle/${neighborhood.slug}`
            : `${baseUrl}/${locale}/mahalle/${neighborhood.slug}`;

          if (neighborhood.image_url) {
            upsertImageEntry({
              pageUrl: neighborhoodUrl,
              imageSource: neighborhood.image_url,
              lastModified: neighborhood.updated_at,
              changeFrequency: 'monthly',
              priority: 0.8,
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('Error generating images sitemap:', error);
  }

  const entries: MetadataRoute.Sitemap = Array.from(pageToImages.entries()).map(([url, imagesSet]) => {
    const meta = pageMeta.get(url);
    return {
      url,
      lastModified: meta?.lastModified || new Date(),
      changeFrequency: meta?.changeFrequency || 'weekly',
      priority: meta?.priority || 0.5,
      images: Array.from(imagesSet),
    };
  });

  const pathLanguages = new Map<string, Record<string, string>>();
  for (const entry of entries) {
    try {
      const parsed = new URL(entry.url);
      const pathname = parsed.pathname || '/';
      const normalized = normalizeLocalePath(pathname);
      const locale = extractLocaleFromPathname(pathname);
      const pathForLocale = normalized === '/' ? '' : normalized;

      const localizedUrl =
        locale === routing.defaultLocale
          ? `${baseUrl}${pathForLocale}`
          : `${baseUrl}/${locale}${pathForLocale}`;

      const languages = pathLanguages.get(normalized) || {};
      languages[locale] = localizedUrl;
      pathLanguages.set(normalized, languages);
    } catch {
      // Keep entry
    }
  }

  return entries
    .map((entry) => {
      try {
        const parsed = new URL(entry.url);
        const normalized = normalizeLocalePath(parsed.pathname || '/');
        const languages = pathLanguages.get(normalized);
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
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      if (bPriority !== aPriority) return bPriority - aPriority;
      const aDate = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const bDate = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return bDate - aDate;
    });
}

function resolveSitemapImageUrl(imageSource: unknown): string | null {
  if (!imageSource) return null;

  if (typeof imageSource === 'string') {
    const url = getOptimizedCloudinaryUrl(imageSource, {
      width: 1200,
      height: 630,
      format: 'auto',
      quality: 90,
    });
    return url || null;
  }

  if (typeof imageSource === 'object') {
    const image = imageSource as Record<string, unknown>;
    const directUrl =
      (typeof image.url === 'string' && image.url) ||
      (typeof image.secure_url === 'string' && image.secure_url) ||
      (typeof image.cloudinary_secure_url === 'string' && image.cloudinary_secure_url) ||
      null;

    const publicId =
      (typeof image.public_id === 'string' && image.public_id) ||
      (typeof image.cloudinary_public_id === 'string' && image.cloudinary_public_id) ||
      null;

    if (publicId) {
      const optimized = getOptimizedCloudinaryUrl(publicId, {
        width: 1200,
        height: 630,
        format: 'auto',
        quality: 90,
      });
      if (optimized) return optimized;
    }

    if (directUrl) {
      const optimized = getOptimizedCloudinaryUrl(directUrl, {
        width: 1200,
        height: 630,
        format: 'auto',
        quality: 90,
      });
      return optimized || directUrl;
    }
  }

  return null;
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
