import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getListings, getNeighborhoods, getListingStats, type Listing } from '@/lib/supabase/queries';
import { ListingsClient } from './ListingsClient';
import { withTimeout } from '@/lib/utils/timeout';
import { EnhancedSatilikHero } from '@/components/listings/EnhancedSatilikHero';
import { PageIntro, ContentSection, FAQBlock, RelatedContent } from '@/components/content';
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm';
import { getQAEntries, type QAEntry } from '@/lib/supabase/queries/qa';
import { getFeaturedArticles, type Article } from '@/lib/supabase/queries/articles';
import { generateSlug } from '@/lib/utils';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Home, FileText, MapPin, ArrowRight, Search, DollarSign, Building2, Phone, Mail, MessageCircle, TrendingUp, Shield, CheckCircle2, Clock, Users, Award, BarChart3, Info, Lightbulb, Target, Zap, Eye, Calculator } from 'lucide-react';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import { ListingGridSkeleton } from '@/components/listings/ListingCardSkeleton';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Since localePrefix is "as-needed", default locale doesn't need /tr prefix
  const canonicalPath = locale === routing.defaultLocale ? '/satilik' : `/${locale}/satilik`;
  
  return {
    title: 'Satılık İlanlar | Karasu Emlak | Daire, Villa, Yazlık, Arsa',
    description: 'Karasu ve çevresinde satılık emlak ilanları. Denize sıfır konumlarda satılık daire, villa, yazlık ve arsa seçenekleri. 15 yıllık deneyimli emlak danışmanları ile hayalinizdeki evi bulun.',
    keywords: [
      'karasu satılık',
      'karasu satılık daire',
      'karasu satılık villa',
      'karasu satılık yazlık',
      'karasu satılık arsa',
      'karasu denize sıfır satılık',
      'karasu merkez satılık',
      'sakarya satılık emlak',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/satilik',
        'en': '/en/satilik',
        'et': '/et/satilik',
        'ru': '/ru/satilik',
        'ar': '/ar/satilik',
      },
    },
    openGraph: {
      title: 'Satılık İlanlar | Karasu Emlak',
      description: 'Karasu ve çevresinde satılık emlak ilanları. Denize sıfır konumlarda satılık daire, villa, yazlık ve arsa seçenekleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Satılık İlanlar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Satılık İlanlar | Karasu Emlak',
      description: 'Karasu ve çevresinde satılık emlak ilanları. Denize sıfır konumlarda satılık daire, villa, yazlık ve arsa seçenekleri.',
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
}

export default async function ForSalePage({
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
    const { locale } = await params;
    const paramsObj = await searchParams;
    const { page = '1', q, minPrice, maxPrice, minSize, maxSize, rooms, propertyType, neighborhood, balcony, parking, elevator, seaView, furnished, buildingAge, floor, sort } = paramsObj;
    
    const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
    const currentPage = parseInt(page, 10) || 1;
    const limit = 18;
    const offset = (currentPage - 1) * limit;
    
    // Build filters from URL params
    const filters: any = {
      status: 'satilik',
    };

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
      listingsResult = await withTimeout(
        getListings(filters, { field: sortField, order: sortOrder }, limit, offset),
        3000,
        { listings: [], total: 0 }
      );
      neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
      statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
      qaEntries = await withTimeout(getQAEntries('karasu', 'high'), 2000, []) ?? [];
      relatedArticles = await withTimeout(getFeaturedArticles(3), 2000, []) ?? [];
    } catch (error) {
      console.error('Error fetching data for satilik page:', error);
      // Continue with empty data
      listingsResult = { listings: [], total: 0 };
      neighborhoodsResult = [];
      statsResult = { total: 0, satilik: 0, kiralik: 0, byType: {} };
      qaEntries = [];
      relatedArticles = [];
    }

    const { listings = [], total = 0 } = listingsResult || {};
    const neighborhoods = neighborhoodsResult || [];
    const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

    // Fetch Q&A entries for FAQ section
    const faqs = (qaEntries || []).slice(0, 5).map(qa => ({
      question: qa.question,
      answer: qa.answer,
    }));

    // Fetch related content
    const relatedNeighborhoods = neighborhoods.slice(0, 6).map(n => ({
      id: generateSlug(n),
      title: `${n} Mahallesi`,
      slug: generateSlug(n),
      description: `${n} mahallesinde satılık ev seçenekleri`,
      type: 'neighborhood' as const,
    }));

    let faqSchema, itemListSchema;
    try {
      faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
      itemListSchema = listings.length > 0
        ? generateItemListSchema(listings, `${siteConfig.url}${basePath}`, {
            name: 'Satılık Emlak İlanları',
            description: `Karasu ve çevresinde ${listings.length} adet satılık emlak ilanı. Daire, villa, yazlık ve arsa seçenekleri.`,
          })
        : null;
    } catch (error) {
      console.error('Error generating schemas for satilik page:', error);
      faqSchema = null;
      itemListSchema = null;
    }

    return (
      <>
        {itemListSchema && <StructuredData data={itemListSchema} />}
        {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white">
        {/* Enhanced Hero Section */}
        <EnhancedSatilikHero
          totalListings={stats.satilik || 0}
          totalStats={stats.total || 0}
          basePath={basePath}
        />

        {/* Contact Info Bar - Premium Responsive Design */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border-b border-slate-200/60 overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23006AFF' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h18v-2H22zM0 20h2v20H0V20zm40 0v20H20v-2h18V20H20v-2h20zM0 38h20v2H0v-2zm20-18H0v2h20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 py-4 sm:py-5 md:py-6">
              {/* Phone - Mobile: Full width, Desktop: Auto */}
              <a
                href="tel:+905325933854"
                className="group flex items-center justify-center sm:justify-start gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white/80 hover:bg-white rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/80 hover:border-[#006AFF]/30 hover:scale-[1.02] active:scale-[0.98] min-w-0 flex-1 sm:flex-none"
                aria-label="Telefon ile ara"
              >
                <div className="flex-shrink-0 p-2 sm:p-2.5 bg-[#006AFF]/10 rounded-lg group-hover:bg-[#006AFF]/15 transition-all duration-300 group-hover:scale-110">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#006AFF]" strokeWidth={2.5} />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  <span className="hidden sm:inline">+90 (546) 639 54 61</span>
                  <span className="sm:hidden">
                    <span className="block">+90 (546)</span>
                    <span className="block text-xs text-slate-600 font-medium mt-0.5">639 54 61</span>
                  </span>
                </span>
              </a>

              {/* Email - Mobile: Full width, Desktop: Auto */}
              <a
                href="mailto:info@karasuemlak.net"
                className="group flex items-center justify-center sm:justify-start gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white/80 hover:bg-white rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/80 hover:border-[#006AFF]/30 hover:scale-[1.02] active:scale-[0.98] min-w-0 flex-1 sm:flex-none"
                aria-label="E-posta gönder"
              >
                <div className="flex-shrink-0 p-2 sm:p-2.5 bg-[#006AFF]/10 rounded-lg group-hover:bg-[#006AFF]/15 transition-all duration-300 group-hover:scale-110">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#006AFF]" strokeWidth={2.5} />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight break-all sm:break-normal">
                  info@karasuemlak.net
                </span>
              </a>

              {/* WhatsApp - Mobile: Full width, Desktop: Auto */}
              <a
                href="https://wa.me/905325933854"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center sm:justify-start gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white/80 hover:bg-white rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/80 hover:border-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98] min-w-0 flex-1 sm:flex-none"
                aria-label="WhatsApp ile mesaj gönder"
              >
                <div className="flex-shrink-0 p-2 sm:p-2.5 bg-[#25D366]/10 rounded-lg group-hover:bg-[#25D366]/15 transition-all duration-300 group-hover:scale-110">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#25D366]" strokeWidth={2.5} />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Listings Content - IMMEDIATE ACCESS */}
          <section className="mb-16">
            <Suspense fallback={<ListingGridSkeleton count={18} />}>
              <ListingsClient
                initialListings={listings}
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
                  {stats.satilik || 0}+
                </div>
                <div className="text-slate-700 font-semibold text-sm mb-1">Aktif Satılık İlan</div>
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
                <div className="text-xs text-slate-500 font-medium">Daire, villa, yazlık, arsa</div>
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
            title="Karasu: Denize Sıfır Yaşamın Adresi"
            description="Sakarya'nın en gözde ilçesi Karasu, Karadeniz'in eşsiz kıyılarında modern yaşam alanları ve yatırım fırsatları sunuyor."
            variant="default"
            className="mb-16"
          >
            <div className="prose prose-slate max-w-none">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em]">
                    <strong className="text-slate-900 font-semibold">Karasu</strong>, Sakarya'nın en popüler sahil ilçelerinden biri olarak, 
                    İstanbul'a yakınlığı (yaklaşık 2 saat), temiz havası, geniş plajları ve gelişen altyapısı ile dikkat çekiyor. 
                    Özellikle yaz aylarında nüfusu artan ilçe, yıl boyu yaşanabilir bir destinasyon haline gelmiştir.
                  </p>
                  <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em]">
                    İlçede <strong className="text-slate-900 font-semibold">denize sıfır konumlarda</strong> satılık daire, villa ve yazlık seçenekleri bulunmaktadır. 
                    Merkez mahallelerde modern konut projeleri, sahil şeridinde lüks villa projeleri ve doğa içinde yazlık evler 
                    yatırımcılar ve yaşam kalitesi arayanlar için ideal seçenekler sunmaktadır.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-200/40">
                    <h4 className="text-lg font-semibold mb-3 text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#006AFF]" />
                      Yatırım Potansiyeli
                    </h4>
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">
                      Karasu emlak piyasası son yıllarda istikrarlı bir büyüme göstermektedir. Denize yakın konumlar, 
                      turizm potansiyeli ve gelişen altyapı yatırımcılar için cazip fırsatlar sunmaktadır.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#00A862]" />
                        <span className="font-semibold text-slate-900">%15-20</span>
                        <span className="text-slate-600">Yıllık Artış</span>
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
                        <span>Geniş ve temiz plajlar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>Gelişmiş altyapı ve hizmetler</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>Doğa ve deniz manzarası</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ContentSection>

          {/* Emlak Tipleri Rehberi - Comprehensive */}
          <ContentSection
            title="Karasu'da Satılık Emlak Tipleri"
            description="Her ihtiyaca uygun emlak seçenekleri: Daire, Villa, Yazlık ve Arsa. Detaylı bilgiler ve öneriler."
            variant="default"
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daire */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#006AFF]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#006AFF]/10 rounded-xl">
                    <Building2 className="h-6 w-6 text-[#006AFF]" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Satılık Daire</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Merkez ve sahil bölgelerinde 1+1'den 4+1'e kadar geniş seçenek. Modern projeler, deniz manzaralı konumlar.
                </p>
                <div className="space-y-2 mb-4 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Fiyat Aralığı:</span>
                    <span className="font-semibold text-slate-700">800K - 2.5M TL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Popüler:</span>
                    <span className="font-semibold text-slate-700">2+1, 3+1</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`${basePath}/satilik?propertyType=daire`}>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-slate-300 hover:border-[#006AFF] hover:text-[#006AFF]">
                      Daire Ara
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`${basePath}/satilik-daire`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#006AFF]">
                        Satılık Daire Rehberi →
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-satilik-daire`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#006AFF]">
                        Karasu Satılık Daire →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Villa */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#006AFF]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#00A862]/10 rounded-xl">
                    <Home className="h-6 w-6 text-[#00A862]" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Satılık Villa</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Lüks yaşam arayanlar için denize sıfır veya manzaralı konumlarda müstakil villa seçenekleri.
                </p>
                <div className="space-y-2 mb-4 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Fiyat Aralığı:</span>
                    <span className="font-semibold text-slate-700">2M - 8M TL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Özellik:</span>
                    <span className="font-semibold text-slate-700">Bahçeli, Havuzlu</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`${basePath}/satilik?propertyType=villa`}>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-slate-300 hover:border-[#00A862] hover:text-[#00A862]">
                      Villa Ara
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
              <div className="flex gap-2">
                <Link href={`${basePath}/satilik-villa`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#00A862]">
                    Satılık Villa Rehberi →
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-villa`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-[#00A862]">
                    Karasu Satılık Villa →
                  </Button>
                </Link>
              </div>
                </div>
              </div>

              {/* Yazlık */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#006AFF]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Home className="h-6 w-6 text-amber-700" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Satılık Yazlık</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Yaz tatilleri ve hafta sonları için ideal, denize yakın yazlık ev seçenekleri. Uygun fiyatlı alternatifler.
                </p>
                <div className="space-y-2 mb-4 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Fiyat Aralığı:</span>
                    <span className="font-semibold text-slate-700">600K - 1.8M TL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Konum:</span>
                    <span className="font-semibold text-slate-700">Sahil Şeridi</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`${basePath}/satilik?propertyType=yazlik`}>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-slate-300 hover:border-amber-500 hover:text-amber-700">
                      Yazlık Ara
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
              <div className="flex gap-2">
                <Link href={`${basePath}/satilik-yazlik`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-amber-700">
                    Satılık Yazlık Rehberi →
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-yazlik`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-amber-700">
                    Karasu Satılık Yazlık →
                  </Button>
                </Link>
              </div>
                </div>
              </div>

              {/* Arsa */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#006AFF]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-purple-700" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Satılık Arsa</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Kendi evinizi inşa etmek isteyenler için imarlı arsa seçenekleri. Yatırım ve inşaat için ideal.
                </p>
                <div className="space-y-2 mb-4 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Fiyat Aralığı:</span>
                    <span className="font-semibold text-slate-700">300K - 1.5M TL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Metrekare:</span>
                    <span className="font-semibold text-slate-700">500m² - 2000m²</span>
                  </div>
                </div>
                <Link href={`${basePath}/satilik?propertyType=arsa`}>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-slate-300 hover:border-purple-500 hover:text-purple-700">
                    Arsa Ara
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </ContentSection>

          {/* Alım-Satım Süreci - Step by Step */}
          <ContentSection
            title="Karasu'da Satılık Ev Alım Süreci: Adım Adım Rehber"
            description="Profesyonel emlak danışmanlarımız eşliğinde güvenli ve sorunsuz alım-satım süreci. Her adımda yanınızdayız."
            variant="default"
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: "Emlak Seçimi",
                  description: "İhtiyaçlarınıza uygun emlak seçimi. Filtreler ve arama özelliklerimizle ideal evi bulun.",
                  icon: Search,
                  color: "blue",
                },
                {
                  step: 2,
                  title: "Görüntüleme & Değerlendirme",
                  description: "Seçtiğiniz emlakları yerinde görüntüleyin. Uzman danışmanlarımız detaylı bilgi verir.",
                  icon: Eye,
                  color: "green",
                },
                {
                  step: 3,
                  title: "Fiyat Görüşmesi",
                  description: "Adil fiyat görüşmeleri. Piyasa analizi ve değerleme desteği ile en iyi fiyatı alın.",
                  icon: DollarSign,
                  color: "amber",
                },
                {
                  step: 4,
                  title: "Sözleşme & Ödeme",
                  description: "Yasal sözleşme hazırlığı ve ödeme planı. Tüm belgeler profesyonelce hazırlanır.",
                  icon: FileText,
                  color: "purple",
                },
                {
                  step: 5,
                  title: "Tapu İşlemleri",
                  description: "Tapu devri ve tüm resmi işlemler. Hukuki danışmanlık desteği ile güvenli süreç.",
                  icon: Shield,
                  color: "indigo",
                },
                {
                  step: 6,
                  title: "Teslim & Sonrası",
                  description: "Emlak teslimi ve sonrası destek. Her zaman yanınızdayız.",
                  icon: CheckCircle2,
                  color: "emerald",
                },
              ].map((item) => {
                const Icon = item.icon;
                const colorClasses = {
                  blue: "bg-[#006AFF]/10 text-[#006AFF] border-[#006AFF]/20",
                  green: "bg-[#00A862]/10 text-[#00A862] border-[#00A862]/20",
                  amber: "bg-amber-100 text-amber-700 border-amber-200",
                  purple: "bg-purple-100 text-purple-700 border-purple-200",
                  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
                  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
                };
                return (
                  <div key={item.step} className="relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                      {item.step}
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      <div className={`p-4 ${colorClasses[item.color as keyof typeof colorClasses]} rounded-xl border mb-4`}>
                        <Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentSection>

          {/* Fiyat Rehberi & Piyasa Analizi - Enhanced */}
          <ContentSection
            title="Karasu Satılık Ev Fiyatları ve Piyasa Analizi"
            description="Güncel fiyat trendleri, bölgesel farklılıklar ve yatırım önerileri. Bilinçli karar verin."
            variant="default"
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-200/40">
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-[#006AFF]" />
                    Fiyat Trendleri
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-700 font-medium">Merkez Bölge (2+1 Daire)</span>
                      <span className="font-bold text-slate-900">800K - 1.5M TL</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-700 font-medium">Denize Yakın (3+1 Daire)</span>
                      <span className="font-bold text-slate-900">1.2M - 2.5M TL</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-700 font-medium">Villa (Müstakil)</span>
                      <span className="font-bold text-slate-900">2M - 8M TL</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <span className="text-slate-700 font-medium">Yazlık (Sahil)</span>
                      <span className="font-bold text-slate-900">600K - 1.8M TL</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl border border-emerald-200/40">
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-[#00A862]" />
                    Yatırım İpuçları
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Denize yakın konumlar</strong> yatırım değeri yüksek
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Gelişen mahalleler</strong> gelecek potansiyeli sunar
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Altyapı projeleri</strong> fiyat artışı getirir
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Kredi imkanları</strong> ile uygun ödeme planı
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 rounded-2xl border border-amber-200/40">
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-700" />
                    Önemli Notlar
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Fiyatlar emlak özelliklerine, konumuna ve piyasa koşullarına göre değişiklik gösterebilir. 
                    Güncel fiyat bilgisi için lütfen iletişime geçin. Profesyonel değerleme hizmetimizden yararlanabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/60">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">Kredi Hesaplayıcı ile Ödeme Planınızı Belirleyin</h3>
                  <p className="text-slate-600 text-sm">
                    Konut kredisi imkanlarınızı öğrenin ve aylık ödeme tutarınızı hesaplayın.
                  </p>
                </div>
                <Link href={`${basePath}/kredi-hesaplayici`}>
                  <Button className="bg-[#006AFF] hover:bg-[#0052CC] text-white gap-2">
                    <Calculator className="h-4 w-4" />
                    Kredi Hesapla
                  </Button>
                </Link>
              </div>
            </div>
          </ContentSection>

          {/* Buyer Guide Section - Enhanced */}
          <ContentSection
            title="Karasu'da Satılık Ev Alırken Bilmeniz Gerekenler"
            description="Karasu'da satılık ev almak isteyenler için kapsamlı rehber ve ipuçları. Profesyonel emlak danışmanlarımız ile güvenli alım-satım süreci."
            variant="default"
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 p-4 bg-[#006AFF]/10 rounded-xl border border-[#006AFF]/20">
                    <Search className="h-7 w-7 text-[#006AFF]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 tracking-tight">Filtreleme ve Arama</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em] mb-3">
                  Yukarıdaki filtreleri kullanarak istediğiniz özelliklere göre satılık evleri arayabilirsiniz. 
                  Fiyat aralığı, oda sayısı, metrekare, mahalle ve özellikler (balkon, otopark, asansör, deniz manzarası) 
                  gibi kriterlere göre arama yapabilirsiniz.
                </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#006AFF] flex-shrink-0 mt-0.5" />
                        <span>Gelişmiş filtreleme seçenekleri</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#006AFF] flex-shrink-0 mt-0.5" />
                        <span>Harita üzerinden konum seçimi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#006AFF] flex-shrink-0 mt-0.5" />
                        <span>Kayıtlı aramalar ve bildirimler</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 p-4 bg-[#00A862]/10 rounded-xl border border-[#00A862]/20">
                    <Shield className="h-7 w-7 text-[#00A862]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 tracking-tight">Güvenli İşlem</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em] mb-3">
                      Tüm alım-satım işlemlerimiz yasal güvence altındadır. Tapu kontrolü, hukuki danışmanlık ve 
                      sigorta desteği ile güvenli süreç yönetimi sağlıyoruz.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>Tapu ve belge kontrolü</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>Hukuki danışmanlık desteği</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                        <span>Sigorta ve güvence</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 p-4 bg-amber-100 rounded-xl border border-amber-200">
                    <FileText className="h-7 w-7 text-amber-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 tracking-tight">Emlak Alım Süreci</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em] mb-3">
                  Karasu'da satılık ev alım süreci genellikle şu adımları içerir: emlak seçimi, fiyat görüşmesi, 
                  sözleşme imzalanması, kapora ödenmesi, tapu işlemleri ve tapu devri. Tüm süreçte profesyonel 
                  emlak danışmanlarımız size rehberlik edecektir.
                </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>Ortalama süre: 30-45 gün</span>
                    </div>
                  </div>
              </div>

                <div className="flex items-start gap-5 p-6 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 rounded-2xl border border-amber-200/40 shadow-sm">
                  <div className="flex-shrink-0 p-4 bg-amber-100 rounded-xl border border-amber-200">
                    <DollarSign className="h-7 w-7 text-amber-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-slate-900 tracking-tight">Fiyat Rehberi</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px] font-normal tracking-[-0.011em] mb-6">
                  Karasu'da satılık ev fiyatları konum, büyüklük ve özelliklere göre değişmektedir. 
                  Merkez bölgede 2+1 daireler genellikle 800.000 TL ile 1.500.000 TL arasında, 
                  denize yakın bölgelerde ise 1.200.000 TL ile 2.500.000 TL arasında değişmektedir.
                </p>
                    <div className="flex flex-wrap gap-3">
                <Link href={`${basePath}/rehber/emlak-alim-satim`}>
                        <Button variant="outline" size="sm" className="gap-2 border-slate-300 hover:border-[#006AFF] hover:text-[#006AFF] font-medium text-[14px] tracking-tight">
                          <FileText className="h-4 w-4" strokeWidth={2} />
                    Detaylı Rehber
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-ev`}>
                        <Button variant="outline" size="sm" className="gap-2 border-slate-300 hover:border-[#006AFF] hover:text-[#006AFF] font-medium text-[14px] tracking-tight">
                          <MapPin className="h-4 w-4" strokeWidth={2} />
                    Karasu Rehberi
                  </Button>
                </Link>
                <Link href={`${basePath}/kredi-hesaplayici`}>
                        <Button variant="outline" size="sm" className="gap-2 border-slate-300 hover:border-[#006AFF] hover:text-[#006AFF] font-medium text-[14px] tracking-tight">
                          <Home className="h-4 w-4" strokeWidth={2} />
                    Kredi Hesaplayıcı
                  </Button>
                </Link>
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
          {relatedArticles && relatedArticles.length > 0 && (
            <RelatedContent
              items={relatedArticles.map(a => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                description: a.excerpt || a.meta_description || undefined,
                image: a.featured_image || undefined,
                type: 'article' as const,
              }))}
              title="İlgili Rehber Yazıları"
              type="articles"
              className="mt-12"
            />
          )}

          {/* Price Alert Form Section */}
          <ContentSection
            title="Fiyat Uyarısı Oluşturun"
            description="İstediğiniz kriterlere uygun yeni ilanlar bulunduğunda size bildirim gönderelim."
            variant="default"
            className="mt-12"
          >
            <div className="max-w-2xl mx-auto">
              <PriceAlertForm />
            </div>
          </ContentSection>

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <FAQBlock
              faqs={faqs}
              title="Satılık Ev Hakkında Sık Sorulan Sorular"
              className="mt-12"
            />
          )}
        </div>
      </div>
      
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav showFilterButton={true} />
      </>
    );
  } catch (error) {
    console.error('Critical error in ForSalePage:', error);
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

