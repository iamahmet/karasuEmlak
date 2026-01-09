import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '@/lib/utils';

/**
 * Professional Sitemap Generator
 * 
 * Features:
 * - Multi-locale support with hreflang alternates
 * - Dynamic content from database (listings, articles, news, neighborhoods)
 * - Programmatic SEO pages
 * - Optimized priorities and change frequencies
 * - Proper lastModified dates
 * - Sitemap index support (sitemap.xml, sitemap-news.xml, sitemap-images.xml)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const supabase = createServiceClient();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes with optimized priorities and frequencies
  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }> = [
    // High priority pages
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/satilik', priority: 0.9, changeFrequency: 'daily' },
    { path: '/kiralik', priority: 0.9, changeFrequency: 'daily' },
    { path: '/karasu', priority: 0.9, changeFrequency: 'weekly' },
    
    // Important content pages
    { path: '/karasu-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-satilik-ev-fiyatlari', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-emlak-rehberi', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/karasu-yatirimlik-gayrimenkul', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-emlak-ofisi', priority: 0.7, changeFrequency: 'monthly' },
    
    // Comparison pages
    { path: '/karasu-vs-kocaali-satilik-ev', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/karasu-vs-kocaali-yatirim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/karasu-vs-kocaali-yasam', priority: 0.7, changeFrequency: 'monthly' },
    
    // Location-specific pages
    { path: '/karasu-merkez-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-denize-yakin-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-yatirimlik-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-mustakil-satilik-ev', priority: 0.7, changeFrequency: 'weekly' },
    
    // Karasu sub-pages
    { path: '/karasu/gezilecek-yerler', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/karasu/hastaneler', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/karasu/nobetci-eczaneler', priority: 0.6, changeFrequency: 'daily' },
    { path: '/karasu/restoranlar', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/karasu/ulasim', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/karasu/onemli-telefonlar', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/karasu/mahalle-karsilastirma', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/mahalleler', priority: 0.8, changeFrequency: 'weekly' },
    
    // Neighborhood pages
    { path: '/karasu/merkez', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/sahil', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/yali', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/aziziye', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/cumhuriyet', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/ataturk', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/bota', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/liman', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/camlik', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/karasu/kurtulus', priority: 0.7, changeFrequency: 'weekly' },
    
    // Kocaali pages
    { path: '/kocaali', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/kocaali-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/kocaali-yatirimlik-gayrimenkul', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/kocaali-satilik-ev-fiyatlari', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/kocaali-emlak-rehberi', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/kocaali/mahalleler', priority: 0.7, changeFrequency: 'weekly' },
    
    // Content pages
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { path: '/haberler', priority: 0.8, changeFrequency: 'daily' },
    { path: '/haberler/karasu-emlak', priority: 0.7, changeFrequency: 'weekly' },
    
    // Guide pages
    { path: '/rehber', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/emlak-alim-satim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/kiralama', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/yatirim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehberler', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehberler/ev-nasil-satilir', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/kredi-nasil-alinir', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/tapu-islemleri', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/ekspertiz-sureci', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/emlak-vergisi', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/ev-nasil-alinir', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/ev-nasil-kiralanir', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/rehberler/yatirim-yapma', priority: 0.6, changeFrequency: 'monthly' },
    
    // Utility pages
    { path: '/kredi-hesaplayici', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/yatirim-hesaplayici', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/sss', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/hakkimizda', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/iletisim', priority: 0.5, changeFrequency: 'monthly' },
    
    // Legal pages
    { path: '/kvkk-basvuru', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cerez-politikasi', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/gizlilik-politikasi', priority: 0.3, changeFrequency: 'yearly' },
    
    // Other pages
    { path: '/karasu-deprem', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/karasuspor', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/karasu-mahalleler', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/sakarya-emlak-yatirim-rehberi', priority: 0.7, changeFrequency: 'monthly' },
  ];

  // Get current date for static pages (could be improved with file system timestamps)
  const staticLastModified = new Date();
  
  // Add static routes for all locales
  routing.locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      const url = locale === routing.defaultLocale
        ? `${baseUrl}${route.path || ''}`
        : `${baseUrl}/${locale}${route.path}`;
      
      sitemapEntries.push({
        url,
        lastModified: staticLastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    });
  });

  // Add dynamic listings (high priority)
  try {
    const { data: listings } = await supabase
      .from('listings')
      .select('slug, updated_at, status, created_at')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (listings && listings.length > 0) {
      routing.locales.forEach((locale) => {
        listings.forEach((listing) => {
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/ilan/${listing.slug}`
            : `${baseUrl}/${locale}/ilan/${listing.slug}`;
          
          // Use updated_at if available, otherwise created_at
          const lastModified = listing.updated_at 
            ? new Date(listing.updated_at) 
            : listing.created_at 
            ? new Date(listing.created_at)
            : new Date();
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'weekly',
            priority: listing.status === 'satilik' ? 0.9 : 0.8,
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching listings for sitemap:', error);
  }

  // Add dynamic articles (blog)
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at, created_at')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false });

    if (articles && articles.length > 0) {
      routing.locales.forEach((locale) => {
        articles.forEach((article) => {
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/blog/${article.slug}`
            : `${baseUrl}/${locale}/blog/${article.slug}`;
          
          const lastModified = article.updated_at 
            ? new Date(article.updated_at) 
            : article.published_at 
            ? new Date(article.published_at)
            : article.created_at
            ? new Date(article.created_at)
            : new Date();
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  // Add dynamic news articles
  try {
    const { data: news } = await supabase
      .from('news_articles')
      .select('slug, published_at, updated_at, created_at')
      .eq('published', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false });

    if (news && news.length > 0) {
      routing.locales.forEach((locale) => {
        news.forEach((article) => {
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/haberler/${article.slug}`
            : `${baseUrl}/${locale}/haberler/${article.slug}`;
          
          const lastModified = article.updated_at 
            ? new Date(article.updated_at) 
            : article.published_at 
            ? new Date(article.published_at)
            : article.created_at
            ? new Date(article.created_at)
            : new Date();
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching news for sitemap:', error);
  }

  // Add programmatic SEO pages - Neighborhoods
  try {
    const { data: neighborhoods } = await supabase
      .from('neighborhoods')
      .select('slug, name, updated_at, created_at')
      .eq('published', true)
      .order('name', { ascending: true });

    if (neighborhoods && neighborhoods.length > 0) {
      routing.locales.forEach((locale) => {
        neighborhoods.forEach((neighborhood) => {
          const slug = neighborhood.slug || generateSlug(neighborhood.name || '');
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/mahalle/${slug}`
            : `${baseUrl}/${locale}/mahalle/${slug}`;
          
          const lastModified = neighborhood.updated_at 
            ? new Date(neighborhood.updated_at) 
            : neighborhood.created_at
            ? new Date(neighborhood.created_at)
            : new Date();
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
          });
        });
      });
    } else {
      // Fallback: get from listings
      const { getNeighborhoods } = await import('../lib/supabase/queries/listings');
      const neighborhoodsList = await getNeighborhoods();

      if (neighborhoodsList && neighborhoodsList.length > 0) {
        routing.locales.forEach((locale) => {
          neighborhoodsList.forEach((neighborhood) => {
            const slug = generateSlug(neighborhood);
            const url = locale === routing.defaultLocale
              ? `${baseUrl}/mahalle/${slug}`
              : `${baseUrl}/${locale}/mahalle/${slug}`;
            
            sitemapEntries.push({
              url,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.8,
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching neighborhoods for sitemap:', error);
  }

  // Add programmatic SEO pages - Property Types
  try {
    const { getPropertyTypes } = await import('../lib/supabase/queries/listings');
    const propertyTypes = await getPropertyTypes();

    if (propertyTypes && propertyTypes.length > 0) {
      routing.locales.forEach((locale) => {
        propertyTypes.forEach((propertyType) => {
          const slug = propertyType.toLowerCase();
          
          // Add /tip/[slug] pages
          const typeUrl = locale === routing.defaultLocale
            ? `${baseUrl}/tip/${slug}`
            : `${baseUrl}/${locale}/tip/${slug}`;
          
          sitemapEntries.push({
            url: typeUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });

          // Add /satilik/[tip] pages (higher priority)
          const satilikUrl = locale === routing.defaultLocale
            ? `${baseUrl}/satilik/${slug}`
            : `${baseUrl}/${locale}/satilik/${slug}`;
          
          sitemapEntries.push({
            url: satilikUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
          });

          // Add /kiralik/[tip] pages
          const kiralikUrl = locale === routing.defaultLocale
            ? `${baseUrl}/kiralik/${slug}`
            : `${baseUrl}/${locale}/kiralik/${slug}`;
          
          sitemapEntries.push({
            url: kiralikUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
          });
        });
      });
    }
  } catch (error) {
    console.error('Error fetching property types for sitemap:', error);
  }

  // Sort entries by priority (highest first) for better SEO
  sitemapEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return sitemapEntries;
}
