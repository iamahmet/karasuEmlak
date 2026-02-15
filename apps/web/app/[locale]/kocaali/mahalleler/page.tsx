import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { MapPin, Home, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getNeighborhoodsWithImages, getNeighborhoodImageUrl } from '@/lib/supabase/queries/neighborhoods';
import { getListings } from '@/lib/supabase/queries';
import { CardImage } from '@/components/images';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
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
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali/mahalleler' : `/${locale}/kocaali/mahalleler`;
  
  return {
    title: 'Kocaali Mahalleleri | Mahalle Rehberi ve Satılık Ev İlanları | Karasu Emlak',
    description: 'Kocaali mahalleleri hakkında detaylı bilgi. Her mahallenin özellikleri, fiyat aralıkları, satılık ev seçenekleri ve yatırım potansiyeli. Size en uygun mahalleyi keşfedin.',
    keywords: [
      'kocaali mahalleleri',
      'kocaali mahalle rehberi',
      'kocaali satılık ev mahalleler',
      'kocaali emlak mahalleler',
      'kocaali yatırım mahalleler',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: pruneHreflangLanguages({
        'tr': '/kocaali/mahalleler',
        'en': '/en/kocaali/mahalleler',
        'et': '/et/kocaali/mahalleler',
        'ru': '/ru/kocaali/mahalleler',
        'ar': '/ar/kocaali/mahalleler',
      }),
    },
    openGraph: {
      title: 'Kocaali Mahalleleri | Mahalle Rehberi',
      description: 'Kocaali mahalleleri hakkında detaylı bilgi ve satılık ev seçenekleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const faqs = [
  {
    question: 'Kocaali\'de hangi mahalleler öne çıkıyor?',
    answer: 'Kocaali\'de merkez mahalleler ve sahile yakın bölgeler öne çıkmaktadır. Denize erişimi olan mahalleler yazlık arayanlar için tercih edilirken, merkez bölgeler kalıcı yaşam için daha uygundur. Her mahallenin kendine özgü avantajları vardır.',
  },
  {
    question: 'Kocaali mahallelerinde satılık ev fiyatları nasıl?',
    answer: 'Kocaali mahallelerinde satılık ev fiyatları konum, denize yakınlık ve özelliklere göre değişmektedir. Denize yakın mahalleler genellikle daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır.',
  },
  {
    question: 'Kocaali\'de hangi mahalleler yatırım için uygundur?',
    answer: 'Denize yakın mahalleler ve merkez konumlar yatırım potansiyeli açısından öne çıkar. Özellikle yazlık kiralama potansiyeli yüksek olan bölgeler yatırımcılar için ilgi çekicidir. Gelişmekte olan mahalleler de uzun vadeli yatırım için uygundur.',
  },
];

export default async function KocaaliMahallelerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch neighborhoods (filter for Kocaali)
  const neighborhoodsResult = await withTimeout(getNeighborhoodsWithImages(50), 3000, []);
  const allNeighborhoods = neighborhoodsResult || [];
  
  // Filter Kocaali neighborhoods (by district or city)
  const kocaaliNeighborhoods = allNeighborhoods.filter(n => 
    n.district?.toLowerCase().includes('kocaali') ||
    n.city?.toLowerCase().includes('kocaali') ||
    n.name?.toLowerCase().includes('kocaali')
  );

  // Get listings count for each neighborhood
  const allListingsResult = await withTimeout(
    getListings({}, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Kocaali Mahalleleri | Mahalle Rehberi ve Satılık Ev İlanları',
    description: 'Kocaali mahalleleri hakkında detaylı bilgi. Her mahallenin özellikleri, fiyat aralıkları ve satılık ev seçenekleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Kocaali', url: `${siteConfig.url}${basePath}/kocaali` },
      { name: 'Kocaali Mahalleleri', url: `${siteConfig.url}${basePath}/kocaali/mahalleler` },
    ],
    `${siteConfig.url}${basePath}/kocaali/mahalleler`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Mahalleler' },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <section className="mb-12">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Kocaali Mahalleleri</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Kocaali mahalleleri hakkında detaylı bilgi. Her mahallenin özellikleri, satılık ev seçenekleri ve yatırım potansiyeli.
            </p>
          </ScrollReveal>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
              <div className="flex flex-wrap gap-3">
                <Link href={`${basePath}/kocaali-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Kocaali Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`}>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Yatırımlık Gayrimenkul
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali-satilik-ev-fiyatlari`}>
                  <Button variant="outline" size="sm">
                    Fiyat Analizi
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    Karasu Satılık Ev
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Neighborhoods Grid */}
        {kocaaliNeighborhoods.length > 0 ? (
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {kocaaliNeighborhoods.map((neighborhood, index) => {
                const imageUrl = getNeighborhoodImageUrl(neighborhood);
                const neighborhoodListings = allListings.filter(l => 
                  l.location_neighborhood && neighborhood.name && generateSlug(l.location_neighborhood) === generateSlug(neighborhood.name)
                );
                const listingCount = neighborhoodListings.length;
                const isPopular = index < 6;
                
                return (
                  <ScrollReveal key={neighborhood.id || neighborhood.name} direction="up" delay={index * 50}>
                    <Link href={`${basePath}/mahalle/${neighborhood.slug || generateSlug(neighborhood.name)}?status=satilik`}>
                      <div className="group bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300">
                        <div className="relative h-40 bg-gray-200 overflow-hidden">
                          <CardImage
                            publicId={imageUrl}
                            alt={neighborhood.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          {isPopular && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                Popüler
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-bold text-base drop-shadow-lg mb-1">
                              {neighborhood.name}
                            </h3>
                            <p className="text-white/90 text-xs">
                              {neighborhood.description || `Kocaali ${neighborhood.name} Mahallesi`}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 font-medium">{listingCount} ilan</span>
                            <span className="text-xs text-primary font-semibold">İncele →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Kocaali mahalleleri için detaylı bilgi hazırlanıyor.
              </p>
              <Link href={`${basePath}/kocaali-satilik-ev`}>
                <Button variant="outline">
                  Kocaali Satılık Ev Rehberi
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-base text-gray-600">
                  Kocaali mahalleleri hakkında merak edilenler
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
        <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Kocaali'de Hayalinizdeki Mahalleyi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali mahallelerinde satılık ev arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/kocaali-satilik-ev`}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Home className="w-5 h-5 mr-2" />
                    Kocaali Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    İletişime Geçin
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
