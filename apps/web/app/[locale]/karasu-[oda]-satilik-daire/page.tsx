import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, TrendingUp, Building2, CheckCircle2, DollarSign } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
import dynamicImport from 'next/dynamic';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

// Valid room configurations
const validRooms = ['1+1', '2+1', '3+1', '4+1'];
const roomLabels: Record<string, { label: string; description: string; priceRange: string }> = {
  '1+1': {
    label: '1+1',
    description: 'Tek kişi veya çiftler için ideal. Yatırım amaçlı da tercih edilir.',
    priceRange: '800.000 TL - 1.200.000 TL',
  },
  '2+1': {
    label: '2+1',
    description: 'Çiftler ve küçük aileler için ideal. En popüler seçenek.',
    priceRange: '1.000.000 TL - 1.800.000 TL',
  },
  '3+1': {
    label: '3+1',
    description: 'Aileler için en popüler seçenek. Geniş yaşam alanı.',
    priceRange: '1.500.000 TL - 2.500.000 TL',
  },
  '4+1': {
    label: '4+1',
    description: 'Geniş aileler için ideal. Lüks yaşam alanı.',
    priceRange: '2.000.000 TL - 3.500.000 TL',
  },
};

export async function generateStaticParams() {
  return validRooms.map((oda) => ({
    oda: oda.replace('+', '-'), // 1+1 -> 1-1 for URL
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; oda: string }>;
}): Promise<Metadata> {
  const { locale, oda } = await params;
  const roomKey = oda.replace('-', '+'); // 1-1 -> 1+1
  
  if (!validRooms.includes(roomKey)) {
    notFound();
  }
  
  const roomInfo = roomLabels[roomKey];
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const canonicalPath = locale === routing.defaultLocale 
    ? `/karasu-${oda}-satilik-daire` 
    : `/${locale}/karasu-${oda}-satilik-daire`;
  
  return {
    title: `Karasu ${roomInfo.label} Satılık Daire | ${roomInfo.label} Daire İlanları 2025 | Karasu Emlak`,
    description: `Karasu'da ${roomInfo.label} satılık daire ilanları. ${roomInfo.description} Güncel fiyatlar ${roomInfo.priceRange} arasında. Denize yakın konumlarda geniş seçenek. Uzman emlak danışmanlığı ile Karasu'da ${roomInfo.label} daireyi bulun.`,
    keywords: [
      `karasu ${roomInfo.label} satılık daire`,
      `karasu ${roomInfo.label} daire`,
      `karasu ${roomInfo.label} satılık daireler`,
      `karasu ${roomInfo.label} daire fiyatları`,
      `karasu ${roomInfo.label} satılık daire ilanları`,
      `sakarya karasu ${roomInfo.label} satılık daire`,
      `karasu merkez ${roomInfo.label} satılık daire`,
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `/karasu-${oda}-satilik-daire`,
        'en': `/en/karasu-${oda}-satilik-daire`,
        'et': `/et/karasu-${oda}-satilik-daire`,
        'ru': `/ru/karasu-${oda}-satilik-daire`,
        'ar': `/ar/karasu-${oda}-satilik-daire`,
      },
    },
    openGraph: {
      title: `Karasu ${roomInfo.label} Satılık Daire | ${roomInfo.label} Daire İlanları 2025`,
      description: `Karasu'da ${roomInfo.label} satılık daire ilanları. ${roomInfo.description} Güncel fiyatlar ve yatırım analizi.`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `Karasu ${roomInfo.label} Satılık Daire - Emlak İlanları`,
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `Karasu ${roomInfo.label} Satılık Daire | ${roomInfo.label} Daire İlanları`,
      description: `Karasu'da ${roomInfo.label} satılık daire ilanları. Güncel fiyatlar ve yatırım analizi.`,
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

export default async function KarasuOdaSatilikDairePage({
  params,
}: {
  params: Promise<{ locale: string; oda: string }>;
}) {
  const { locale, oda } = await params;
  const roomKey = oda.replace('-', '+'); // 1-1 -> 1+1
  
  if (!validRooms.includes(roomKey)) {
    notFound();
  }
  
  const roomInfo = roomLabels[roomKey];
  const roomCount = parseInt(roomKey.split('+')[0]);
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, []);
  const neighborhoods = neighborhoodsResult || [];
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter Karasu listings with specific room count
  const karasuRoomListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')) &&
    listing.property_type === 'daire' &&
    listing.features?.rooms === roomCount
  );
  
  // Group by neighborhood
  const byNeighborhood: Record<string, typeof karasuRoomListings> = {};
  karasuRoomListings.forEach(listing => {
    const neighborhood = listing.location_neighborhood || 'Diğer';
    if (!byNeighborhood[neighborhood]) {
      byNeighborhood[neighborhood] = [];
    }
    byNeighborhood[neighborhood].push(listing);
  });
  
  // Calculate average price
  const prices = karasuRoomListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  
  // Fetch FAQs
  const aiQuestions = await withTimeout(
    getAIQuestionsForPage(`karasu-${roomKey}-satilik-daire`, 'karasu', 'pillar'),
    2000,
    []
  );
  
  const faqs = aiQuestions && aiQuestions.length > 0 ? aiQuestions.map(q => ({
    question: q.question,
    answer: q.answer,
  })) : [
    {
      question: `Karasu'da ${roomInfo.label} satılık daire fiyatları nasıl?`,
      answer: `Karasu'da ${roomInfo.label} satılık daire fiyatları konum, metrekare ve özelliklere göre değişmektedir. Ortalama fiyat aralığı ${roomInfo.priceRange} arasındadır. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. ${avgPrice ? `Mevcut ilanlarımızda ortalama fiyat ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.` : ''}`,
    },
    {
      question: `Karasu'da ${roomInfo.label} satılık daire hangi mahallelerde bulunuyor?`,
      answer: `Karasu'da ${roomInfo.label} satılık daire seçenekleri Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi, Aziziye ve diğer mahallelerde bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.`,
    },
    {
      question: `Karasu'da ${roomInfo.label} satılık daire yatırım için uygun mu?`,
      answer: `Evet, Karasu'da ${roomInfo.label} satılık daire yatırım potansiyeli yüksektir. Özellikle denize yakın konumlar ve merkez mahalleler yatırımcıların ilgisini çekmektedir. İstanbul'a yakınlığı ve turizm potansiyeli ile uzun vadede değer kazanma potansiyeli yüksektir.`,
    },
  ];
  
  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: `Karasu ${roomInfo.label} Satılık Daire | ${roomInfo.label} Daire İlanları 2025`,
      description: `Karasu'da ${roomInfo.label} satılık daire ilanları. ${roomInfo.description} Güncel fiyatlar ve yatırım analizi.`,
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    mainEntity: {
      '@type': 'Question',
      name: `Karasu'da ${roomInfo.label} satılık daire nasıl bulunur?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Karasu'da ${roomInfo.label} satılık daire arayanlar için ${karasuRoomListings.length} adet aktif ilan mevcuttur. Fiyatlar ${roomInfo.priceRange} arasında değişmektedir. ${roomInfo.description} Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.`,
      },
    },
  };
  
  const faqSchema = generateFAQSchema(faqs);
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu Satılık Daire', url: `${siteConfig.url}${basePath}/karasu-satilik-daire` },
      { name: `Karasu ${roomInfo.label} Satılık Daire`, url: `${siteConfig.url}${basePath}/karasu-${oda}-satilik-daire` },
    ],
    `${siteConfig.url}${basePath}/karasu-${oda}-satilik-daire`
  );
  
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });
  
  const itemListSchema = karasuRoomListings.length > 0
    ? generateItemListSchema(karasuRoomListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: `Karasu ${roomInfo.label} Satılık Daire İlanları`,
        description: `Karasu'da ${karasuRoomListings.length} adet ${roomInfo.label} satılık daire ilanı.`,
      })
    : null;
  
  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={realEstateAgentSchema} />
      {itemListSchema && <StructuredData data={itemListSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Satılık Daire', href: `${basePath}/karasu-satilik-daire` },
          { label: `Karasu ${roomInfo.label} Satılık Daire`, href: `${basePath}/karasu-${oda}-satilik-daire` },
        ]}
      />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    {karasuRoomListings.length}+ Aktif {roomInfo.label} Daire İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu {roomInfo.label} Satılık Daire
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da {roomInfo.label} satılık daire arayanlar için kapsamlı rehber. {roomInfo.description} 
                  Güncel fiyatlar {roomInfo.priceRange} arasında. Uzman emlak danışmanlığı ile hayalinizdeki {roomInfo.label} daireyi bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/satilik?propertyType=daire&rooms=${roomCount}`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm {roomInfo.label} Daire İlanlarını Görüntüle
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Link href={`${basePath}/iletisim`}>
                      <Phone className="w-5 h-5 mr-2" />
                      İletişime Geçin
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{karasuRoomListings.length}</div>
                <div className="text-sm text-gray-600">Aktif {roomInfo.label} Daire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Object.keys(byNeighborhood).length}</div>
                <div className="text-sm text-gray-600">Mahalle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {minPrice && maxPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(minPrice / 1000)}K - ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(maxPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Fiyat Aralığı</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Quick Answer */}
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Karasu'da {roomInfo.label} satılık daire</strong> arayanlar için {karasuRoomListings.length} adet aktif ilan mevcuttur. 
                      Fiyatlar {roomInfo.priceRange} arasında değişmektedir. {roomInfo.description} 
                      {avgPrice ? ` Ortalama fiyat ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.` : ''}
                      Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da {roomInfo.label} Satılık Daire Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da {roomInfo.label} satılık daire seçenekleri, {roomInfo.description.toLowerCase()} 
                        Fiyat aralığı {roomInfo.priceRange} arasında değişmektedir.
                      </p>
                      <p>
                        {roomInfo.label} daireler, {roomCount === 1 ? 'tek kişi veya çiftler için ideal olup, yatırım amaçlı da tercih edilmektedir.' : 
                        roomCount === 2 ? 'çiftler ve küçük aileler için en popüler seçenektir.' :
                        roomCount === 3 ? 'aileler için en popüler seçenek olup, geniş yaşam alanı sunmaktadır.' :
                        'geniş aileler için ideal olup, lüks yaşam alanı sunmaktadır.'}
                      </p>
                      <p>
                        Karasu'nun denize yakın konumu, İstanbul'a yakınlığı ve gelişen altyapısı ile {roomInfo.label} daireler hem 
                        sürekli oturum hem de yatırım amaçlı tercih edilmektedir.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Neighborhoods */}
                {Object.keys(byNeighborhood).length > 0 && (
                  <ScrollReveal direction="up" delay={200}>
                    <article>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Mahallelere Göre {roomInfo.label} Satılık Daire Seçenekleri
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {Object.entries(byNeighborhood).slice(0, 8).map(([neighborhood, listings]) => {
                          const neighborhoodSlug = generateSlug(neighborhood);
                          return (
                            <Link
                              key={neighborhood}
                              href={`${basePath}/karasu/${neighborhoodSlug}/satilik-daire`}
                              className="block border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{neighborhood}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {listings.length} {roomInfo.label} satılık daire ilanı
                              </p>
                              <span className="text-sm text-primary font-medium">{neighborhood} {roomInfo.label} daire detayları →</span>
                            </Link>
                          );
                        })}
                      </div>
                    </article>
                  </ScrollReveal>
                )}

                {/* Featured Listings */}
                {karasuRoomListings.length > 0 && (
                  <section className="py-8">
                    <ScrollReveal direction="up" delay={0}>
                      <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                          Öne Çıkan Karasu {roomInfo.label} Satılık Daire İlanları
                        </h2>
                        <p className="text-base text-gray-600">
                          {karasuRoomListings.length} adet {roomInfo.label} satılık daire ilanı
                        </p>
                      </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {karasuRoomListings.slice(0, 6).map((listing, index) => (
                        <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                          <ListingCard listing={listing} basePath={basePath} />
                        </ScrollReveal>
                      ))}
                    </div>
                    {karasuRoomListings.length > 6 && (
                      <div className="text-center mt-8">
                        <Button asChild size="lg">
                          <Link href={`${basePath}/satilik?propertyType=daire&rooms=${roomCount}`}>
                            Tüm {roomInfo.label} Satılık Daire İlanlarını Görüntüle ({karasuRoomListings.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* FAQ Section */}
                {faqs.length > 0 && (
                  <section className="py-8">
                    <ScrollReveal direction="up" delay={0}>
                      <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Sık Sorulan Sorular
                        </h2>
                        <p className="text-base text-gray-600">
                          Karasu {roomInfo.label} satılık daireler hakkında merak edilenler
                        </p>
                      </div>
                    </ScrollReveal>

                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
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
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Hızlı İstatistikler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam {roomInfo.label}</span>
                          <span className="text-lg font-bold text-gray-900">{karasuRoomListings.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ortalama Fiyat</span>
                          <span className="text-lg font-bold text-gray-900">
                            {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fiyat Aralığı</span>
                          <span className="text-lg font-bold text-gray-900">
                            {minPrice && maxPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(minPrice / 1000)}K - ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(maxPrice / 1000)}K` : 'Değişken'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mahalle Sayısı</span>
                          <span className="text-lg font-bold text-gray-900">{Object.keys(byNeighborhood).length}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Emlak Danışmanlığı
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Karasu'da {roomInfo.label} satılık daire arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`${basePath}/iletisim`}>
                          <Phone className="w-4 h-4 mr-2" />
                          İletişime Geçin
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={300}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        İlgili Sayfalar
                      </h3>
                      <div className="space-y-2">
                        <Link href={`${basePath}/karasu-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Daire
                        </Link>
                        {validRooms.filter(r => r !== roomKey).map((otherRoom) => {
                          const otherRoomSlug = otherRoom.replace('+', '-');
                          const otherRoomInfo = roomLabels[otherRoom];
                          return (
                            <Link
                              key={otherRoom}
                              href={`${basePath}/karasu-${otherRoomSlug}-satilik-daire`}
                              className="block text-sm text-primary hover:underline"
                            >
                              Karasu {otherRoomInfo.label} Satılık Daire
                            </Link>
                          );
                        })}
                        <Link href={`${basePath}/satilik?propertyType=daire`} className="block text-sm text-primary hover:underline">
                          Tüm Satılık Daireler
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki {roomInfo.label} Daireyi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da {roomInfo.label} satılık daire arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
                Tüm süreçte yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/satilik?propertyType=daire&rooms=${roomCount}`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm {roomInfo.label} Daire İlanlarını İncele
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
