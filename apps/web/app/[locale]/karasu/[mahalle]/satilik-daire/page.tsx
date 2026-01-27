import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, MapPin, TrendingUp, Building2, CheckCircle2, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { getNeighborhoodWithImage } from '@/lib/supabase/queries/neighborhoods';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
import dynamicImport from 'next/dynamic';

export const revalidate = 3600; // 1 hour

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateStaticParams() {
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 2000, []);
  const neighborhoods = neighborhoodsResult || [];
  
  // Filter Karasu neighborhoods
  const karasuNeighborhoods = neighborhoods.filter(n => 
    n.toLowerCase().includes('karasu') || 
    !n.toLowerCase().includes('kocaali')
  );
  
  const params: Array<{ locale: string; mahalle: string }> = [];
  for (const locale of routing.locales) {
    for (const neighborhood of karasuNeighborhoods) {
      params.push({
        locale,
        mahalle: generateSlug(neighborhood),
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mahalle: string }>;
}): Promise<Metadata> {
  const { locale, mahalle } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get neighborhood data
  const neighborhoodData = await withTimeout(getNeighborhoodWithImage(mahalle), 2000, null);
  const neighborhoodName = neighborhoodData?.name || mahalle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const canonicalPath = locale === routing.defaultLocale 
    ? `/karasu/${mahalle}/satilik-daire` 
    : `/${locale}/karasu/${mahalle}/satilik-daire`;
  
  return {
    title: `${neighborhoodName} Satılık Daire | Karasu ${neighborhoodName} Daire İlanları 2025 | Karasu Emlak`,
    description: `${neighborhoodName}'de satılık daire ilanları. Karasu ${neighborhoodName} mahallesinde güncel daire fiyatları, özellikler ve yatırım analizi. Denize yakın konumlarda 1+1'den 4+1'e kadar seçenek. Uzman emlak danışmanlığı ile ${neighborhoodName}'de hayalinizdeki daireyi bulun.`,
    keywords: [
      `${neighborhoodName} satılık daire`,
      `karasu ${neighborhoodName} satılık daire`,
      `${neighborhoodName} satılık daireler`,
      `karasu ${neighborhoodName} daire fiyatları`,
      `${neighborhoodName} emlak`,
      `karasu ${neighborhoodName} satılık daire ilanları`,
      `sakarya ${neighborhoodName} satılık daire`,
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `/karasu/${mahalle}/satilik-daire`,
        'en': `/en/karasu/${mahalle}/satilik-daire`,
        'et': `/et/karasu/${mahalle}/satilik-daire`,
        'ru': `/ru/karasu/${mahalle}/satilik-daire`,
        'ar': `/ar/karasu/${mahalle}/satilik-daire`,
      },
    },
    openGraph: {
      title: `${neighborhoodName} Satılık Daire | Karasu ${neighborhoodName} Daire İlanları 2025`,
      description: `${neighborhoodName}'de satılık daire ilanları. Güncel fiyatlar ve yatırım analizi.`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: neighborhoodData?.image_public_id || `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${neighborhoodName} Satılık Daire - Karasu Emlak`,
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${neighborhoodName} Satılık Daire | Karasu ${neighborhoodName}`,
      description: `${neighborhoodName}'de satılık daire ilanları. Güncel fiyatlar ve yatırım analizi.`,
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

export default async function KarasuMahalleSatilikDairePage({
  params,
}: {
  params: Promise<{ locale: string; mahalle: string }>;
}) {
  const { locale, mahalle } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get neighborhood data
  const neighborhoodData = await withTimeout(getNeighborhoodWithImage(mahalle), 3000, null);
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, []);
  const neighborhoods = neighborhoodsResult || [];
  
  // Find neighborhood name
  let neighborhoodName: string | null = null;
  if (neighborhoodData) {
    neighborhoodName = neighborhoodData.name;
  } else {
    neighborhoodName = neighborhoods.find(n => generateSlug(n) === mahalle) || null;
  }
  
  if (!neighborhoodName) {
    notFound();
  }
  
  // Fetch listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter by neighborhood
  const neighborhoodListings = allListings.filter(listing => 
    (listing.location_neighborhood && generateSlug(listing.location_neighborhood) === mahalle) &&
    listing.property_type === 'daire'
  );
  
  // Group by room count
  const byRooms = {
    '1+1': neighborhoodListings.filter(l => l.features?.rooms === 1),
    '2+1': neighborhoodListings.filter(l => l.features?.rooms === 2),
    '3+1': neighborhoodListings.filter(l => l.features?.rooms === 3),
    '4+1': neighborhoodListings.filter(l => l.features?.rooms === 4),
  };
  
  // Calculate average price
  const prices = neighborhoodListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  
  // Fetch FAQs
  const aiQuestions = await withTimeout(
    getAIQuestionsForPage(`karasu-${mahalle}-satilik-daire`, 'karasu', 'pillar'),
    2000,
    []
  );
  
  const faqs = aiQuestions && aiQuestions.length > 0 ? aiQuestions.map(q => ({
    question: q.question,
    answer: q.answer,
  })) : [
    {
      question: `${neighborhoodName}'de satılık daire fiyatları nasıl?`,
      answer: `${neighborhoodName}'de satılık daire fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Ortalama fiyat aralığı ${avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : '800K-2.5M TL'} arasında değişmektedir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.`,
    },
    {
      question: `${neighborhoodName}'de hangi oda sayılarında satılık daire bulunuyor?`,
      answer: `${neighborhoodName}'de ${neighborhoodListings.length > 0 ? '1+1, 2+1, 3+1 ve 4+1' : 'çeşitli oda sayılarında'} satılık daire seçenekleri bulunmaktadır. En popüler seçenekler genellikle 2+1 ve 3+1 dairelerdir.`,
    },
  ];
  
  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: `${neighborhoodName} Satılık Daire | Karasu ${neighborhoodName} Daire İlanları 2025`,
      description: `${neighborhoodName}'de satılık daire ilanları. Güncel fiyatlar, özellikler ve yatırım analizi.`,
      image: [neighborhoodData?.image_public_id || `${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    mainEntity: {
      '@type': 'Question',
      name: `${neighborhoodName}'de satılık daire nasıl bulunur?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${neighborhoodName}'de satılık daire arayanlar için ${neighborhoodListings.length} adet aktif ilan mevcuttur. Fiyatlar konum, metrekare ve özelliklere göre değişmektedir. Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.`,
      },
    },
  };
  
  const faqSchema = generateFAQSchema(faqs);
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu', url: `${siteConfig.url}${basePath}/karasu` },
      { name: neighborhoodName, url: `${siteConfig.url}${basePath}/mahalle/${mahalle}` },
      { name: `${neighborhoodName} Satılık Daire`, url: `${siteConfig.url}${basePath}/karasu/${mahalle}/satilik-daire` },
    ],
    `${siteConfig.url}${basePath}/karasu/${mahalle}/satilik-daire`
  );
  
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });
  
  const itemListSchema = neighborhoodListings.length > 0
    ? generateItemListSchema(neighborhoodListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: `${neighborhoodName} Satılık Daire İlanları`,
        description: `${neighborhoodName}'de ${neighborhoodListings.length} adet satılık daire ilanı.`,
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
          { label: 'Karasu', href: `${basePath}/karasu` },
          { label: neighborhoodName, href: `${basePath}/mahalle/${mahalle}` },
          { label: `${neighborhoodName} Satılık Daire`, href: `${basePath}/karasu/${mahalle}/satilik-daire` },
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
                    {neighborhoodListings.length}+ Aktif Daire İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {neighborhoodName} Satılık Daire
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  {neighborhoodName}'de satılık daire arayanlar için kapsamlı rehber. Güncel fiyatlar, özellikler ve yatırım analizi. 
                  Uzman emlak danışmanlığı ile {neighborhoodName}'de hayalinizdeki daireyi bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/satilik?propertyType=daire&location_neighborhood=${neighborhoodName}`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm Daire İlanlarını Görüntüle
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
                <div className="text-2xl font-bold text-primary">{neighborhoodListings.length}</div>
                <div className="text-sm text-gray-600">Aktif Daire İlanı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {byRooms['2+1'].length + byRooms['3+1'].length}
                </div>
                <div className="text-sm text-gray-600">2+1 & 3+1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Danışmanlık</div>
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
                      <strong>{neighborhoodName}'de satılık daire</strong> arayanlar için {neighborhoodListings.length} adet aktif ilan mevcuttur. 
                      Fiyatlar konum, metrekare ve özelliklere göre değişmektedir. 
                      {avgPrice ? ` Ortalama fiyat ₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K civarındadır.` : ' Fiyat aralığı geniştir.'}
                      Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      {neighborhoodName}'de Satılık Daire Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        {neighborhoodName}, Karasu'nun önemli mahallelerinden biri olup, satılık daire piyasasında çeşitli seçenekler sunmaktadır. 
                        {neighborhoodData?.seo_content?.intro || `${neighborhoodName} mahallesi, modern apartman projeleri ve gelişen altyapısı ile dikkat çekmektedir.`}
                      </p>
                      <p>
                        {neighborhoodName}'de satılık daire arayanlar için hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır. 
                        Özellikle İstanbul'a yakınlığı, doğal güzellikleri ve turizm potansiyeli ile {neighborhoodName}, emlak yatırımcılarının ilgisini çeken bir bölgedir.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Room Count Options */}
                {neighborhoodListings.length > 0 && (
                  <ScrollReveal direction="up" delay={200}>
                    <article>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Oda Sayısına Göre {neighborhoodName} Satılık Daire Seçenekleri
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {Object.entries(byRooms).map(([roomType, listings]) => {
                          if (listings.length === 0) return null;
                          const avgRoomPrice = listings
                            .filter(l => l.price_amount && l.price_amount > 0)
                            .map(l => l.price_amount!);
                          const avgPriceRoom = avgRoomPrice.length > 0
                            ? Math.round(avgRoomPrice.reduce((a, b) => a + b, 0) / avgRoomPrice.length)
                            : null;
                          
                          return (
                            <div key={roomType} className="border rounded-lg p-6 bg-gray-50">
                              <h3 className="text-xl font-semibold text-gray-900 mb-3">{roomType} Daireler</h3>
                              <p className="text-gray-700 mb-3">
                                {listings.length} adet {roomType} daire seçeneği mevcuttur.
                              </p>
                              {avgPriceRoom && (
                                <div className="text-sm text-gray-600 mb-3">
                                  <strong>Ortalama Fiyat:</strong> ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPriceRoom / 1000)}K
                                </div>
                              )}
                              <Link href={`${basePath}/satilik?propertyType=daire&rooms=${roomType.split('+')[0]}&location_neighborhood=${neighborhoodName}`}>
                                <Button variant="outline" size="sm" className="w-full mt-4">
                                  {roomType} Daire Ara
                                </Button>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  </ScrollReveal>
                )}

                {/* Featured Listings */}
                {neighborhoodListings.length > 0 && (
                  <section className="py-8">
                    <ScrollReveal direction="up" delay={0}>
                      <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                          {neighborhoodName}'de Öne Çıkan Satılık Daire İlanları
                        </h2>
                        <p className="text-base text-gray-600">
                          {neighborhoodListings.length} adet satılık daire ilanı
                        </p>
                      </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {neighborhoodListings.slice(0, 6).map((listing, index) => (
                        <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                          <ListingCard listing={listing} basePath={basePath} />
                        </ScrollReveal>
                      ))}
                    </div>
                    {neighborhoodListings.length > 6 && (
                      <div className="text-center mt-8">
                        <Button asChild size="lg">
                          <Link href={`${basePath}/satilik?propertyType=daire&location_neighborhood=${neighborhoodName}`}>
                            Tüm {neighborhoodName} Satılık Daire İlanlarını Görüntüle ({neighborhoodListings.length})
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
                          {neighborhoodName} satılık daireler hakkında merak edilenler
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
                          <span className="text-sm text-gray-600">Toplam Daire</span>
                          <span className="text-lg font-bold text-gray-900">{neighborhoodListings.length}</span>
                        </div>
                        {Object.entries(byRooms).map(([roomType, listings]) => (
                          listings.length > 0 && (
                            <div key={roomType} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{roomType} Daire</span>
                              <span className="text-lg font-bold text-gray-900">{listings.length}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Emlak Danışmanlığı
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        {neighborhoodName}'de satılık daire arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
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
                        <Link href={`${basePath}/mahalle/${mahalle}`} className="block text-sm text-primary hover:underline">
                          {neighborhoodName} Mahalle Rehberi
                        </Link>
                        <Link href={`${basePath}/karasu`} className="block text-sm text-primary hover:underline">
                          Karasu Emlak Rehberi
                        </Link>
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
                {neighborhoodName}'de Hayalinizdeki Daireyi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, {neighborhoodName}'de satılık daire arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
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
                  <Link href={`${basePath}/satilik?propertyType=daire&location_neighborhood=${neighborhoodName}`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm Daire İlanlarını İncele
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
