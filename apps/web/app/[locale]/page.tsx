import { Button } from '@karasu/ui';
import type { Metadata } from 'next';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 1800; // Revalidate every 30 minutes (homepage shows dynamic content)
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Home, Building2, MapPin, Calendar, User, Square, Heart, Search, TrendingUp, FileText, Sun, ArrowRight, ExternalLink } from 'lucide-react';
import { getFeaturedListings, getRecentListings, getListingStats, getNeighborhoods } from '@/lib/supabase/queries';
import { getNeighborhoodsWithImages, getNeighborhoodImageUrl } from '@/lib/supabase/queries/neighborhoods';
import { getLatestArticles } from '@/lib/supabase/queries/articles';
import { generateSlug } from '@/lib/utils';
import { getFeaturedNewsArticles } from '@/lib/supabase/queries/news';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '@/lib/rss/gundem-integration';
import { CardImage, ExternalImage } from '@/components/images';
import dynamicImport from 'next/dynamic';
import TestimonialsWithSchema from '@/components/testimonials/TestimonialsWithSchema';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateRealEstateAgentLocalSchema, generateWebSiteSchema } from '@/lib/seo/local-seo-schemas';
import { TrustIndicatorsBar } from '@/components/home/TrustIndicatorsBar';
import { QuickAccessSection } from '@/components/home/QuickAccessSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { EnhancedWhyChooseUsSection } from '@/components/home/EnhancedWhyChooseUsSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { Ramadan2026PromoBlock } from '@/components/seasonal/Ramadan2026PromoBlock';
import { decodeHtmlEntities } from '@/lib/entities';
import { cn } from "@karasu/lib";

// Lazy load heavy components for better performance
const Hero = dynamicImport(() => import('@/components/home/Hero').then(mod => ({ default: mod.Hero })), {
  loading: () => <div className="h-[600px] bg-white animate-pulse" />,
});

const NeighborhoodsSection = dynamicImport(() => import('@/components/home/NeighborhoodsSection').then(mod => ({ default: mod.NeighborhoodsSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const BlogNewsSection = dynamicImport(() => import('@/components/home/BlogNewsSection').then(mod => ({ default: mod.BlogNewsSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const CTASection = dynamicImport(() => import('@/components/home/CTASection').then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="h-96 bg-gradient-to-br from-[#006AFF] to-[#0052CC] animate-pulse" />,
});

// Removed: WhyChooseUsSection (replaced by EnhancedWhyChooseUsSection)
// Removed: TrustBadgesSection (replaced by TrustIndicatorsBar)

const HomepageFAQ = dynamicImport(() => import('@/components/home/HomepageFAQ').then(mod => ({ default: mod.HomepageFAQ })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const InteractiveMap = dynamicImport(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => <div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse" />,
});

// Removed: PriceComparisonWidget (consolidated into CompactMarketTrends)

const AgentTeamSection = dynamicImport(() => import('@/components/home/AgentTeamSection').then(mod => ({ default: mod.AgentTeamSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: VideoTourSection (not used)
// Removed: FeaturedNeighborhoodsDetail (not used)

// Compact & Combined Sections
const CompactStatsSection = dynamicImport(() => import('@/components/home/CompactStatsSection').then(mod => ({ default: mod.CompactStatsSection })), {
  loading: () => <div className="h-32 bg-white animate-pulse" />,
});

const QuickToolsSection = dynamicImport(() => import('@/components/home/QuickToolsSection').then(mod => ({ default: mod.QuickToolsSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const CompactMarketTrends = dynamicImport(() => import('@/components/home/CompactMarketTrends').then(mod => ({ default: mod.CompactMarketTrends })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: MarketTrendsDashboard (replaced by CompactMarketTrends)

const SuccessStoriesSection = dynamicImport(() => import('@/components/home/SuccessStoriesSection').then(mod => ({ default: mod.SuccessStoriesSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const NewsletterSection = dynamicImport(() => import('@/components/home/NewsletterSection').then(mod => ({ default: mod.NewsletterSection })), {
  loading: () => <div className="h-96 bg-gradient-to-br from-[#006AFF] to-[#0052CC] animate-pulse" />,
});

const PropertyTypeShowcase = dynamicImport(() => import('@/components/home/PropertyTypeShowcase').then(mod => ({ default: mod.PropertyTypeShowcase })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const SEOContentSection = dynamicImport(() => import('@/components/home/SEOContentSection').then(mod => ({ default: mod.SEOContentSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const SeparateFeaturedListings = dynamicImport(() => import('@/components/home/SeparateFeaturedListings').then(mod => ({ default: mod.SeparateFeaturedListings })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const RecentListingsSection = dynamicImport(() => import('@/components/home/RecentListingsSection').then(mod => ({ default: mod.RecentListingsSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const HomepageInternalLinks = dynamicImport(() => import('@/components/seo/HomepageInternalLinks').then(mod => ({ default: mod.HomepageInternalLinks })), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
});

// Removed: NeighborhoodsGuideSection (consolidated into NeighborhoodsSection)
const CurrentPricesSection = dynamicImport(() => import('@/components/home/CurrentPricesSection').then(mod => ({ default: mod.CurrentPricesSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: FirstTimeBuyerGuide, InvestmentOpportunitiesSection, InvestorsGuideSection, SummerPropertyMarketSection
// Consolidated into a single "Guides Hub" section on homepage

// Removed: LocalAreaGuideSection (consolidated into NeighborhoodsSection)

import { withTimeout } from '@/lib/utils/timeout';
import { SectionErrorBoundary } from '@/components/errors/SectionErrorBoundary';
// Removed: StatsSection (replaced by CompactStatsSection)

/**
 * Homepage - Karasu Emlak
 * 
 * SEO Keywords:
 * - Primary: karasu emlak, karasu satılık daire, karasu kiralık ev
 * - Secondary: karasu villa, karasu yazlık, karasu denize sıfır
 * - Local: karasu merkez, karasu sahil, kocaali
 * 
 * Schema.org: LocalBusiness, RealEstateAgent, FAQPage, WebSite
 */

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  try {
    const { locale } = await params;
    const base = siteConfig?.url ?? 'https://karasuemlak.net';
    const name = siteConfig?.name ?? 'Karasu Emlak';
    const canonicalPath = locale === routing.defaultLocale ? '' : `/${locale}`;

    return {
      title: {
        default: 'Karasu Emlak | Satılık ve Kiralık Daire, Villa, Yazlık | Karasu Gayrimenkul',
        template: `%s | ${name}`,
      },
      description: 'Karasu\'da satılık ve kiralık emlak ilanları. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları. 15 yıllık deneyimli emlak danışmanları ile hayalinizdeki evi bulun.',
      keywords: [
        'karasu emlak',
        'karasu satılık daire',
        'karasu kiralık ev',
        'karasu villa',
        'karasu yazlık',
        'karasu denize sıfır',
        'karasu merkez',
        'karasu sahil',
        'kocaali emlak',
        'sakarya emlak',
      ],
      alternates: {
        canonical: `${base}${canonicalPath || '/'}`,
        languages: pruneHreflangLanguages({
          'tr': base,
          'en': `${base}/en`,
          'et': `${base}/et`,
          'ru': `${base}/ru`,
          'ar': `${base}/ar`,
        }),
      },
      openGraph: {
        type: 'website',
        locale: locale === 'tr' ? 'tr_TR' : locale,
        url: `${base}${canonicalPath}`,
        siteName: name,
        title: 'Karasu Emlak | Satılık ve Kiralık Daire, Villa, Yazlık',
        description: 'Karasu\'da satılık ve kiralık emlak ilanları. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları.',
        images: [
          {
            url: `${base}/og-image.jpg`,
            width: 1200,
            height: 630,
            alt: 'Karasu Emlak',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Karasu Emlak | Satılık ve Kiralık Daire, Villa, Yazlık',
        description: 'Karasu\'da satılık ve kiralık emlak ilanları. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları.',
        images: [`${base}/og-image.jpg`],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[generateMetadata] home:', (e as Error)?.message);
    }
    return {
      title: siteConfig?.name ?? 'Karasu Emlak',
      description: 'Karasu satılık ve kiralık emlak.',
    };
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Wrap entire function in error boundary to prevent 500 errors
  try {
    const { locale } = await params;
    // Since localePrefix is "as-needed", we don't need /tr prefix for default locale
    const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

    // Fetch real data from Supabase with timeout (3s max)
    // Homepage MUST render even if database is down
    let featuredListings: Awaited<ReturnType<typeof getFeaturedListings>> = [];
    let recentListings: Awaited<ReturnType<typeof getRecentListings>> = [];
    let satilikListings: Awaited<ReturnType<typeof getFeaturedListings>> = [];
    let kiralikListings: Awaited<ReturnType<typeof getFeaturedListings>> = [];
    let stats: Awaited<ReturnType<typeof getListingStats>> = { total: 0, satilik: 0, kiralik: 0, byType: {} };
    let neighborhoods: string[] = [];
    let neighborhoodsWithImages: Awaited<ReturnType<typeof getNeighborhoodsWithImages>> = [];
    let featuredArticles: Awaited<ReturnType<typeof getLatestArticles>> = [];
    let featuredNews: Awaited<ReturnType<typeof getFeaturedNewsArticles>> = [];
    let gundemArticles: Awaited<ReturnType<typeof getLatestGundemArticles>> = [];
    let neighborhoodStats: any[] = [];

    // Use timeout to prevent blocking (3 seconds max)
    // If database is down, page still renders with empty data
    try {
      const defaultStats = { total: 0, satilik: 0, kiralik: 0, byType: {} as Record<string, number> };
      const defaultArr: any[] = [];

      const results = await Promise.allSettled([
        withTimeout(getFeaturedListings(10), 3000, defaultArr),
        withTimeout(getRecentListings(10), 3000, defaultArr),
        withTimeout(getListingStats(), 3000, defaultStats),
        withTimeout(getNeighborhoods(), 3000, [] as string[]),
        withTimeout(getNeighborhoodsWithImages(8), 3000, defaultArr),
        withTimeout(getLatestArticles(3), 3000, defaultArr),
        withTimeout(getFeaturedNewsArticles(3), 3000, defaultArr),
        (async () => {
          try {
            const { getNeighborhoodStats } = await import('@/lib/supabase/queries/neighborhood-stats');
            return await withTimeout(getNeighborhoodStats(), 3000, defaultArr);
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('[HomePage] Error loading neighborhood stats:', (error as any)?.message || error);
            }
            return defaultArr;
          }
        })(),
        (async () => {
          try {
            return await withTimeout(getLatestGundemArticles(3), 3000, defaultArr);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[HomePage] Gundem fetch failed, using empty:', (e as any)?.message);
            }
            return defaultArr;
          }
        })(),
      ]);

      const unwrap = <T,>(r: PromiseSettledResult<T>, fallback: T, label: string): T => {
        if (r.status === 'fulfilled') return (r.value ?? fallback) as T;
        console.error(`[HomePage] Error fetching ${label}:`, (r.reason as any)?.message || r.reason);
        return fallback;
      };

      const listingsResult = unwrap(results[0] as PromiseSettledResult<any>, defaultArr, 'featured listings');
      const recentListingsResult = unwrap(results[1] as PromiseSettledResult<any>, defaultArr, 'recent listings');
      const statsResult = unwrap(results[2] as PromiseSettledResult<any>, defaultStats, 'listing stats');
      const neighborhoodsResult = unwrap(results[3] as PromiseSettledResult<any>, [] as string[], 'neighborhoods');
      const neighborhoodsImagesResult = unwrap(results[4] as PromiseSettledResult<any>, defaultArr, 'neighborhood images');
      const articlesResult = unwrap(results[5] as PromiseSettledResult<any>, defaultArr, 'latest articles');
      const newsResult = unwrap(results[6] as PromiseSettledResult<any>, defaultArr, 'featured news');
      const neighborhoodStatsResult = unwrap(results[7] as PromiseSettledResult<any>, defaultArr, 'neighborhood stats');
      const gundemResult = unwrap(results[8] as PromiseSettledResult<any>, defaultArr, 'gundem RSS');

      // Sanitize gundem data for RSC serialization (prevents JSON.parse errors from weird payloads)
      let safeGundem = defaultArr;
      try {
        const arr = Array.isArray(gundemResult) ? gundemResult : defaultArr;
        safeGundem = JSON.parse(JSON.stringify(arr));
      } catch {
        safeGundem = defaultArr;
      }

      const safeListings = Array.isArray(listingsResult) ? listingsResult : defaultArr;
      satilikListings = safeListings.filter((l) => l?.status === 'satilik');
      kiralikListings = safeListings.filter((l) => l?.status === 'kiralik');

      featuredListings = safeListings;
      recentListings = Array.isArray(recentListingsResult) ? recentListingsResult : defaultArr;
      stats = statsResult || defaultStats;
      neighborhoods = Array.isArray(neighborhoodsResult) ? neighborhoodsResult : [];
      neighborhoodsWithImages = Array.isArray(neighborhoodsImagesResult) ? neighborhoodsImagesResult : defaultArr;
      featuredArticles = Array.isArray(articlesResult) ? articlesResult : defaultArr;
      featuredNews = Array.isArray(newsResult) ? newsResult : defaultArr;
      neighborhoodStats = Array.isArray(neighborhoodStatsResult) ? neighborhoodStatsResult : defaultArr;
      gundemArticles = safeGundem;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Continue with empty data - page will still render
    }

    // Enhance Gündem articles with SEO metadata and filter real estate related
    const enhancedGundemArticles = (gundemArticles || [])
      .map(article => {
        try {
          if (!article || typeof article !== 'object') {
            return null;
          }
          const enhanced = enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net');

          // Thorough decoding for all text fields
          return {
            ...enhanced,
            title: decodeHtmlEntities(enhanced.title),
            description: decodeHtmlEntities(enhanced.description || ''),
            content: decodeHtmlEntities(enhanced.content || ''),
            pubDate: enhanced.pubDate,
          };
        } catch (error: any) {
          console.error('[HomePage] Error enhancing article SEO:', error?.message);
          return null;
        }
      })
      .filter((article): article is NonNullable<typeof article> => article !== null && article.isRealEstateRelated)
      .slice(0, 3);

    // Also decode our own news if they have entities
    const decodedFeaturedNews = (featuredNews || []).map(news => ({
      ...news,
      title: decodeHtmlEntities(news.title),
      original_summary: decodeHtmlEntities(news.original_summary || ''),
      seo_description: decodeHtmlEntities(news.seo_description || ''),
      emlak_analysis: decodeHtmlEntities(news.emlak_analysis || ''),
    }));

    // Generate comprehensive local SEO schemas
    let realEstateAgentSchema;
    let websiteSchema;
    try {
      realEstateAgentSchema = generateRealEstateAgentLocalSchema({
        includeRating: true,
        includeServices: true,
        includeAreaServed: true,
      });
      websiteSchema = generateWebSiteSchema('/arama');
    } catch (error) {
      console.error('Error generating SEO schemas:', error);
      realEstateAgentSchema = null;
      websiteSchema = null;
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Enhanced Schema.org Markup for Homepage */}
        <StructuredData data={realEstateAgentSchema} />
        <StructuredData data={websiteSchema} />

        {/* Premium Hero Section */}
        <Hero basePath={basePath} recentListings={recentListings} neighborhoods={neighborhoods} />

        {/* Son Eklenen İlanlar - Hero Section'ın Hemen Altında */}
        <SectionErrorBoundary sectionName="Son Eklenen İlanlar">
          <RecentListingsSection
            recentListings={recentListings}
            basePath={basePath}
          />
        </SectionErrorBoundary>

        {/* Compact Stats Section */}
        <CompactStatsSection total={stats?.total} />

        {/* Trust Indicators Bar */}
        <SectionErrorBoundary sectionName="Güven Göstergeleri">
          <TrustIndicatorsBar />
        </SectionErrorBoundary>


        {/* Separate Featured Listings - Satılık & Kiralık */}
        <SectionErrorBoundary sectionName="Öne Çıkan Satılık ve Kiralık İlanlar">
          <SeparateFeaturedListings
            satilikListings={satilikListings}
            kiralikListings={kiralikListings}
            basePath={basePath}
          />
        </SectionErrorBoundary>


        {/* Quick Access Section - Hızlı Erişim */}
        <SectionErrorBoundary sectionName="Hızlı Erişim">
          <QuickAccessSection basePath={basePath} />
        </SectionErrorBoundary>

        {/* Seasonal: Ramazan 2026 cluster booster (high intent queries) */}
        <SectionErrorBoundary sectionName="Ramazan 2026">
          <section className="py-6 lg:py-8 bg-white">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-7xl mx-auto">
                <Ramadan2026PromoBlock basePath={basePath} />
              </div>
            </div>
          </section>
        </SectionErrorBoundary>

        {/* Current Prices Section */}
        <SectionErrorBoundary sectionName="Güncel Fiyatlar">
          <CurrentPricesSection basePath={basePath} />
        </SectionErrorBoundary>

        {/* Property Type Showcase */}
        <SectionErrorBoundary sectionName="Gayrimenkul Türleri">
          <PropertyTypeShowcase basePath={basePath} />
        </SectionErrorBoundary>

        {/* Services Section */}
        <SectionErrorBoundary sectionName="Emlak Ofisi ve Hizmetler">
          <ServicesSection basePath={basePath} />
        </SectionErrorBoundary>

        {/* Enhanced Why Choose Us Section */}
        <EnhancedWhyChooseUsSection />

        {/* Guides Hub - Consolidated */}
        <SectionErrorBoundary sectionName="Emlak Rehberleri ve Yatırım Fırsatları">
          <div className="py-12 lg:py-16 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100/50 rounded-full">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">BİLGİ MERKEZİ</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight max-w-2xl">
                      Emlak <span className="text-orange-600">Rehberleri</span> & Fırsatlar
                    </h2>
                  </div>
                  <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
                    Karasu'da doğru yatırım yapmak ve bilinçli kararlar almak için uzman ekibimizin hazırladığı kapsamlı rehberleri keşfedin.
                  </p>
                </div>

                {/* Guide Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      href: `${basePath}/rehberler/ev-nasil-alinir`,
                      icon: Home,
                      title: "İlk Kez Emlak Alanlar",
                      description: "Bütçe belirleme, konum seçimi ve yasal süreçler için tam rehber.",
                      color: "blue",
                    },
                    {
                      href: `${basePath}/karasu-yatirimlik-satilik-ev`,
                      icon: TrendingUp,
                      title: "Yatırım Fırsatları",
                      description: "Yüksek ROI potansiyelli bölgeler ve güncel pazar analizi.",
                      color: "emerald",
                    },
                    {
                      href: `${basePath}/rehberler/yatirim-yapma`,
                      icon: FileText,
                      title: "Yatırımcılar İçin",
                      description: "Kısa ve uzun vadeli yatırım stratejileri ve portföy yönetimi.",
                      color: "orange",
                    },
                    {
                      href: `${basePath}/karasu-denize-yakin-satilik-ev`,
                      icon: Sun,
                      title: "Yazlık Emlak Piyasası",
                      description: "Denize sıfır villalar ve yüksek kira getirili yazlık evler.",
                      color: "yellow",
                    }
                  ].map((guide, idx) => {
                    const Icon = guide.icon;
                    const colorClasses: Record<string, string> = {
                      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                      emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
                      orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
                      yellow: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white",
                    };

                    return (
                      <Link key={idx} href={guide.href} className="group">
                        <div className="h-full bg-white rounded-[40px] border border-gray-100 p-6 hover:shadow-[0_40px_100px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                          <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 mb-6",
                            colorClasses[guide.color]
                          )}>
                            <Icon className="h-8 w-8 stroke-[1.5]" />
                          </div>

                          <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight leading-tight group-hover:text-gray-600 transition-colors">
                            {guide.title}
                          </h3>

                          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6">
                            {guide.description}
                          </p>

                          <div className="mt-auto flex items-center gap-2 group/btn">
                            <span className="text-sm font-black text-gray-900 tracking-widest uppercase">REHBERİ GÖR</span>
                            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SectionErrorBoundary>

        {/* Neighborhoods Section - Consolidated (includes guide info) */}
        <SectionErrorBoundary sectionName="Popüler Bölgeler ve Rehberler">
          <NeighborhoodsSection
            neighborhoods={neighborhoodsWithImages.map(n => {
              const stats = neighborhoodStats.find(s => s.name === n.name);
              const highlights: Record<string, string> = {
                'Sahil': 'Deniz Manzarası',
                'Merkez': 'Şehir Merkezi',
                'Yalı': 'Popüler',
                'Aziziye': 'Popüler',
                'Cumhuriyet': 'Popüler',
                'Atatürk': 'Popüler',
              };
              return {
                id: n.id || n.name,
                name: n.name,
                slug: n.slug || generateSlug(n.name),
                description: n.description,
                image: getNeighborhoodImageUrl(n),
                stats: stats ? {
                  totalListings: stats.totalListings,
                  satilikCount: stats.satilikCount,
                  kiralikCount: stats.kiralikCount,
                  avgPrice: stats.avgPrice,
                } : undefined,
                highlight: highlights[n.name] || undefined,
              };
            })}
            basePath={basePath}
          />
        </SectionErrorBoundary>


        {/* Interactive Map Section */}
        <SectionErrorBoundary sectionName="İnteraktif Harita">
          <InteractiveMap
            listings={featuredListings.map(l => ({
              id: l.id,
              title: l.title,
              slug: l.slug,
              location_neighborhood: l.location_neighborhood,
              location_district: l.location_district,
              coordinates_lat: l.coordinates_lat?.toString() || '',
              coordinates_lng: l.coordinates_lng?.toString() || '',
              price_amount: l.price_amount?.toString() || '',
              status: l.status,
              property_type: l.property_type,
              images: l.images?.map(img => ({
                public_id: img.public_id || img.url,
                url: img.url,
                alt: img.alt,
              })),
              features: l.features,
            }))}
            basePath={basePath}
          />
        </SectionErrorBoundary>

        {/* Blog & News Combined Section - Premium Design */}
        <SectionErrorBoundary sectionName="Blog & Haberler">
          <BlogNewsSection
            articles={featuredArticles}
            news={[...decodedFeaturedNews, ...enhancedGundemArticles.map((g) => ({
              ...g,
              // Keep ids deterministic to avoid cache/hydration churn.
              id: (g as any)?.guid || (g as any)?.slug || (g as any)?.link || `${(g as any)?.pubDate || ''}-${(g as any)?.title || ''}`,
              category: Array.isArray((g as any)?.category) ? (g as any).category[0] : (g as any)?.category,
            }))]}
            basePath={basePath}
          />
        </SectionErrorBoundary>



        {/* How It Works */}
        <HowItWorksSection />

        {/* Agent Team Section */}
        <AgentTeamSection />

        {/* CTA Sections - Conversion Optimized */}
        <CTASection basePath={basePath} />

        {/* Quick Tools Section - Combined Calculators */}
        <SectionErrorBoundary sectionName="Emlak Hesaplayıcılar">
          <QuickToolsSection />
        </SectionErrorBoundary>


        {/* Testimonials & Success Stories - Combined */}
        <SectionErrorBoundary sectionName="Müşteri Yorumları ve Başarı Hikayeleri">
          <section className="py-10 lg:py-12 bg-white">
            <div className="container mx-auto px-4 lg:px-6">
              <TestimonialsWithSchema basePath={basePath} />
            </div>
          </section>
          <SuccessStoriesSection />
        </SectionErrorBoundary>

        {/* FAQ Section - SEO Optimized */}
        <HomepageFAQ />

        {/* Newsletter Section */}
        <SectionErrorBoundary sectionName="E-Bülten">
          <NewsletterSection />
        </SectionErrorBoundary>

        {/* SEO Content Section - Rich Text Content */}
        <SectionErrorBoundary sectionName="SEO İçerik">
          <SEOContentSection basePath={basePath} />
        </SectionErrorBoundary>

        {/* SEO-Optimized Internal Links - Topic Clusters */}
        <SectionErrorBoundary sectionName="Internal Links">
          <HomepageInternalLinks basePath={basePath} />
        </SectionErrorBoundary>
      </div>
    );
  } catch (error) {
    console.error('Critical error in HomePage:', error);
    // Return a minimal fallback page
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Karasu Emlak</h1>
          <p className="text-gray-600 mb-6">Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }
}
