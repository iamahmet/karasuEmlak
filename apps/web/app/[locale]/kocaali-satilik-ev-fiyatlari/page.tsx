import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { DollarSign, TrendingUp, MapPin, Building2, Info, ArrowRight, Phone, Home } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali-satilik-ev-fiyatlari' : `/${locale}/kocaali-satilik-ev-fiyatlari`;
  
  return {
    title: 'Kocaali Satılık Ev Fiyatları 2025 | Güncel Fiyat Analizi | Karasu Emlak',
    description: 'Kocaali\'de satılık ev fiyatları hakkında kapsamlı analiz. Mahalle bazlı fiyat aralıkları, ev tipine göre fiyatlar ve yatırım tavsiyeleri. Karasu\'ya göre daha uygun fiyatlı seçenekler.',
    keywords: [
      'kocaali satılık ev fiyatları',
      'kocaali ev fiyatları',
      'kocaali emlak fiyatları',
      'kocaali satılık ev fiyat analizi',
      'kocaali mahalle fiyatları',
      'kocaali yatırım fiyatları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/kocaali-satilik-ev-fiyatlari',
        'en': '/en/kocaali-satilik-ev-fiyatlari',
        'et': '/et/kocaali-satilik-ev-fiyatlari',
        'ru': '/ru/kocaali-satilik-ev-fiyatlari',
        'ar': '/ar/kocaali-satilik-ev-fiyatlari',
      }),
    },
    openGraph: {
      title: 'Kocaali Satılık Ev Fiyatları | Güncel Analiz',
      description: 'Kocaali\'de satılık ev fiyatları hakkında kapsamlı analiz ve güncel piyasa bilgileri. Karasu\'ya göre daha uygun fiyatlı seçenekler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kocaali Satılık Ev Fiyatları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kocaali Satılık Ev Fiyatları',
      description: 'Kocaali\'de satılık ev fiyatları hakkında kapsamlı analiz.',
    },
  };
}

const faqs = [
  {
    question: 'Kocaali\'de satılık ev fiyatları ne kadar?',
    answer: 'Kocaali\'de satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Genel olarak 400.000 TL ile 2.500.000 TL arasında değişen fiyat aralıkları görülmektedir. Karasu\'ya göre genellikle daha uygun fiyatlı seçenekler sunar.',
  },
  {
    question: 'Kocaali\'de hangi mahallelerde daha uygun fiyatlı evler var?',
    answer: 'Kocaali\'de merkeze biraz uzak mahallelerde ve yeni gelişen bölgelerde daha uygun fiyatlı seçenekler bulunmaktadır. Ancak fiyat, konum ve özellikler arasında denge kurmak önemlidir. Güncel fiyat bilgisi için ilanlarımıza göz atabilirsiniz.',
  },
  {
    question: 'Kocaali\'de ev fiyatları Karasu\'dan neden daha uygun?',
    answer: 'Kocaali, Karasu\'ya göre daha az gelişmiş altyapı ve daha düşük turizm potansiyeline sahiptir. Bu nedenle fiyatlar genellikle daha uygun seviyededir. Ancak gelişmekte olan bölge olduğu için yatırım potansiyeli vardır.',
  },
  {
    question: 'Kocaali\'de ev alırken fiyat pazarlığı yapılabilir mi?',
    answer: 'Evet, Kocaali\'de ev alırken fiyat pazarlığı yapılabilir. Özellikle piyasa koşullarına göre esneklik olabilir. Emlak danışmanınız size bu konuda yardımcı olacaktır.',
  },
  {
    question: 'Kocaali\'de ev fiyatları gelecekte artacak mı?',
    answer: 'Gelişmekte olan bölge olduğu için uzun vadede fiyat artışı beklentisi vardır. Özellikle altyapı yatırımları ve yeni projeler bölgenin değerini artırabilir. Ancak piyasa koşulları değişkendir.',
  },
];

export default async function KocaaliSatilikEvFiyatlariPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data with timeout
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter Kocaali listings
  const kocaaliListings = allListings.filter(listing => 
    listing.location_city?.toLowerCase().includes('kocaali') ||
    listing.location_neighborhood?.toLowerCase().includes('kocaali') ||
    listing.location_district?.toLowerCase().includes('kocaali')
  );

  // Calculate price statistics
  const prices = kocaaliListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  // Group by property type for price analysis
  const pricesByType = {
    ev: kocaaliListings.filter(l => l.property_type === 'ev' && l.price_amount && l.price_amount > 0).map(l => l.price_amount!),
    daire: kocaaliListings.filter(l => l.property_type === 'daire' && l.price_amount && l.price_amount > 0).map(l => l.price_amount!),
    villa: kocaaliListings.filter(l => l.property_type === 'villa' && l.price_amount && l.price_amount > 0).map(l => l.price_amount!),
    yazlik: kocaaliListings.filter(l => l.property_type === 'yazlik' && l.price_amount && l.price_amount > 0).map(l => l.price_amount!),
  };

  const avgPriceByType = {
    ev: pricesByType.ev.length > 0 ? Math.round(pricesByType.ev.reduce((a, b) => a + b, 0) / pricesByType.ev.length) : null,
    daire: pricesByType.daire.length > 0 ? Math.round(pricesByType.daire.reduce((a, b) => a + b, 0) / pricesByType.daire.length) : null,
    villa: pricesByType.villa.length > 0 ? Math.round(pricesByType.villa.reduce((a, b) => a + b, 0) / pricesByType.villa.length) : null,
    yazlik: pricesByType.yazlik.length > 0 ? Math.round(pricesByType.yazlik.reduce((a, b) => a + b, 0) / pricesByType.yazlik.length) : null,
  };

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Kocaali Satılık Ev Fiyatları 2025 | Güncel Fiyat Analizi',
    description: 'Kocaali\'de satılık ev fiyatları hakkında kapsamlı analiz. Mahalle bazlı fiyat aralıkları, ev tipine göre fiyatlar ve yatırım tavsiyeleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Kocaali Satılık Ev', url: `${siteConfig.url}${basePath}/kocaali-satilik-ev` },
      { name: 'Kocaali Satılık Ev Fiyatları', url: `${siteConfig.url}${basePath}/kocaali-satilik-ev-fiyatlari` },
    ],
    `${siteConfig.url}${basePath}/kocaali-satilik-ev-fiyatlari`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Kocaali Satılık Ev', href: `${basePath}/kocaali-satilik-ev` },
          { label: 'Fiyatlar', href: `${basePath}/kocaali-satilik-ev-fiyatlari` },
        ]}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]`" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    Güncel Fiyat Analizi
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Kocaali Satılık Ev Fiyatları
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Kocaali'de satılık ev fiyatları hakkında kapsamlı analiz. Mahalle bazlı fiyat aralıkları, 
                  ev tipine göre fiyatlar ve yatırım tavsiyeleri. <strong>Karasu'ya göre daha uygun fiyatlı seçenekler.</strong>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Price Overview Stats */}
        <section className="py-8 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {avgPrice && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">Ortalama Fiyat</div>
                </div>
              )}
              {minPrice && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(minPrice / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">En Düşük</div>
                </div>
              )}
              {maxPrice && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(maxPrice / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">En Yüksek</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{kocaaliListings.length}</div>
                <div className="text-sm text-gray-600">Aktif İlan</div>
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
                {/* Introduction */}
                <ScrollReveal direction="up" delay={0}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Kocaali Satılık Ev Fiyatları: Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Kocaali'de satılık ev fiyatları, konum, metrekare, oda sayısı, bina yaşı, özellikler ve 
                        piyasa koşullarına göre değişmektedir. <strong>Karasu'ya göre genellikle daha uygun fiyatlı seçenekler</strong> sunar.
                      </p>
                      <p>
                        Bu sayfa, Kocaali'de satılık ev fiyatları hakkında güncel bilgiler, fiyat aralıkları ve 
                        yatırım tavsiyeleri sunmaktadır. Fiyatlar değişken olduğundan, güncel bilgi için ilanlarımıza 
                        göz atmanız veya bizimle iletişime geçmeniz önerilir.
                      </p>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                        <p className="text-sm text-gray-700">
                          <strong>Önemli Not:</strong> Bu sayfadaki fiyat bilgileri genel bir rehber niteliğindedir. 
                          Güncel ve kesin fiyat bilgisi için ilanlarımıza göz atabilir veya emlak danışmanlarımızla iletişime geçebilirsiniz.
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Comparison with Karasu */}
                <ScrollReveal direction="up" delay={100}>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Kocaali vs Karasu: Fiyat Karşılaştırması
                    </h2>
                    <p className="text-gray-700 mb-6">
                      Kocaali, Karasu'ya göre genellikle daha uygun fiyatlı seçenekler sunar. Bu, daha az gelişmiş 
                      altyapı ve daha düşük turizm potansiyeli nedeniyle olabilir. Ancak gelişmekte olan bölge olduğu 
                      için yatırım potansiyeli vardır.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Kocaali</h3>
                        <div className="text-2xl font-bold text-green-700 mb-2">
                          ₺400K - ₺2.5M
                        </div>
                        <p className="text-sm text-gray-700">
                          Daha uygun giriş fiyatları, sakin yaşam, gelişmekte olan bölge.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Karasu</h3>
                        <div className="text-2xl font-bold text-blue-700 mb-2">
                          ₺500K - ₺3M
                        </div>
                        <p className="text-sm text-gray-700">
                          Daha gelişmiş altyapı, yüksek turizm potansiyeli, merkez konum.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                        <Button variant="outline" size="sm">
                          Karasu Fiyat Analizi
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href={`${basePath}/kocaali-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Kocaali Satılık Ev
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Price by Property Type */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Ev Tipine Göre Fiyat Aralıkları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Kocaali'de satılık ev fiyatları, ev tipine göre önemli farklılıklar göstermektedir. 
                        Her ev tipinin kendine özgü fiyat aralığı vardır.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {avgPriceByType.ev && (
                          <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                              <Building2 className="h-6 w-6 text-primary" />
                              <h3 className="text-xl font-semibold text-gray-900">Müstakil Evler</h3>
                            </div>
                            <div className="text-2xl font-bold text-primary mb-2">
                              ₺{new Intl.NumberFormat('tr-TR').format(avgPriceByType.ev)}
                            </div>
                            <p className="text-sm text-gray-600">Ortalama fiyat</p>
                            <p className="text-sm text-gray-700 mt-3">
                              Bahçeli müstakil evler genellikle daha yüksek fiyatlara sahiptir. Konum ve özelliklere göre 
                              fiyatlar değişmektedir.
                            </p>
                          </div>
                        )}

                        {avgPriceByType.daire && (
                          <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                              <Building2 className="h-6 w-6 text-primary" />
                              <h3 className="text-xl font-semibold text-gray-900">Apartman Daireleri</h3>
                            </div>
                            <div className="text-2xl font-bold text-primary mb-2">
                              ₺{new Intl.NumberFormat('tr-TR').format(avgPriceByType.daire)}
                            </div>
                            <p className="text-sm text-gray-600">Ortalama fiyat</p>
                            <p className="text-sm text-gray-700 mt-3">
                              Modern apartman daireleri, konum ve özelliklere göre farklı fiyat aralıklarında bulunmaktadır.
                            </p>
                          </div>
                        )}

                        {avgPriceByType.villa && (
                          <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                              <Building2 className="h-6 w-6 text-primary" />
                              <h3 className="text-xl font-semibold text-gray-900">Villalar</h3>
                            </div>
                            <div className="text-2xl font-bold text-primary mb-2">
                              ₺{new Intl.NumberFormat('tr-TR').format(avgPriceByType.villa)}
                            </div>
                            <p className="text-sm text-gray-600">Ortalama fiyat</p>
                            <p className="text-sm text-gray-700 mt-3">
                              Lüks villalar, deniz manzarası ve özel özellikler nedeniyle daha yüksek fiyat aralığında yer alır.
                            </p>
                          </div>
                        )}

                        {avgPriceByType.yazlik && (
                          <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center gap-3 mb-3">
                              <Building2 className="h-6 w-6 text-primary" />
                              <h3 className="text-xl font-semibold text-gray-900">Yazlık Evler</h3>
                            </div>
                            <div className="text-2xl font-bold text-primary mb-2">
                              ₺{new Intl.NumberFormat('tr-TR').format(avgPriceByType.yazlik)}
                            </div>
                            <p className="text-sm text-gray-600">Ortalama fiyat</p>
                            <p className="text-sm text-gray-700 mt-3">
                              Yazlık evler, denize yakınlık ve yatırım potansiyeli nedeniyle popülerdir. Fiyatlar konuma göre değişir.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Price Factors */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Fiyatı Etkileyen Faktörler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Kocaali'de satılık ev fiyatlarını etkileyen birçok faktör vardır. Bu faktörleri anlamak, 
                        doğru karar vermenize yardımcı olacaktır.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Konum ve Denize Yakınlık
                          </h3>
                          <p>
                            Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. 
                            Özellikle denize sıfır veya deniz manzaralı evler, yatırımcılar için cazip olduğundan 
                            fiyatları daha yüksektir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Ev Özellikleri
                          </h3>
                          <p>
                            Metrekare, oda sayısı, bina yaşı, asansör, otopark, balkon, deniz manzarası gibi özellikler 
                            fiyatı etkileyen önemli faktörlerdir. Daha fazla özellik genellikle daha yüksek fiyat anlamına gelir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Piyasa Koşulları
                          </h3>
                          <p>
                            Genel ekonomik koşullar, faiz oranları, bölgesel gelişmeler ve talep-arz dengesi fiyatları 
                            etkileyebilir. Piyasa koşulları değişken olduğundan güncel bilgi önemlidir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Price Ranges */}
                <ScrollReveal direction="up" delay={600}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Fiyat Aralıkları ve Bütçe Planlaması
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Kocaali'de satılık ev fiyatları geniş bir aralıkta değişmektedir. Bütçenize uygun seçenekler 
                        bulmak için fiyat aralıklarını anlamak önemlidir.
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="border rounded-lg p-6 bg-green-50 border-green-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ekonomik Seçenekler</h3>
                          <p className="text-2xl font-bold text-green-700 mb-2">₺400K - ₺800K</p>
                          <p className="text-sm text-gray-700">
                            Bu aralıkta genellikle küçük daireler, eski binalar veya merkeze uzak konumlar bulunmaktadır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Orta Segment</h3>
                          <p className="text-2xl font-bold text-blue-700 mb-2">₺800K - ₺1.5M</p>
                          <p className="text-sm text-gray-700">
                            Modern daireler, müstakil evler ve denize yakın konumlar bu aralıkta yer alır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-purple-50 border-purple-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Segment</h3>
                          <p className="text-2xl font-bold text-purple-700 mb-2">₺1.5M+</p>
                          <p className="text-sm text-gray-700">
                            Lüks villalar, denize sıfır konumlar ve özel özellikli evler bu aralıkta bulunmaktadır.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment Perspective */}
                <ScrollReveal direction="up" delay={800}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Yatırım Açısından Fiyat Değerlendirmesi
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Kocaali'de satılık ev alırken sadece fiyat değil, yatırım potansiyeli de değerlendirilmelidir. 
                        Uzun vadeli değer artışı ve kiralama geliri potansiyeli göz önünde bulundurulmalıdır.
                      </p>
                      <p>
                        Denize yakın konumlar, turizm potansiyeli yüksek bölgeler ve gelişen projeler yakınındaki evler, 
                        yatırım açısından daha değerli olabilir. Ancak fiyat-yatırım dengesi önemlidir.
                      </p>
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                        <p className="text-sm text-gray-700">
                          <strong>Yatırım Tavsiyesi:</strong> Fiyat analizi yaparken sadece satın alma fiyatına değil, 
                          gelecekteki değer artışı, kiralama potansiyeli ve bakım maliyetlerine de bakmanız önerilir.
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Link to Pillar */}
                <ScrollReveal direction="up" delay={1000}>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Daha Fazla Bilgi
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Kocaali'de satılık ev hakkında daha kapsamlı bilgi için{' '}
                      <Link href={`${basePath}/kocaali-satilik-ev`} className="text-primary hover:underline font-medium">
                        Kocaali Satılık Ev
                      </Link>{' '}
                      rehberimize göz atabilirsiniz.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`${basePath}/kocaali-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Kapsamlı Rehber
                        </Button>
                      </Link>
                      <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`}>
                        <Button variant="outline" size="sm">
                          Yatırımlık Gayrimenkul
                        </Button>
                      </Link>
                      <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                        <Button variant="outline" size="sm">
                          Karasu Fiyat Analizi
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Fiyat Özeti
                      </h3>
                      <div className="space-y-3">
                        {avgPrice && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ortalama</span>
                            <span className="text-lg font-bold text-gray-900">
                              ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K
                            </span>
                          </div>
                        )}
                        {minPrice && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">En Düşük</span>
                            <span className="text-lg font-bold text-gray-900">
                              ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(minPrice / 1000)}K
                            </span>
                          </div>
                        )}
                        {maxPrice && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">En Yüksek</span>
                            <span className="text-lg font-bold text-gray-900">
                              ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(maxPrice / 1000)}K
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Aktif İlan</span>
                          <span className="text-lg font-bold text-gray-900">{kocaaliListings.length}</span>
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
                        Kocaali'de satılık ev fiyatları hakkında detaylı bilgi için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
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
                        <Link href={`${basePath}/kocaali-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Kocaali Satılık Ev
                        </Link>
                        <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`} className="block text-sm text-primary hover:underline">
                          Yatırımlık Gayrimenkul
                        </Link>
                        <Link href={`${basePath}/kocaali-emlak-rehberi`} className="block text-sm text-primary hover:underline">
                          Kocaali Emlak Rehberi
                        </Link>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`} className="block text-sm text-primary hover:underline font-medium">
                            Karasu Fiyat Analizi →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-base text-gray-600">
                  Kocaali satılık ev fiyatları hakkında merak edilenler
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Kocaali'de Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali'de satılık ev arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/kocaali-satilik-ev`}>
                    <Home className="w-5 h-5 mr-2" />
                    Kocaali Satılık Ev
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
