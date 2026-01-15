import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getNeighborhoods, getListings } from '@/lib/supabase/queries';
import { getNeighborhoodWithImage, getNeighborhoodImageUrl, getAllNeighborhoodSlugs } from '@/lib/supabase/queries/neighborhoods';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ListingsClient } from '@/app/[locale]/satilik/ListingsClient';
import { MapPin, Home, Building2, TrendingUp, Waves, DollarSign, Car, School, ShoppingCart, Heart, Info, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { HeroImage } from '@/components/images';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/structured-data';
import { generatePlaceSchema, generateServiceAreaSchema } from '@/lib/seo/local-seo-schemas';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import dynamicImport from 'next/dynamic';

// Lazy load map component
const InteractiveMap = dynamicImport(
  () => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })),
  { loading: () => null }
);

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // First try neighborhoods table (preferred) - use slugs directly from database
  try {
    const neighborhoodSlugs = await withTimeout(getAllNeighborhoodSlugs(), 2000, []);
    if (neighborhoodSlugs && neighborhoodSlugs.length > 0) {
      return neighborhoodSlugs.map((slug) => ({
        slug: slug, // Use database slug directly (already normalized)
      }));
    }
  } catch (error) {
    console.error('Error fetching neighborhood slugs:', error);
  }
  
  // Fallback to getNeighborhoods() (from listings)
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 2000, []);
  const neighborhoods = neighborhoodsResult || [];
  return neighborhoods.map((neighborhood) => ({
    slug: generateSlug(neighborhood), // Generate slug from name as fallback
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Try to get from neighborhoods table first (preferred)
  const neighborhoodDataResult = await withTimeout(getNeighborhoodWithImage(slug), 2000, null);
  const neighborhoodData = neighborhoodDataResult;
  
  // If found in neighborhoods table, use it
  let neighborhood: string | null = null;
  if (neighborhoodData) {
    neighborhood = neighborhoodData.name;
  } else {
    // Fallback: get from getNeighborhoods() (listings-based)
    const neighborhoodsResult = await withTimeout(getNeighborhoods(), 2000, []);
    const neighborhoods = neighborhoodsResult || [];
    neighborhood = neighborhoods.find((n) => generateSlug(n) === slug) || null;
  }

  if (!neighborhood) {
    return {
      title: 'Mahalle Bulunamadı',
    };
  }

  const canonicalPath =
    locale === routing.defaultLocale
      ? `/mahalle/${slug}`
      : `/${locale}/mahalle/${slug}`;

  return {
    title: `${neighborhood} Mahallesi Satılık Ev | Karasu Emlak`,
    description: `${neighborhood} mahallesinde satılık ev ilanları ve rehber. ${neighborhood} mahallesinde satılık ev fiyatları, özellikler ve yatırım potansiyeli. Karasu Emlak ile ${neighborhood} mahallesindeki tüm satılık ev fırsatlarını keşfedin.`,
    keywords: [
      `${neighborhood} satılık ev`,
      `${neighborhood} mahalle satılık ev`,
      `karasu ${neighborhood} satılık ev`,
      `${neighborhood} emlak`,
      `${neighborhood} satılık konut`,
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': `/mahalle/${slug}`,
        'en': `/en/mahalle/${slug}`,
        'et': `/et/mahalle/${slug}`,
        'ru': `/ru/mahalle/${slug}`,
        'ar': `/ar/mahalle/${slug}`,
      },
    },
    openGraph: {
      title: `${neighborhood} Mahallesi Satılık Ev | Karasu Emlak`,
      description: `${neighborhood} mahallesinde satılık ev ilanları ve rehber. ${neighborhood} mahallesinde satılık ev fiyatları, özellikler ve yatırım potansiyeli.`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: neighborhoodData ? [
        {
          url: getNeighborhoodImageUrl(neighborhoodData),
          width: 1200,
          height: 630,
          alt: `${neighborhood} mahallesi`,
        },
      ] : [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${neighborhood} mahallesi`,
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${neighborhood} Mahallesi Satılık Ev`,
      description: `${neighborhood} mahallesinde satılık ev ilanları ve rehber.`,
    },
  };
}

export default async function NeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    propertyType?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const { locale, slug } = await params;
  const paramsObj = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch neighborhoods and neighborhood data with timeout
  // Try to get from neighborhoods table first (preferred)
  const neighborhoodDataResult = await withTimeout(getNeighborhoodWithImage(slug), 3000, null);
  const neighborhoodData = neighborhoodDataResult;
  
  // If found in neighborhoods table, use it
  let neighborhood: string | null = null;
  if (neighborhoodData) {
    neighborhood = neighborhoodData.name;
  } else {
    // Fallback: get from getNeighborhoods() (listings-based)
    const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
    const neighborhoods = neighborhoodsResult || [];
    neighborhood = neighborhoods.find((n) => generateSlug(n) === slug) || null;
  }

  if (!neighborhood) {
    notFound();
  }

  // Fetch all neighborhoods for related neighborhoods section
  const allNeighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const neighborhoods = allNeighborhoodsResult || [];

  const seoContent = neighborhoodData?.seo_content as {
    intro?: string;
    transportation?: string;
    seaDistance?: string;
    socialLife?: string;
    investmentPotential?: string;
  } | null;

  const { page = '1', q, minPrice, maxPrice, minSize, maxSize, rooms, propertyType, status, sort } = paramsObj;
  const currentPage = parseInt(page, 10) || 1;
  const limit = 18;
  const offset = (currentPage - 1) * limit;

  // Build filters
  const filters: any = {
    location_neighborhood: [neighborhood],
  };

  if (status) {
    filters.status = status;
  }

  if (q) filters.query = q;
  if (minPrice) filters.min_price = Number(minPrice);
  if (maxPrice) filters.max_price = Number(maxPrice);
  if (minSize) filters.min_size = Number(minSize);
  if (maxSize) filters.max_size = Number(maxSize);
  if (rooms) filters.rooms = rooms.split(',').map(Number);
  if (propertyType) filters.property_type = propertyType.split(',');

  const sortParam = sort || 'created_at-desc';
  const [sortField, sortOrder] = sortParam.split('-');
  const sortConfig = {
    field: sortField as 'price_amount' | 'created_at' | 'updated_at',
    order: sortOrder as 'asc' | 'desc',
  };

  // Fetch listings with timeout
  const listingsResult = await withTimeout(
    getListings(filters, sortConfig, limit, offset),
    3000,
    { listings: [], total: 0 }
  );
  const allListingsResult = await withTimeout(
    getListings({ location_neighborhood: [neighborhood] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );

  const { listings = [], total = 0 } = listingsResult || {};
  const { listings: allNeighborhoodListings = [] } = allListingsResult || {};
  const satilikCount = allNeighborhoodListings.filter((l) => l.status === 'satilik').length;
  const kiralikCount = allNeighborhoodListings.filter((l) => l.status === 'kiralik').length;

  // Get satılık listings for this neighborhood
  const satilikListings = allNeighborhoodListings.filter((l) => l.status === 'satilik');
  
  // Determine if this is a central or coastal neighborhood for linking
  const neighborhoodSlugLower = generateSlug(neighborhood).toLowerCase();
  const isCentral = neighborhoodSlugLower.includes('merkez') || 
                   neighborhoodSlugLower.includes('ataturk') ||
                   neighborhoodSlugLower.includes('cumhuriyet');
  const isCoastal = neighborhoodSlugLower.includes('sahil') ||
                    neighborhoodSlugLower.includes('yali') ||
                    neighborhoodSlugLower.includes('liman') ||
                    seoContent?.seaDistance?.toLowerCase().includes('yakın') ||
                    seoContent?.seaDistance?.toLowerCase().includes('sıfır');

  // Calculate average price for satılık listings
  const satilikPrices = satilikListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = satilikPrices.length > 0 
    ? Math.round(satilikPrices.reduce((a, b) => a + b, 0) / satilikPrices.length)
    : null;

  // Fetch Q&As from database (with fallback)
  // Now uses both ai_questions and qa_entries
  let neighborhoodFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage(slug, 'karasu', 'neighborhood'),
      2000,
      []
    );
    if (aiQuestions && aiQuestions.length > 0) {
      neighborhoodFAQs.push(...aiQuestions.map(q => ({
        question: q.question,
        answer: q.answer,
      })));
    }
  } catch (error) {
    // Continue to qa_entries
  }
  
  // Then, try qa_entries (legacy system)
  try {
    const qaEntries = await withTimeout(getQAEntries('karasu'), 2000, []);
    if (qaEntries && qaEntries.length > 0) {
      // Filter for relevant Q&As
      const relevantQAs = qaEntries.filter(qa => 
        qa.question.toLowerCase().includes('mahalle') ||
        qa.question.toLowerCase().includes('konum') ||
        qa.question.toLowerCase().includes('fiyat') ||
        qa.question.toLowerCase().includes('yatırım')
      );
      
      // Only add if not already in neighborhoodFAQs (avoid duplicates)
      const existingQuestions = new Set(neighborhoodFAQs.map(f => f.question.toLowerCase()));
      const qasToAdd = (relevantQAs.length > 0 ? relevantQAs : qaEntries).slice(0, 4);
      qasToAdd.forEach(qa => {
        if (!existingQuestions.has(qa.question.toLowerCase()) && neighborhoodFAQs.length < 4) {
          neighborhoodFAQs.push({
            question: qa.question,
            answer: qa.answer,
          });
        }
      });
    }
  } catch (error) {
    // Fallback below
  }
  
  // Fallback to neighborhood-specific FAQs if no database Q&As
  if (neighborhoodFAQs.length === 0) {
    neighborhoodFAQs = [
      {
        question: `${neighborhood} mahallesinde satılık ev fiyatları nasıl?`,
        answer: `${neighborhood} mahallesinde satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. ${avgPrice ? `Ortalama fiyat aralığı yaklaşık ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.` : 'Güncel fiyat bilgisi için ilanlarımıza göz atabilirsiniz.'} ${seoContent?.investmentPotential ? seoContent.investmentPotential : ''}`,
      },
    {
      question: `${neighborhood} mahallesinde ev almanın avantajları nelerdir?`,
      answer: `${neighborhood} mahallesinde ev almanın avantajları arasında ${seoContent?.transportation ? 'ulaşım kolaylığı, ' : ''}${seoContent?.seaDistance ? 'denize yakınlık, ' : ''}${seoContent?.socialLife ? 'sosyal yaşam olanakları ' : 'geniş emlak seçenekleri '}sayılabilir. ${seoContent?.intro || 'Mahalle, Karasu\'nun önemli yerleşim bölgelerinden biridir.'}`,
    },
    {
      question: `${neighborhood} mahallesinde hangi ev türleri bulunuyor?`,
      answer: `${neighborhood} mahallesinde ${Array.from(new Set(satilikListings.map(l => l.property_type))).length > 0 ? Array.from(new Set(satilikListings.map(l => l.property_type))).join(', ') : 'çeşitli'} ev türlerinde satılık seçenekler bulunmaktadır. Toplam ${satilikCount} adet satılık ev ilanı mevcuttur.`,
    },
    {
      question: `${neighborhood} mahallesinde yatırım yapmak mantıklı mı?`,
      answer: `${neighborhood} mahallesinde yatırım yapmak, ${seoContent?.investmentPotential ? seoContent.investmentPotential.toLowerCase() : 'bölgenin gelişen altyapısı ve konum avantajları nedeniyle'} mantıklı olabilir. ${isCoastal ? 'Denize yakın konumu turizm potansiyeli sağlar.' : isCentral ? 'Merkez konumu sürekli kiralama potansiyeli sunar.' : 'Detaylı yatırım analizi için emlak danışmanlarımızla iletişime geçebilirsiniz.'}`,
    },
  ];

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: `${neighborhood} Mahallesi Satılık Ev | Karasu Emlak`,
    description: `${neighborhood} mahallesinde satılık ev ilanları ve rehber. ${neighborhood} mahallesinde satılık ev fiyatları, özellikler ve yatırım potansiyeli.`,
    image: neighborhoodData ? [getNeighborhoodImageUrl(neighborhoodData)] : [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(neighborhoodFAQs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-satilik-ev` },
      { name: `${neighborhood} Mahallesi`, url: `${siteConfig.url}${basePath}/mahalle/${slug}` },
    ],
    `${siteConfig.url}${basePath}/mahalle/${slug}`
  );

  // Place schema for neighborhood (using generatePlaceSchema)
  const placeSchema = generatePlaceSchema({
    name: `${neighborhood} Mahallesi`,
    description: seoContent?.intro || `${neighborhood} mahallesi, Karasu'nun önemli yerleşim bölgelerinden biridir.`,
    address: {
      addressLocality: neighborhood,
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
      postalCode: '54500',
    },
    // Coordinates not available in Neighborhood type
    // ...(neighborhoodData?.coordinates_lat && neighborhoodData?.coordinates_lng && {
    //   geo: {
    //     latitude: Number(neighborhoodData.coordinates_lat),
    //     longitude: Number(neighborhoodData.coordinates_lng),
    //   },
    // }),
    image: neighborhoodData ? getNeighborhoodImageUrl(neighborhoodData) : undefined,
    url: `${siteConfig.url}${basePath}/mahalle/${slug}`,
    containedIn: {
      '@type': 'City',
      name: 'Karasu',
    },
  });

  // ServiceArea schema for real estate agent service coverage
  const serviceAreaSchema = generateServiceAreaSchema({
    serviceType: 'Real Estate Services',
    areaServed: [
      { '@type': 'City', name: 'Karasu' },
      { '@type': 'City', name: 'Kocaali' },
      { '@type': 'State', name: 'Sakarya' },
    ],
    provider: {
      '@type': 'RealEstateAgent',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={placeSchema} />
      <StructuredData data={serviceAreaSchema} />
      
      <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Karasu', href: `${basePath}/karasu` },
          { label: neighborhood },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <header className="mb-8">
        {/* Hero Image */}
        {neighborhoodData && (
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <HeroImage
              publicId={getNeighborhoodImageUrl(neighborhoodData)}
              alt={`${neighborhood} mahallesi`}
              className="w-full h-full object-cover"
              sizes="100vw"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">{neighborhood} Mahallesi</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          {neighborhood} mahallesinde {total} emlak ilanı bulunmaktadır.
        </p>

        {/* Neighborhood Description */}
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">{neighborhood} Hakkında</h2>
          {seoContent?.intro ? (
            <p className="text-muted-foreground mb-4">{seoContent.intro}</p>
          ) : (
            <p className="text-muted-foreground mb-4">
              {neighborhood} mahallesi, Karasu'nun önemli yerleşim bölgelerinden biridir. 
              Denize yakınlığı, gelişmiş altyapısı ve sosyal olanaklarıyla dikkat çeker. 
              Bölgede satılık ve kiralık emlak seçenekleri geniş bir yelpazede sunulmaktadır.
            </p>
          )}
          
          {/* Detailed SEO Content */}
          {seoContent && (
            <div className="space-y-4 mt-4">
              {seoContent.transportation && (
                <div>
                  <h3 className="font-semibold mb-2">Ulaşım</h3>
                  <p className="text-sm text-muted-foreground">{seoContent.transportation}</p>
                </div>
              )}
              {seoContent.seaDistance && (
                <div>
                  <h3 className="font-semibold mb-2">Denize Mesafe</h3>
                  <p className="text-sm text-muted-foreground">{seoContent.seaDistance}</p>
                </div>
              )}
              {seoContent.socialLife && (
                <div>
                  <h3 className="font-semibold mb-2">Sosyal Yaşam</h3>
                  <p className="text-sm text-muted-foreground">{seoContent.socialLife}</p>
                </div>
              )}
              {seoContent.investmentPotential && (
                <div>
                  <h3 className="font-semibold mb-2">Yatırım Potansiyeli</h3>
                  <p className="text-sm text-muted-foreground">{seoContent.investmentPotential}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6 pt-4 border-t">
            <div>
              <span className="font-semibold">Konum:</span>{' '}
              {neighborhoodData?.description || 'Karasu merkeze yakın'}
            </div>
            {seoContent?.transportation && (
              <div>
                <span className="font-semibold">Ulaşım:</span> {seoContent.transportation.split('.')[0]}
              </div>
            )}
            {seoContent?.seaDistance && (
              <div>
                <span className="font-semibold">Denize Mesafe:</span> {seoContent.seaDistance.split('.')[0]}
              </div>
            )}
            <div>
              <span className="font-semibold">Popülerlik:</span> Yüksek talep
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{total}</div>
            <div className="text-sm text-muted-foreground">Toplam İlan</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{satilikCount}</div>
            <div className="text-sm text-muted-foreground">Satılık</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{kiralikCount}</div>
            <div className="text-sm text-muted-foreground">Kiralık</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {new Set(allNeighborhoodListings.map((l) => l.property_type)).size}
            </div>
            <div className="text-sm text-muted-foreground">Emlak Tipi</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Link href={`${basePath}/mahalle/${slug}?status=satilik`}>
            <Button variant={status === 'satilik' ? 'default' : 'outline'}>
              <Home className="h-4 w-4 mr-2" />
              Satılık ({satilikCount})
            </Button>
          </Link>
          <Link href={`${basePath}/mahalle/${slug}?status=kiralik`}>
            <Button variant={status === 'kiralik' ? 'default' : 'outline'}>
              <Building2 className="h-4 w-4 mr-2" />
              Kiralık ({kiralikCount})
            </Button>
          </Link>
        </div>
      </header>

      {/* AI Overviews: Quick Answer */}
      {satilikCount > 0 && (
        <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal direction="up" delay={0}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>{neighborhood} mahallesinde satılık ev</strong> arayanlar için {satilikCount} adet aktif ilan bulunmaktadır. 
                {avgPrice && ` Ortalama fiyat aralığı yaklaşık ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.`}
                {' '}{seoContent?.intro ? seoContent.intro.substring(0, 150) + '...' : `${neighborhood} mahallesi, Karasu'nun önemli yerleşim bölgelerinden biri olup, satılık ev seçenekleri geniş bir yelpazede sunulmaktadır.`}
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Satılık Ev Odaklı İçerik Bölümü */}
      {satilikCount > 0 && (
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal direction="up" delay={0}>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {neighborhood} Mahallesinde Satılık Ev
                </h2>
                <p className="text-lg text-gray-700">
                  {neighborhood} mahallesinde {satilikCount} adet satılık ev ilanı bulunmaktadır. 
                  Bu bölgede satılık ev arayanlar için kapsamlı rehber ve güncel ilanlar.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-8">
              {/* Neighborhood Overview for Satılık Ev */}
              <ScrollReveal direction="up" delay={100}>
                <article className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {neighborhood} Mahallesinde Satılık Ev Piyasası
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      {neighborhood} mahallesi, Karasu'da satılık ev arayanlar için önemli bir bölgedir. 
                      {seoContent?.intro ? (
                        <> {seoContent.intro}</>
                      ) : (
                        <> Mahalle, Karasu'nun önemli yerleşim bölgelerinden biri olup, satılık ev seçenekleri geniş bir yelpazede sunulmaktadır.</>
                      )}
                    </p>
                    <p>
                      {neighborhood} mahallesinde satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. 
                      {avgPrice && (
                        <> Ortalama fiyat aralığı yaklaşık ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.</>
                      )}
                      {' '}Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya emlak danışmanlarımızla iletişime geçebilirsiniz.
                    </p>
                  </div>
                </article>
              </ScrollReveal>

              {/* Location Advantages */}
              <ScrollReveal direction="up" delay={200}>
                <article>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {neighborhood} Mahallesinde Ev Almanın Avantajları
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {seoContent?.transportation && (
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Ulaşım Kolaylığı</h4>
                        </div>
                        <p className="text-sm text-gray-700">{seoContent.transportation}</p>
                      </div>
                    )}
                    
                    {seoContent?.seaDistance && (
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <Waves className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Denize Yakınlık</h4>
                        </div>
                        <p className="text-sm text-gray-700">{seoContent.seaDistance}</p>
                      </div>
                    )}

                    {seoContent?.socialLife && (
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <Home className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Sosyal Yaşam</h4>
                        </div>
                        <p className="text-sm text-gray-700">{seoContent.socialLife}</p>
                      </div>
                    )}

                    {seoContent?.investmentPotential && (
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-gray-900">Yatırım Potansiyeli</h4>
                        </div>
                        <p className="text-sm text-gray-700">{seoContent.investmentPotential}</p>
                      </div>
                    )}
                  </div>
                </article>
              </ScrollReveal>

              {/* Property Types in Neighborhood */}
              <ScrollReveal direction="up" delay={300}>
                <article>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {neighborhood} Mahallesinde Satılık Ev Türleri
                  </h3>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p>
                      {neighborhood} mahallesinde çeşitli ev türlerinde satılık seçenekler bulunmaktadır. 
                      Müstakil evler, apartman daireleri, villalar ve yazlık evler arasından seçim yapabilirsiniz.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {Array.from(new Set(satilikListings.map(l => l.property_type))).map((type) => {
                        const typeCount = satilikListings.filter(l => l.property_type === type).length;
                        const typeLabels: Record<string, string> = {
                          ev: 'Müstakil Ev',
                          daire: 'Daire',
                          villa: 'Villa',
                          yazlik: 'Yazlık',
                          arsa: 'Arsa',
                          isyeri: 'İşyeri',
                        };
                        return (
                          <div key={type} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">{typeLabels[type] || type}</span>
                              <span className="text-primary font-bold">{typeCount} ilan</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </ScrollReveal>

              {/* Price Range Analysis */}
              {satilikPrices.length > 0 && (
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {neighborhood} Mahallesinde Fiyat Aralıkları
                    </h3>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        {neighborhood} mahallesinde satılık ev fiyatları geniş bir aralıkta değişmektedir. 
                        En düşük fiyat ₺{new Intl.NumberFormat('tr-TR').format(Math.min(...satilikPrices))}, 
                        en yüksek fiyat ₺{new Intl.NumberFormat('tr-TR').format(Math.max(...satilikPrices))} 
                        arasında değişmektedir.
                      </p>
                      {avgPrice && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700">
                            <strong>Ortalama Fiyat:</strong> ₺{new Intl.NumberFormat('tr-TR').format(avgPrice)}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                </ScrollReveal>
              )}

              {/* Internal Linking to Pillar and Cornerstones */}
              <ScrollReveal direction="up" delay={500}>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Daha Fazla Bilgi
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Karasu'da satılık ev hakkında daha kapsamlı bilgi için{' '}
                    <Link href={`${basePath}/karasu-satilik-ev`} className="text-primary hover:underline font-medium">
                      Karasu Satılık Ev
                    </Link>{' '}
                    rehberimize göz atabilirsiniz.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`${basePath}/karasu-satilik-ev`}>
                      <Button variant="outline" size="sm">
                        Ana Rehber
                      </Button>
                    </Link>
                    {isCentral && (
                      <Link href={`${basePath}/karasu-merkez-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Merkez Satılık Ev
                        </Button>
                      </Link>
                    )}
                    {isCoastal && (
                      <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Denize Yakın Evler
                        </Button>
                      </Link>
                    )}
                    <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                      <Button variant="outline" size="sm">
                        Fiyat Analizi
                      </Button>
                    </Link>
                    {seoContent?.investmentPotential && (
                      <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Yatırımlık Evler
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Map Section */}
      {allNeighborhoodListings.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {neighborhood} Mahallesi Harita Görünümü
                </h2>
                <p className="text-base text-gray-600">
                  {neighborhood} mahallesindeki tüm emlak ilanlarını haritada görüntüleyin
                </p>
              </div>
            </ScrollReveal>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <InteractiveMap
                listings={allNeighborhoodListings.map(l => ({
                  id: l.id,
                  title: l.title,
                  slug: l.slug,
                  location_neighborhood: l.location_neighborhood || '',
                  location_district: l.location_district,
                  coordinates_lat: l.coordinates_lat?.toString() || '',
                  coordinates_lng: l.coordinates_lng?.toString() || '',
                  price_amount: l.price_amount?.toString() || '',
                  status: l.status,
                  property_type: l.property_type,
                  images: l.images?.map(img => ({
                    public_id: img.public_id || '',
                    url: img.url,
                    alt: img.alt,
                  })) || [],
                  features: l.features,
                  images: l.images?.map(img => ({
                    public_id: img.public_id || '',
                    url: img.url,
                    alt: img.alt,
                  })) || [],
                  features: l.features,
                }))}
                basePath={basePath}
                height="600px"
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Satılık Listings Preview */}
      {satilikListings.length > 0 && status !== 'kiralik' && (
        <section className="py-12 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {neighborhood} Mahallesinde Öne Çıkan Satılık Evler
                </h2>
                <p className="text-base text-gray-600">
                  {satilikListings.length} adet satılık ev ilanı
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {satilikListings.slice(0, 6).map((listing, index) => (
                <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                  <ListingCard listing={listing} basePath={basePath} />
                </ScrollReveal>
              ))}
            </div>
            {satilikListings.length > 6 && (
              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link href={`${basePath}/mahalle/${slug}?status=satilik`}>
                    Tüm Satılık İlanları Görüntüle ({satilikListings.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sık Sorulan Sorular
              </h2>
              <p className="text-base text-gray-600">
                {neighborhood} mahallesi hakkında merak edilenler
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {neighborhoodFAQs.map((faq, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 50}>
                <details className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md">
                  <summary className="cursor-pointer flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4 group-hover:text-primary transition-colors">
                      {faq.question}
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related Neighborhoods */}
      {neighborhoods.length > 1 && (
        <section className="py-12 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Diğer Mahalleler
                </h2>
                <p className="text-base text-gray-600">
                  Karasu'nun diğer mahallelerinde de satılık ev seçenekleri bulunmaktadır.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {neighborhoods
                .filter(n => generateSlug(n) !== generateSlug(neighborhood))
                .slice(0, 8)
                .map((otherNeighborhood) => {
                  const otherSlug = generateSlug(otherNeighborhood);
                  return (
                    <Link
                      key={otherNeighborhood}
                      href={`${basePath}/mahalle/${otherSlug}?status=satilik`}
                      className="block border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-gray-900">{otherNeighborhood}</span>
                      </div>
                      <span className="text-sm text-primary">Mahalle detayları →</span>
                    </Link>
                  );
                })}
            </div>
            <div className="text-center mt-6">
              <Link href={`${basePath}/karasu`}>
                <Button variant="outline">
                  Tüm Mahalleleri Keşfet
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {neighborhood} Mahallesinde Hayalinizdeki Evi Bulun
            </h2>
            <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Uzman emlak danışmanlarımız, {neighborhood} mahallesinde satılık ev arayanlar için 
              profesyonel danışmanlık hizmeti sunmaktadır. Tüm süreçte yanınızdayız.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>
                  <Phone className="w-5 h-5 mr-2" />
                  İletişime Geçin
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Home className="w-5 h-5 mr-2" />
                  Karasu Satılık Ev Rehberi
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Listings */}
      <ListingsClient
        initialListings={listings}
        total={total}
        basePath={`${basePath}/mahalle/${slug}`}
        neighborhoods={[neighborhood]}
        searchParams={paramsObj}
      />
      </div>
    </>
  );
}

}
