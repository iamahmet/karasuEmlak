import { Button } from '@karasu/ui';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes (homepage shows dynamic content)
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Home, Building2, MapPin, Calendar, User, Square, Heart, Search, TrendingUp, FileText, Sun, ArrowRight } from 'lucide-react';
import { getFeaturedListings, getRecentListings, getListingStats, getNeighborhoods } from '@/lib/supabase/queries';
import { getNeighborhoodsWithImages, getNeighborhoodImageUrl } from '@/lib/supabase/queries/neighborhoods';
import { getFeaturedArticles } from '@/lib/supabase/queries/articles';
import { generateSlug } from '@/lib/utils';
import { getFeaturedNewsArticles } from '@/lib/supabase/queries/news';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '@/lib/rss/gundem-integration';
import { CardImage, ListingImage, ExternalImage } from '@/components/images';
import { AdvancedHomeSearch } from '@/components/search/AdvancedHomeSearch';
import dynamicImport from 'next/dynamic';
import TestimonialsWithSchema from '@/components/testimonials/TestimonialsWithSchema';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateRealEstateAgentLocalSchema, generateWebSiteSchema } from '@/lib/seo/local-seo-schemas';

// Lazy load heavy components for better performance
const CompactHeroSection = dynamicImport(() => import('@/components/home/CompactHeroSection').then(mod => ({ default: mod.CompactHeroSection })), {
  loading: () => <div className="h-[500px] bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 animate-pulse" />,
});

const FeaturedListingsSection = dynamicImport(() => import('@/components/home/FeaturedListingsSection').then(mod => ({ default: mod.FeaturedListingsSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
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

const HowItWorksSection = dynamicImport(() => import('@/components/home/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const HomepageFAQ = dynamicImport(() => import('@/components/home/HomepageFAQ').then(mod => ({ default: mod.HomepageFAQ })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const InteractiveMap = dynamicImport(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => <div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse" />,
});

const RecentActivityFeed = dynamicImport(() => import('@/components/home/RecentActivityFeed').then(mod => ({ default: mod.RecentActivityFeed })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: PriceComparisonWidget (consolidated into CompactMarketTrends)

const NeighborhoodsCarousel = dynamicImport(() => import('@/components/home/NeighborhoodsCarousel').then(mod => ({ default: mod.NeighborhoodsCarousel })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const AgentTeamSection = dynamicImport(() => import('@/components/home/AgentTeamSection').then(mod => ({ default: mod.AgentTeamSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: VideoTourSection (not used)
// Removed: FeaturedNeighborhoodsDetail (not used)

// Compact & Combined Sections
const CompactStatsSection = dynamicImport(() => import('@/components/home/CompactStatsSection').then(mod => ({ default: mod.CompactStatsSection })), {
  loading: () => <div className="h-32 bg-white animate-pulse" />,
});

const EnhancedWhyChooseUsSection = dynamicImport(() => import('@/components/home/EnhancedWhyChooseUsSection').then(mod => ({ default: mod.EnhancedWhyChooseUsSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
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

const QuickAccessSection = dynamicImport(() => import('@/components/home/QuickAccessSection').then(mod => ({ default: mod.QuickAccessSection })), {
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

const ServicesSection = dynamicImport(() => import('@/components/home/ServicesSection').then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

// Removed: FirstTimeBuyerGuide, InvestmentOpportunitiesSection, InvestorsGuideSection, SummerPropertyMarketSection
// Consolidated into a single "Guides Hub" section on homepage

const TrustIndicatorsBar = dynamicImport(() => import('@/components/home/TrustIndicatorsBar').then(mod => ({ default: mod.TrustIndicatorsBar })), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse" />,
});

// Removed: LocalAreaGuideSection (consolidated into NeighborhoodsSection)

import { withTimeout } from '@/lib/utils/timeout';
import { SectionErrorBoundary } from '@/components/errors/SectionErrorBoundary';
import { ExternalLink } from 'lucide-react';
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
      languages: {
        'tr': base,
        'en': `${base}/en`,
        'et': `${base}/et`,
        'ru': `${base}/ru`,
        'ar': `${base}/ar`,
      },
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
    let featuredArticles: Awaited<ReturnType<typeof getFeaturedArticles>> = [];
    let featuredNews: Awaited<ReturnType<typeof getFeaturedNewsArticles>> = [];
    let gundemArticles: Awaited<ReturnType<typeof getLatestGundemArticles>> = [];
    let neighborhoodStats: any[] = [];
    
    // Use timeout to prevent blocking (3 seconds max)
    // If database is down, page still renders with empty data
    try {
      // Wrap each data fetch in individual try-catch to prevent one failure from breaking the page
      let listingsResult: any[] = [];
      try {
        const fetchedListings = await withTimeout(getFeaturedListings(10), 3000, [] as any[]);
        listingsResult = Array.isArray(fetchedListings) ? fetchedListings : [];
      } catch (listingsError: any) {
        console.error('[HomePage] Error fetching featured listings:', listingsError.message);
        listingsResult = [];
      }
      
      let recentListingsResult: any[] = [];
      try {
        const fetchedRecent = await withTimeout(getRecentListings(10), 3000, [] as any[]);
        recentListingsResult = Array.isArray(fetchedRecent) ? fetchedRecent : [];
      } catch (recentError: any) {
        console.error('[HomePage] Error fetching recent listings:', recentError.message);
        recentListingsResult = [];
      }

      // Separate satilik and kiralik listings
      const safeListings = listingsResult ?? [];
      satilikListings = safeListings.filter(l => l.status === 'satilik');
      kiralikListings = safeListings.filter(l => l.status === 'kiralik');
      const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
      const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
      const neighborhoodsImagesResult = await withTimeout(getNeighborhoodsWithImages(8), 3000, []);
      const articlesResult = await withTimeout(getFeaturedArticles(3), 3000, []);
      const newsResult = await withTimeout(getFeaturedNewsArticles(3), 3000, []);
      
      // Get neighborhood stats for enhanced display
      try {
        const { getNeighborhoodStats } = await import('@/lib/supabase/queries/neighborhood-stats');
        const neighborhoodStatsResult = await withTimeout(getNeighborhoodStats(), 3000, []);
        neighborhoodStats = neighborhoodStatsResult || [];
      } catch (error) {
        console.error('Error loading neighborhood stats:', error);
        neighborhoodStats = [];
      }

      // Fetch Karasu Gündem articles separately (with timeout, graceful degradation)
      let gundemResult: any[] = [];
      try {
        const fetchedGundem = await withTimeout(
          getLatestGundemArticles(3),
          3000,
          [] as any[]
        );
        gundemResult = Array.isArray(fetchedGundem) ? fetchedGundem : [];
      } catch (gundemError: any) {
        console.error('[HomePage] Error fetching Gündem articles:', gundemError?.message);
        gundemResult = [];
      }

      // Assign results (null becomes empty array/object)
      featuredListings = listingsResult || [];
      recentListings = recentListingsResult || [];
      stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
      neighborhoods = neighborhoodsResult || [];
      neighborhoodsWithImages = neighborhoodsImagesResult || [];
      featuredArticles = articlesResult || [];
      featuredNews = newsResult || [];
      gundemArticles = gundemResult || [];
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
          return enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net');
        } catch (error: any) {
          console.error('[HomePage] Error enhancing article SEO:', error?.message);
          return null;
        }
      })
      .filter((article): article is NonNullable<typeof article> => article !== null && article.isRealEstateRelated)
      .slice(0, 3);

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

      {/* Compact Hero Section with Recent Listings */}
      <CompactHeroSection basePath={basePath} recentListings={recentListings} />

      {/* Son Eklenen İlanlar - Hero Section'ın Hemen Altında */}
      <SectionErrorBoundary sectionName="Son Eklenen İlanlar">
        <RecentListingsSection 
          recentListings={recentListings}
          basePath={basePath} 
        />
      </SectionErrorBoundary>

      {/* Compact Stats Section */}
      <CompactStatsSection />

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
        <div className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
                  Emlak Rehberleri ve Yatırım Fırsatları
                </h2>
                <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
                  İlk kez emlak alanlar, yatırımcılar ve yazlık emlak arayanlar için kapsamlı rehberler ve fırsatlar
                </p>
              </div>

              {/* Guide Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* First Time Buyer Guide */}
                <Link href={`${basePath}/rehberler/ev-nasil-alinir`} className="group">
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      İlk Kez Emlak Alanlar
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Bütçe belirleme, konum seçimi, kredi imkanları ve yasal süreçler rehberi
                    </p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1">
                      Rehberi İncele
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                {/* Investment Opportunities */}
                <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`} className="group">
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      Yatırım Fırsatları
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Denize sıfır, merkez konumlu ve arsa yatırım fırsatları ile ROI analizi
                    </p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1">
                      Fırsatları Keşfet
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                {/* Investors Guide */}
                <Link href={`${basePath}/rehberler/yatirim-yapma`} className="group">
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      Yatırımcılar İçin
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Kısa/uzun vadeli stratejiler, portföy çeşitlendirme ve ROI hesaplama
                    </p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1">
                      Stratejileri İncele
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                {/* Summer Property Market */}
                <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`} className="group">
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                      <Sun className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      Yazlık Emlak Piyasası
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Yazlık evler, denize sıfır villalar ve yüksek kira geliri potansiyeli
                    </p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1">
                      Yazlık İlanları Gör
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
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
          news={[...featuredNews, ...enhancedGundemArticles.map(g => ({
            ...g,
            id: g.slug || `gundem-${Date.now()}`,
            category: Array.isArray(g.category) ? g.category[0] : g.category,
          }))]} 
          basePath={basePath} 
        />
      </SectionErrorBoundary>


      {/* News Section - Apple Quality */}
      <SectionErrorBoundary sectionName="Haberler">
        {(featuredNews.length > 0 || enhancedGundemArticles.length > 0) && (
          <section className="py-12 lg:py-16 bg-white">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold mb-2 text-gray-900 leading-tight tracking-tight">
                    Güncel Haberler
                  </h2>
                  <p className="text-[17px] text-gray-600 tracking-[-0.022em]">
                    Karasu ve emlak sektöründen güncel haberler, piyasa analizleri ve gelişmeler
                    {enhancedGundemArticles.length > 0 && (
                      <span className="ml-2 text-[#006AFF]">
                        {' '}·{' '}
                        <a 
                          href="https://karasugundem.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline font-medium inline-flex items-center gap-1"
                        >
                          Karasu Gündem
                          <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
                        </a>
                      </span>
                    )}
                  </p>
                </div>
                <Link href="/haberler">
                  <Button variant="outline" size="lg" className="hidden md:flex text-[15px] font-semibold tracking-[-0.011em] rounded-lg">
                    Tümünü Gör
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Karasu Gündem Articles */}
            {enhancedGundemArticles.map((article) => {
              return (
                <a 
                  key={article.guid || article.slug} 
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#006AFF]/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <article>
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {article.image ? (
                        <ExternalImage
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#006AFF]/10 to-[#00A862]/10 flex items-center justify-center">
                          <span className="text-gray-400 text-sm font-medium">Görsel yok</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-[#006AFF]/90 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-[-0.01em] shadow-lg backdrop-blur-sm">
                        Karasu Gündem
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 leading-[1.47] tracking-[-0.022em] group-hover:text-[#006AFF] transition-colors">{article.title}</h3>
                      <p className="text-[15px] text-gray-600 mb-4 line-clamp-3 leading-[1.47] tracking-[-0.011em]">
                        {article.description || 'Devamını okumak için tıklayın...'}
                      </p>
                      <div className="flex items-center justify-between text-[13px] text-gray-500 pt-3 border-t border-gray-100 font-medium tracking-[-0.01em]">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 stroke-[1.5]" />
                          <span>{article.author || 'Karasu Gündem'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                          <span>
                            {new Date(article.pubDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </a>
              );
            })}
            
            {/* Our News Articles */}
            {featuredNews.map((news) => {
              return (
                <Link key={news.id} href={`/haberler/${news.slug}`}>
                  <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {news.cover_image ? (
                        <CardImage
                          publicId={news.cover_image}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm font-medium">Görsel yok</span>
                        </div>
                      )}
                      {news.featured && (
                        <div className="absolute top-3 left-3 bg-[#FF5A5F] text-white px-2.5 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] shadow-lg backdrop-blur-sm">
                          Öne Çıkan
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 leading-[1.47] tracking-[-0.022em] group-hover:text-[#006AFF] transition-colors">{news.title}</h3>
                      <p className="text-[15px] text-gray-600 mb-4 line-clamp-3 leading-[1.47] tracking-[-0.011em]">
                        {news.original_summary || news.seo_description || 'Devamını okumak için tıklayın...'}
                      </p>
                      <div className="flex items-center justify-between text-[13px] text-gray-500 pt-3 border-t border-gray-100 font-medium tracking-[-0.01em]">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 stroke-[1.5]" />
                          <span>Karasu Emlak</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                          <span>
                            {news.published_at 
                              ? new Date(news.published_at).toLocaleDateString('tr-TR')
                              : new Date(news.created_at).toLocaleDateString('tr-TR')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
              </div>
              <div className="mt-8 text-center md:hidden">
                <Link href="/haberler">
                  <Button variant="outline" size="lg" className="text-[15px] font-semibold tracking-[-0.011em] rounded-lg">
                    Tümünü Gör
                  </Button>
          </Link>
              </div>
            </div>
          </section>
        )}
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

      {/* Market Trends - Consolidated */}
      <SectionErrorBoundary sectionName="Piyasa Trendleri">
        <CompactMarketTrends />
      </SectionErrorBoundary>

      {/* Testimonials & Success Stories - Combined */}
      <SectionErrorBoundary sectionName="Müşteri Yorumları ve Başarı Hikayeleri">
        <section className="py-16 lg:py-20 bg-white">
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

