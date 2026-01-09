import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';

/**
 * Images Sitemap
 * Includes all images from listings, articles, news, and neighborhoods
 */
export default async function sitemapImages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const supabase = createServiceClient();
  const sitemapEntries: MetadataRoute.Sitemap = [];

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
              if (image.public_id) {
                const imageUrl = getOptimizedCloudinaryUrl(image.public_id, {
                  width: 1200,
                  height: 630,
                  format: 'auto',
                  quality: 90,
                });
                
                sitemapEntries.push({
                  url: listingUrl,
                  lastModified: listing.updated_at ? new Date(listing.updated_at) : new Date(),
                  changeFrequency: 'weekly',
                  priority: 0.8,
                });
              }
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
            sitemapEntries.push({
              url: articleUrl,
              lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
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
            sitemapEntries.push({
              url: newsUrl,
              lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
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
            sitemapEntries.push({
              url: neighborhoodUrl,
              lastModified: neighborhood.updated_at ? new Date(neighborhood.updated_at) : new Date(),
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

  return sitemapEntries;
}
