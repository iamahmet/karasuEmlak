import type { Metadata } from 'next';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getListings, getNeighborhoods, getListingStats, type Listing } from '@/lib/supabase/queries';
import { serializeListings } from '@/lib/serialize/toSerializable';
import { ListingsClient } from './ListingsClient';
import { withTimeout } from '@/lib/utils/timeout';
import { EnhancedKiralikHero } from '@/components/listings/EnhancedKiralikHero';
import { PageIntro, ContentSection, FAQBlock, RelatedContent } from '@/components/content';
import { getQAEntries, type QAEntry } from '@/lib/supabase/queries/qa';
import { getFeaturedArticles, type Article } from '@/lib/supabase/queries/articles';
import { generateSlug } from '@/lib/utils';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { ContactInfoBar } from '@/components/layout/ContactInfoBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Ramadan2026PromoBlock } from '@/components/seasonal/Ramadan2026PromoBlock';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Home, FileText, MapPin, ArrowRight, Search, DollarSign, Building2, Phone, Mail, MessageCircle, TrendingUp, Shield, CheckCircle2, Clock, Users, Award, BarChart3, Info, Lightbulb, Target, Zap, Eye, Calculator, Calendar, Key } from 'lucide-react';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import { ListingGridSkeleton } from '@/components/listings/ListingCardSkeleton';

export async function generateMetadata({
  params,

  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    propertyType?: string;
    neighborhood?: string;
    balcony?: string;
    parking?: string;
    elevator?: string;
    seaView?: string;
    furnished?: string;
    buildingAge?: string;
    floor?: string;
    sort?: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // No locale prefix in URLs for single-language site
  const sp = (await searchParams) ?? {};
  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const hasFilters = Object.entries(sp).some(([key, value]) => {
    if (key === 'page') return false;
    if (value == null || value === '') return false;
    if (key === 'sort') return value !== 'created_at-desc';
    return true;
  });

  const canonicalBasePath = '/kiralik';
  const canonicalPath =
    !hasFilters && pageNum > 1 ? `${canonicalBasePath}?page=${pageNum}` : canonicalBasePath;
  const titleSuffix = !hasFilters && pageNum > 1 ? ` (Sayfa ${pageNum})` : '';
  const shouldIndex = !hasFilters;

  return {
    title: `Kiralık İlanlar | Karasu Emlak | Daire, Villa, Yazlık${titleSuffix}`,
    description: 'Karasu ve çevresinde kiralık emlak ilanları. Denize sıfır konumlarda kiralık daire, villa ve yazlık evler. Hemen taşınmaya hazır, modern ve konforlu...',
    keywords: [
      'karasu kiralık',
      'karasu kiralık daire',
      'karasu kiralık villa',
      'karasu kiralık yazlık',
      'karasu denize sıfır kiralık',
      'karasu merkez kiralık',
      'sakarya kiralık emlak',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': !hasFilters && pageNum > 1 ? `/kiralik?page=${pageNum}` : '/kiralik',
        'en': '/en/kiralik',
        'et': '/et/kiralik',
        'ru': '/ru/kiralik',
        'ar': '/ar/kiralik',
      }),
    },
    openGraph: {
      title: 'Kiralık İlanlar | Karasu Emlak',
      description: 'Karasu ve çevresinde kiralık emlak ilanları. Denize sıfır konumlarda kiralık daire, villa ve yazlık evler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Kiralık İlanlar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kiralık İlanlar | Karasu Emlak',
      description: 'Karasu ve çevresinde kiralık emlak ilanları. Denize sıfır konumlarda kiralık daire, villa ve yazlık evler.',
      images: [`${siteConfig.url}/og-image.jpg`],
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ForRentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    propertyType?: string;
    neighborhood?: string;
    balcony?: string;
    parking?: string;
    elevator?: string;
    seaView?: string;
    furnished?: string;
    buildingAge?: string;
    floor?: string;
    sort?: string;
  }>;
}) {
  try {
    // Wrap entire function body in try-catch to catch any JSON parsing errors
    const { locale: rawLocale } = await params;
    // Ensure locale is valid - fallback to default if invalid
    // This handles cases where next-intl rewrite doesn't properly set the locale param
    const locale = routing.locales.includes(rawLocale as any)
      ? rawLocale
      : routing.defaultLocale;

    if (!routing.locales.includes(rawLocale as any)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ForRentPage] Invalid locale "${rawLocale}", using "${locale}"`);
      }
    }


    const paramsObj = await searchParams;
    const { page = '1', q, minPrice, maxPrice, minSize, maxSize, rooms, propertyType, neighborhood, balcony, parking, elevator, seaView, furnished, buildingAge, floor, sort } = paramsObj;

    const basePath = '';
    const currentPage = parseInt(page, 10) || 1;
    const limit = 18;
    const offset = (currentPage - 1) * limit;

    // Build filters from URL params
    const filters: any = {
      status: 'kiralik' as const,
    };

    // Debug: Log filters in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[kiralik page] Building filters:', filters);
    }

    if (q) filters.query = q; // getListings expects 'query', not 'search'
    if (minPrice) filters.min_price = Number(minPrice);
    if (maxPrice) filters.max_price = Number(maxPrice);
    if (minSize) filters.min_size = Number(minSize);
    if (maxSize) filters.max_size = Number(maxSize);
    if (rooms) filters.rooms = rooms.split(',').map(Number);
    if (propertyType) filters.property_type = propertyType.split(',');
    if (neighborhood) filters.location_neighborhood = neighborhood.split(',');

    // Apply feature filters directly (getListings expects them at root level)
    if (balcony === 'true') filters.balcony = true;
    if (parking === 'true') filters.parking = true;
    if (elevator === 'true') filters.elevator = true;
    if (seaView === 'true') filters.seaView = true;
    if (furnished === 'true') filters.furnished = true;

    // Note: buildingAge and floor are not directly supported in getListings
    // They would need to be added to the query or handled differently

    // Parse sort
    const sortParam = sort || 'created_at-desc';
    const [sortField, sortOrder] = sortParam.split('-') as ['price_amount' | 'created_at' | 'updated_at', 'asc' | 'desc'];

    // Fetch listings, neighborhoods, and stats with timeout (3s max)
    let listingsResult: { listings: Listing[]; total: number } | null | undefined;
    let neighborhoodsResult: string[] | null | undefined;
    let statsResult: { total: number; satilik: number; kiralik: number; byType: Record<string, number> } | null | undefined;
    let qaEntries: QAEntry[] = [];
    let relatedArticles: Article[] = [];
    try {
      // Debug: Log filters being used
      if (process.env.NODE_ENV === 'development') {
        console.log('[kiralik page] Filters:', JSON.stringify(filters, null, 2));
      }

      try {
        listingsResult = await withTimeout(
          getListings(filters, { field: sortField, order: sortOrder }, limit, offset),
          10000, // Increased timeout to 10s for database queries
          { listings: [], total: 0 }
        );

        // Validate and clean result
        if (listingsResult && listingsResult.listings) {
          // Test serialization of first listing to catch JSON errors early
          if (listingsResult.listings.length > 0) {
            try {
              JSON.stringify(listingsResult.listings[0]);
            } catch (serializeError: any) {
              console.error('[kiralik page] Listing serialization error:', serializeError?.message);
              // Filter out problematic listings
              listingsResult.listings = listingsResult.listings.filter((listing: any) => {
                try {
                  JSON.stringify(listing);
                  return true;
                } catch {
                  return false;
                }
              });
            }
          }
        }
      } catch (listingsError: any) {
        console.error('[kiralik page] Error fetching listings:', listingsError?.message);
        if (process.env.NODE_ENV === 'development') {
          console.error('[kiralik page] Listings error stack:', listingsError?.stack);
        }
        listingsResult = { listings: [], total: 0 };
      }

      // Debug: Log results
      if (process.env.NODE_ENV === 'development') {
        console.log('[kiralik page] Listings result:', {
          count: listingsResult?.listings?.length || 0,
          total: listingsResult?.total || 0,
          hasData: (listingsResult?.listings?.length || 0) > 0,
        });
      }

      neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
      statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
      qaEntries = await withTimeout(getQAEntries('karasu', 'high'), 2000, []) ?? [];
      relatedArticles = await withTimeout(getFeaturedArticles(3), 2000, []) ?? [];
    } catch (error) {
      console.error('Error fetching data for kiralik page:', error);
      // Continue with empty data
      listingsResult = { listings: [], total: 0 };
      neighborhoodsResult = [];
      statsResult = { total: 0, satilik: 0, kiralik: 0, byType: {} };
      qaEntries = [];
      relatedArticles = [];
    }

    const { listings: rawListings = [], total = 0 } = listingsResult || {};
    const neighborhoods = neighborhoodsResult || [];
    const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

    // Serialize listings to ensure safe Next.js serialization
    const listings: Listing[] = serializeListings(rawListings);

    // Debug: Log final results in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[kiralik page] Final results:', {
        listingsCount: listings.length,
        total,
        statsKiralik: stats.kiralik,
      });
    }

    // Fetch Q&A entries for FAQ section
    const faqs = (qaEntries || []).slice(0, 5).map(qa => ({
      question: qa.question,
      answer: qa.answer,
    }));

    // Fetch related content (ilan/mahalle olmasa da sayfa açılsın; undefined'dan kaçın)
    const safeNeighborhoods = (neighborhoods || []).filter((n): n is string => typeof n === 'string' && n.length > 0);
    const relatedNeighborhoods = safeNeighborhoods.slice(0, 6).map((n) => ({
      id: generateSlug(n),
      title: `${n} Mahallesi`,
      slug: generateSlug(n),
      description: `${n} mahallesinde kiralık ev seçenekleri`,
      type: 'neighborhood' as const,
    }));

    let faqSchema = null;
    let itemListSchema = null;
    try {
      faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
      itemListSchema = listings.length > 0
        ? generateItemListSchema(listings, `${siteConfig.url}${basePath}`, {
          name: 'Kiralık Emlak İlanları',
          description: `Karasu ve çevresinde ${listings.length} adet kiralık emlak ilanı. Daire, villa ve yazlık seçenekleri.`,
        })
        : null;
    } catch (error) {
      console.error('Error generating schemas for kiralik page:', error);
      faqSchema = null;
      itemListSchema = null;
    }

    return (
      <>
        {itemListSchema && <StructuredData data={itemListSchema} />}
        {faqSchema && <StructuredData data={faqSchema} />}

        <div className="min-h-screen bg-white">
          {/* Enhanced Hero Section */}
          <EnhancedKiralikHero
            totalListings={stats.kiralik || 0}
            totalStats={stats.total || 0}
            basePath={basePath}
          />

          {/* Contact Info Bar - Premium Responsive Design */}
          <ContactInfoBar />

          <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
            <Ramadan2026PromoBlock basePath={basePath} className="mb-10" />

            {/* Listings Content - IMMEDIATE ACCESS */}
            <section className="mb-16">
              <Suspense fallback={<ListingGridSkeleton count={18} />}>
                <ListingsClient
                  initialListings={listings.slice(0, 10)}
                  total={total}
                  basePath={basePath}
                  neighborhoods={neighborhoods}
                  searchParams={paramsObj}
                />
              </Suspense>
            </section>

            {/* Quick Stats Section - Corporate Design */}
            <section className="mb-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl p-8 lg:p-12 border border-slate-200/60 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006AFF]/10 mb-3 group-hover:bg-[#006AFF]/15 transition-colors">
                    <Home className="h-7 w-7 text-[#006AFF]" strokeWidth={2} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                    {stats.kiralik || 0}+
                  </div>
                  <div className="text-slate-700 font-semibold text-sm mb-1">Aktif Kiralık İlan</div>
                  <div className="text-xs text-slate-500 font-medium">Güncel fırsatlar</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00A862]/10 mb-3 group-hover:bg-[#00A862]/15 transition-colors">
                    <Building2 className="h-7 w-7 text-[#00A862]" strokeWidth={2} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                    {Object.keys(stats.byType || {}).length}+
                  </div>
                  <div className="text-slate-700 font-semibold text-sm mb-1">Emlak Tipi</div>
                  <div className="text-xs text-slate-500 font-medium">Daire, villa, yazlık</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-200/60 mb-3 group-hover:bg-slate-300/60 transition-colors">
                    <MapPin className="h-7 w-7 text-slate-600" strokeWidth={2} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                    15+
                  </div>
                  <div className="text-slate-700 font-semibold text-sm mb-1">Yıllık Deneyim</div>
                  <div className="text-xs text-slate-500 font-medium">Profesyonel hizmet</div>
                </div>
              </div>
            </section>

            {/* Karasu Bölge Tanıtımı - Premium Content */}
            <ContentSection
              title="Karasu: Kiralık Ev İçin İdeal Lokasyon"
              description="Sakarya'nın en gözde ilçesi Karasu, kiralık ev arayanlar için modern yaşam alanları ve konforlu seçenekler sunuyor."
              variant="default"
              className="mb-16"
            >
              <div className="prose prose-slate max-w-none">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em]">
                      <strong className="text-slate-900 font-semibold">Karasu</strong>, kiralık ev arayanlar için ideal bir destinasyon.
                      İstanbul'a yakınlığı (yaklaşık 2 saat), temiz havası, geniş plajları ve gelişen altyapısı ile
                      hem yazlık hem de kalıcı yaşam için mükemmel seçenekler sunmaktadır.
                    </p>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em]">
                      İlçede <strong className="text-slate-900 font-semibold">denize sıfır konumlarda</strong> kiralık daire, villa ve yazlık seçenekleri bulunmaktadır.
                      Merkez mahallelerde modern konut projeleri, sahil şeridinde lüks villa projeleri ve doğa içinde yazlık evler
                      kiralık ev arayanlar için geniş bir yelpaze sunmaktadır.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-200/40">
                      <h4 className="text-lg font-semibold mb-3 text-slate-900 flex items-center gap-2">
                        <Key className="h-5 w-5 text-[#006AFF]" />
                        Kiralama Avantajları
                      </h4>
                      <p className="text-slate-700 text-sm leading-relaxed mb-4">
                        Karasu'da kiralık ev bulmanın avantajları: esnek sözleşme süreleri,
                        uygun kira fiyatları, hızlı taşınma imkanı ve profesyonel emlak danışmanlığı.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00A862]" />
                          <span className="font-semibold text-slate-900">7 Gün</span>
                          <span className="text-slate-600">Hızlı Taşınma</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl border border-emerald-200/40">
                      <h4 className="text-lg font-semibold mb-3 text-slate-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#00A862]" />
                        Lokasyon Avantajları
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                          <span>İstanbul'a 2 saat mesafe</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                          <span>Denize sıfır konumlar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                          <span>Gelişmiş altyapı ve ulaşım</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                          <span>Modern sosyal tesisler</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ContentSection>

            {/* Emlak Tipleri Rehberi - Kiralık */}
            <ContentSection
              title="Kiralık Emlak Tipleri Rehberi"
              description="Karasu'da kiralık ev seçenekleri: daire, villa ve yazlık evler hakkında detaylı bilgiler."
              variant="default"
              className="mb-16"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#006AFF]/10 rounded-xl">
                      <Building2 className="h-6 w-6 text-[#006AFF]" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Kiralık Daire</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Merkez mahallelerde 1+1, 2+1, 3+1 ve 4+1 kiralık daire seçenekleri.
                    Modern binalarda, asansörlü, otoparklı ve eşyalı seçenekler mevcuttur.
                  </p>
                  <div className="text-sm text-slate-600 font-medium mb-3">
                    <span className="text-slate-900 font-bold">₺2.500 - ₺8.000/ay</span> arası
                  </div>
                  <div className="flex gap-2">
                    <Link href={`${basePath}/kiralik-daire`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#006AFF]">
                        Kiralık Daire Rehberi →
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-kiralik-daire`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#006AFF]">
                        Karasu Kiralık Daire →
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-200/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#00A862]/10 rounded-xl">
                      <Home className="h-6 w-6 text-[#00A862]" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Kiralık Villa</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Denize sıfır veya yakın konumlarda lüks kiralık villa seçenekleri.
                    Bahçeli, havuzlu ve geniş yaşam alanları sunan özel konutlar.
                  </p>
                  <div className="text-sm text-slate-600 font-medium mb-3">
                    <span className="text-slate-900 font-bold">₺8.000 - ₺25.000/ay</span> arası
                  </div>
                  <div className="flex gap-2">
                    <Link href={`${basePath}/kiralik-ev`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#00A862]">
                        Kiralık Ev Rehberi →
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-kiralik-ev`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#00A862]">
                        Karasu Kiralık Ev →
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-cyan-50/50 to-white rounded-2xl border border-cyan-200/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                      <Home className="h-6 w-6 text-cyan-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Kiralık Yazlık</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    Yaz ayları için ideal kiralık yazlık evler. Doğa içinde, sakin ve huzurlu
                    yaşam alanları. Kısa ve uzun dönem kiralama seçenekleri.
                  </p>
                  <div className="text-sm text-slate-600 font-medium mb-3">
                    <span className="text-slate-900 font-bold">₺3.000 - ₺12.000/ay</span> arası
                  </div>
                  <div className="flex gap-2">
                    <Link href={`${basePath}/kiralik-villa`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-cyan-600">
                        Kiralık Villa Rehberi →
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-kiralik-ev`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-cyan-600">
                        Karasu Kiralık Ev →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ContentSection>

            {/* Kiralama Süreci (6 Adım) */}
            <ContentSection
              title="Kiralama Süreci: 6 Adımda Kiralık Ev Bulun"
              description="Karasu'da kiralık ev bulma sürecinizi kolaylaştıran adım adım rehber."
              variant="default"
              className="mb-16"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Search, title: 'Arama & Filtreleme', desc: 'İstediğiniz kriterlere göre kiralık evleri filtreleyin', color: 'blue' },
                  { icon: Eye, title: 'Görüntüleme & Değerlendirme', desc: 'Uygun ilanları görüntüleyin ve değerlendirin', color: 'green' },
                  { icon: Phone, title: 'İletişim & Randevu', desc: 'Emlak danışmanımızla iletişime geçin', color: 'cyan' },
                  { icon: FileText, title: 'Sözleşme & Depozito', desc: 'Kira sözleşmesini inceleyin ve depozito ödeyin', color: 'emerald' },
                  { icon: Key, title: 'Teslim & Anahtar', desc: 'Evi teslim alın ve anahtarları alın', color: 'yellow' },
                  { icon: Home, title: 'Taşınma & Yerleşme', desc: 'Evinize taşının ve yeni yaşamınıza başlayın', color: 'blue' },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  const colorClasses = {
                    blue: 'bg-[#006AFF]/10 text-[#006AFF]',
                    green: 'bg-[#00A862]/10 text-[#00A862]',
                    cyan: 'bg-cyan-500/10 text-cyan-600',
                    emerald: 'bg-emerald-500/10 text-emerald-600',
                    yellow: 'bg-yellow-500/10 text-yellow-600',
                  };
                  return (
                    <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]} flex-shrink-0`}>
                          <Icon className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Adım {idx + 1}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mb-2">{step.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContentSection>

            {/* Kira Fiyat Rehberi & Piyasa Analizi */}
            <ContentSection
              title="Kira Fiyat Rehberi & Piyasa Analizi"
              description="Karasu'da kiralık ev fiyatları ve piyasa trendleri hakkında güncel bilgiler."
              variant="default"
              className="mb-16"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/80">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#006AFF]" />
                      Ortalama Kira Fiyatları
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-sm font-semibold text-slate-700">1+1 Daire</span>
                        <span className="text-base font-bold text-slate-900">₺2.500 - ₺4.000/ay</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-sm font-semibold text-slate-700">2+1 Daire</span>
                        <span className="text-base font-bold text-slate-900">₺3.500 - ₺6.000/ay</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-sm font-semibold text-slate-700">3+1 Daire</span>
                        <span className="text-base font-bold text-slate-900">₺5.000 - ₺8.000/ay</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-sm font-semibold text-slate-700">Villa</span>
                        <span className="text-base font-bold text-slate-900">₺8.000 - ₺25.000/ay</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200/40">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#00A862]" />
                      Piyasa Trendleri
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0" />
                        <p className="text-sm text-slate-700">Kiralık ev talebi yaz aylarında %40 artış gösteriyor</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0" />
                        <p className="text-sm text-slate-700">Denize yakın konumlar %20-30 daha yüksek kira alıyor</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0" />
                        <p className="text-sm text-slate-700">Eşyalı evler %15-25 daha yüksek kira değerine sahip</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0" />
                        <p className="text-sm text-slate-700">Ortalama kira sözleşme süresi 12-24 ay arası</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContentSection>

            {/* Related Neighborhoods */}
            {relatedNeighborhoods && relatedNeighborhoods.length > 0 && (
              <RelatedContent
                items={relatedNeighborhoods}
                title="Popüler Mahalleler"
                type="neighborhoods"
                className="mt-12"
              />
            )}

            {/* Related Articles */}
            {(relatedArticles && relatedArticles.length > 0) && (
              <RelatedContent
                items={(relatedArticles as Article[])
                  .filter((a): a is Article => a != null && typeof a?.id === 'string')
                  .map(a => ({
                    id: a.id,
                    title: a.title ?? '',
                    slug: a.slug ?? '',
                    description: a.excerpt || a.meta_description || undefined,
                    image: a.featured_image || undefined,
                    type: 'article' as const,
                  }))}
                title="İlgili Rehber Yazıları"
                type="articles"
                className="mt-12"
              />
            )}

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <FAQBlock
                faqs={faqs}
                title="Kiralık Ev Hakkında Sık Sorulan Sorular"
                className="mt-12"
              />
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </>
    );
  } catch (error: any) {
    console.error('Critical error in ForRentPage:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    // Return a simple page that doesn't require any data
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Karasu Emlak</h1>
          <p className="text-gray-600 mb-6">Sayfa yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>
          <p className="text-sm text-gray-500 mb-4">
            {process.env.NODE_ENV === 'development' && error?.message ? `Hata: ${error.message}` : ''}
          </p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">Ana Sayfaya Dön</a>
        </div>
      </div>
    );
  }
}
