import { MetadataRoute } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '@/lib/utils';
import { calculatePriority, getChangeFrequency, sortSitemapEntries } from '@/lib/seo/sitemap-optimizer';

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
  try {
    const baseUrl = siteConfig.url || 'https://karasuemlak.net';
    let supabase;
    
    try {
      supabase = createServiceClient();
    } catch (error: any) {
      console.error('[sitemap] Failed to create Supabase client:', error.message);
      // Return minimal sitemap with static routes only
      return getStaticSitemap(baseUrl);
    }
    
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
    
    // General cornerstone pages (high priority for SEO)
    { path: '/satilik-daire', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "satılık daire" keyword
    { path: '/satilik-villa', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "satılık villa" keyword
    { path: '/satilik-yazlik', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "satılık yazlık" keyword
    { path: '/satilik-ev', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "satılık ev" keyword
    { path: '/satilik-arsa', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "satılık arsa" keyword
    { path: '/kiralik-daire', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "kiralık daire" keyword
    { path: '/kiralik-ev', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "kiralık ev" keyword
    { path: '/kiralik-villa', priority: 0.9, changeFrequency: 'daily' }, // Cornerstone: "kiralık villa" keyword
    
    // Location-specific pages (Karasu)
    { path: '/karasu-satilik-ev', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/karasu-satilik-daire', priority: 0.9, changeFrequency: 'daily' }, // High priority for "karasu satılık daire" keyword
    
    // Long-tail keyword pages: Oda sayısı bazlı
    { path: '/karasu-1-1-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu 1+1 satılık daire"
    { path: '/karasu-2-1-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu 2+1 satılık daire"
    { path: '/karasu-3-1-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu 3+1 satılık daire"
    { path: '/karasu-4-1-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu 4+1 satılık daire"
    
    // Özellik bazlı sayfalar
    { path: '/karasu-denize-sifir-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu denize sıfır satılık daire"
    { path: '/karasu-asansorlu-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu asansörlü satılık daire"
    
    // Fiyat aralığı bazlı sayfalar
    { path: '/karasu-ucuz-satilik-daire', priority: 0.85, changeFrequency: 'daily' }, // "karasu ucuz satılık daire" (1M altı)
    { path: '/karasu-satilik-villa', priority: 0.9, changeFrequency: 'daily' }, // High priority for "karasu satılık villa" keyword
    { path: '/karasu-satilik-yazlik', priority: 0.9, changeFrequency: 'daily' }, // High priority for "karasu satılık yazlık" keyword
    { path: '/karasu-kiralik-daire', priority: 0.9, changeFrequency: 'daily' }, // High priority for "karasu kiralık daire" keyword
    { path: '/karasu-kiralik-ev', priority: 0.9, changeFrequency: 'daily' }, // High priority for "karasu kiralık ev" keyword
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
    { path: '/karasu/ramazan-imsakiyesi', priority: 0.7, changeFrequency: 'daily' },
    { path: '/karasu/iftara-kac-dakika-kaldi', priority: 0.7, changeFrequency: 'hourly' },
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
    
    // Sapanca pages
    { path: '/sapanca', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/sapanca/bungalov', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/sapanca/gunluk-kiralik', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/sapanca/satilik-daire', priority: 0.9, changeFrequency: 'daily' },
    { path: '/sapanca/satilik-yazlik', priority: 0.9, changeFrequency: 'daily' },
    { path: '/sapanca/satilik-bungalov', priority: 0.9, changeFrequency: 'daily' },
    { path: '/sapanca/gezilecek-yerler', priority: 0.7, changeFrequency: 'monthly' },
    
    // Content pages
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { path: '/blog/ramazan-2026', priority: 0.75, changeFrequency: 'daily' },
    { path: '/blog/etiket/ramazan', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/blog/etiket/bayram', priority: 0.55, changeFrequency: 'weekly' },
    { path: '/haberler', priority: 0.8, changeFrequency: 'daily' },
    { path: '/haberler/karasu-emlak', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/yorumlar', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/istatistikler/fiyat-analizi-dashboard', priority: 0.8, changeFrequency: 'daily' },
    
    // Guide pages
    { path: '/rehber', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/emlak-alim-satim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/kiralama', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/rehber/yatirim', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/yatirim/kapsamli-rehber', priority: 0.8, changeFrequency: 'monthly' },
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
    { path: '/yorumlar', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/hakkimizda', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/hakkimizda/basari-hikayeleri', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/is-ortagi-programi', priority: 0.7, changeFrequency: 'monthly' },
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
      
      // Calculate optimized priority based on route type
      const routeType = route.path === '' ? 'homepage' as const
        : route.path.includes('satilik') || route.path.includes('kiralik') ? 'cornerstone' as const
        : route.path.includes('karasu') || route.path.includes('kocaali') ? 'hub' as const
        : 'page' as const;
      
      const optimizedPriority = calculatePriority(routeType, false, false);
      
      sitemapEntries.push({
        url,
        lastModified: staticLastModified,
        changeFrequency: route.changeFrequency,
        priority: Math.max(route.priority, optimizedPriority), // Use higher priority
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
          
          const listingPriority = calculatePriority(
            'listing',
            false, // Could check if featured
            false // Could check if new (created in last 30 days)
          );
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: getChangeFrequency('listing'),
            priority: listing.status === 'satilik' ? Math.max(0.9, listingPriority) : Math.max(0.8, listingPriority),
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
          
          const articlePriority = calculatePriority('article', false, false);
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: getChangeFrequency('article'),
            priority: Math.max(0.7, articlePriority),
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
          
          const newsPriority = calculatePriority('news', false, false);
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: getChangeFrequency('news'),
            priority: Math.max(0.7, newsPriority),
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
          
          // Regular neighborhood page
          const url = locale === routing.defaultLocale
            ? `${baseUrl}/mahalle/${slug}`
            : `${baseUrl}/${locale}/mahalle/${slug}`;
          
          const lastModified = neighborhood.updated_at 
            ? new Date(neighborhood.updated_at) 
            : neighborhood.created_at
            ? new Date(neighborhood.created_at)
            : new Date();
          
          const neighborhoodPriority = calculatePriority('neighborhood', false, false);
          
          sitemapEntries.push({
            url,
            lastModified,
            changeFrequency: getChangeFrequency('neighborhood'),
            priority: Math.max(0.8, neighborhoodPriority),
          });
          
          // Programmatic SEO: Karasu mahalle satılık daire pages (high priority for "karasu satılık daire" keyword)
          // Filter for Karasu neighborhoods only
          const isKarasuNeighborhood = !neighborhood.name?.toLowerCase().includes('kocaali');
          if (isKarasuNeighborhood) {
            const satilikDaireUrl = locale === routing.defaultLocale
              ? `${baseUrl}/karasu/${slug}/satilik-daire`
              : `${baseUrl}/${locale}/karasu/${slug}/satilik-daire`;
            
            sitemapEntries.push({
              url: satilikDaireUrl,
              lastModified,
              changeFrequency: 'daily', // High frequency for "karasu satılık daire" keyword
              priority: 0.85, // High priority for long-tail keywords
            });
          }
        });
      });
    } else {
      // Fallback: get from listings
      const { getNeighborhoods } = await import('../lib/supabase/queries');
      const neighborhoodsList = await getNeighborhoods();

      if (neighborhoodsList && neighborhoodsList.length > 0) {
        routing.locales.forEach((locale) => {
          neighborhoodsList.forEach((neighborhood: string) => {
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
            
            // Programmatic SEO: Karasu mahalle satılık daire pages
            const isKarasuNeighborhood = !neighborhood.toLowerCase().includes('kocaali');
            if (isKarasuNeighborhood) {
              const satilikDaireUrl = locale === routing.defaultLocale
                ? `${baseUrl}/karasu/${slug}/satilik-daire`
                : `${baseUrl}/${locale}/karasu/${slug}/satilik-daire`;
              
              sitemapEntries.push({
                url: satilikDaireUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.85,
              });
            }
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
  // Convert to SitemapEntry format for sorting
  const entriesForSorting = sitemapEntries.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
    changeFrequency: entry.changeFrequency || 'weekly',
    priority: entry.priority || 0.5,
  }));
  const sortedEntries = sortSitemapEntries(entriesForSorting);

  // If sitemap exceeds 50,000 URLs, split it (Next.js handles this automatically, but we can optimize)
  // For now, return sorted entries
  return sortedEntries;
  } catch (error: any) {
    console.error('[sitemap] Error generating sitemap:', error);
    // Return minimal sitemap on error
    return getStaticSitemap(siteConfig.url || 'https://karasuemlak.net');
  }
}

/**
 * Get minimal static sitemap (fallback on error)
 */
function getStaticSitemap(baseUrl: string): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/satilik`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/kiralik`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];
}
