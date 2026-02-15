import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, Award, Home, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
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

// Performance: Revalidate every hour for ISR
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali-yatirimlik-gayrimenkul' : `/${locale}/kocaali-yatirimlik-gayrimenkul`;
  
  return {
    title: 'Kocaali Yatırımlık Gayrimenkul | Yatırım Fırsatları ve Rehber | Karasu Emlak',
    description: 'Kocaali\'de yatırımlık gayrimenkul fırsatları. Yatırım potansiyeli yüksek bölgeler, fiyat trendleri ve uzman tavsiyeleri. Karasu\'ya göre daha uygun fiyatlı seçenekler.',
    keywords: [
      'kocaali yatırımlık gayrimenkul',
      'kocaali yatırım fırsatları',
      'kocaali emlak yatırım',
      'kocaali yatırım potansiyeli',
      'kocaali yatırımlık daire',
      'kocaali yatırımlık villa',
      'sakarya yatırım gayrimenkul',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: pruneHreflangLanguages({
        'tr': '/kocaali-yatirimlik-gayrimenkul',
        'en': '/en/kocaali-yatirimlik-gayrimenkul',
        'et': '/et/kocaali-yatirimlik-gayrimenkul',
        'ru': '/ru/kocaali-yatirimlik-gayrimenkul',
        'ar': '/ar/kocaali-yatirimlik-gayrimenkul',
      }),
    },
    openGraph: {
      title: 'Kocaali Yatırımlık Gayrimenkul | Yatırım Fırsatları | Karasu Emlak',
      description: 'Kocaali\'de yatırımlık gayrimenkul fırsatları ve uzman tavsiyeleri. Karasu\'ya göre daha uygun fiyatlı seçenekler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kocaali Yatırımlık Gayrimenkul',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kocaali Yatırımlık Gayrimenkul',
      description: 'Kocaali\'de yatırımlık gayrimenkul fırsatları ve uzman tavsiyeleri.',
    },
  };
}

const investmentFAQs = [
  {
    question: 'Kocaali\'de gayrimenkul yatırımı yapmak mantıklı mı?',
    answer: 'Evet, Kocaali\'de gayrimenkul yatırımı yapmak mantıklıdır. Daha uygun giriş fiyatları, sakin yaşam, doğal güzellikler ve yatırım potansiyeli sunar. Karasu\'ya göre daha uygun fiyatlı seçenekler ile yatırım yapılabilir.',
  },
  {
    question: 'Kocaali\'de hangi bölgeler yatırım için daha uygundur?',
    answer: 'Denize yakın bölgeler ve merkez konumlar yatırım potansiyeli açısından öne çıkmaktadır. Gelişmekte olan mahalleler de uzun vadeli yatırım için uygundur. Her bölgenin kendine özgü avantajları vardır.',
  },
  {
    question: 'Kocaali\'de gayrimenkul fiyatları ne durumda?',
    answer: 'Kocaali\'de gayrimenkul fiyatları Karasu\'ya göre genellikle daha uygun seviyededir. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır. Fiyatlar konum, metrekare ve özelliklere göre değişmektedir.',
  },
  {
    question: 'Kocaali\'de yatırım için hangi gayrimenkul türleri tercih edilmeli?',
    answer: 'Yazlık daireler, villalar ve müstakil evler yatırım için tercih edilebilir. Özellikle denize yakın konumlar hem tatil amaçlı kullanım hem de yatırım getirisi açısından avantajlıdır.',
  },
  {
    question: 'Kocaali mi Karasu mu yatırım için daha avantajlı?',
    answer: 'Her iki bölge de kendine özgü avantajlar sunar. Kocaali daha uygun giriş fiyatları ve sakin yaşam sunarken, Karasu daha gelişmiş altyapı ve yüksek turizm potansiyeline sahiptir. Yatırım tercihi bütçe ve hedeflere göre değişir.',
  },
];

export default async function KocaaliYatirimlikGayrimenkulPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  let locale: string;
  try {
    const paramsResult = await params;
    locale = paramsResult.locale;
  } catch (error) {
    console.error('Error getting params:', error);
    locale = routing.defaultLocale;
  }
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get all sale listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];
  
  // Filter Kocaali listings
  const kocaaliListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('kocaali') ||
    listing.location_neighborhood?.toLowerCase().includes('kocaali') ||
    listing.location_district?.toLowerCase().includes('kocaali')) &&
    (listing.property_type === 'daire' || listing.property_type === 'villa' || listing.property_type === 'yazlik' || listing.property_type === 'ev')
  );

  // Group by property type
  const propertiesByType = {
    daire: kocaaliListings.filter(l => l.property_type === 'daire').slice(0, 6),
    villa: kocaaliListings.filter(l => l.property_type === 'villa').slice(0, 6),
    yazlik: kocaaliListings.filter(l => l.property_type === 'yazlik').slice(0, 6),
    ev: kocaaliListings.filter(l => l.property_type === 'ev').slice(0, 6),
  };

  const faqSchema = generateFAQSchema(investmentFAQs);

  const articleSchema = generateArticleSchema({
    headline: 'Kocaali Yatırımlık Gayrimenkul | Yatırım Fırsatları ve Rehber',
    description: 'Kocaali\'de yatırımlık gayrimenkul fırsatları. Yatırım potansiyeli yüksek bölgeler, fiyat trendleri ve uzman tavsiyeleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Kocaali', url: `${siteConfig.url}${basePath}/kocaali` },
      { name: 'Kocaali Yatırımlık Gayrimenkul', url: `${siteConfig.url}${basePath}/kocaali-yatirimlik-gayrimenkul` },
    ],
    `${siteConfig.url}${basePath}/kocaali-yatirimlik-gayrimenkul`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Kocaali', href: `${basePath}/kocaali` },
          { label: 'Yatırımlık Gayrimenkul', href: `${basePath}/kocaali-yatirimlik-gayrimenkul` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Kocaali'de yatırımlık gayrimenkul</strong> arayanlar için daha uygun giriş fiyatları, 
              sakin yaşam ve doğal güzellikler önemli avantajlardır. Karasu'ya göre genellikle daha uygun 
              fiyatlı seçenekler sunar. Denize yakın konumlar ve merkez mahalleler yatırım potansiyeli 
              açısından öne çıkmaktadır. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Kocaali Yatırımlık Gayrimenkul
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Kocaali'de yatırım potansiyeli yüksek gayrimenkul fırsatları.{' '}
                  <Link href={`${basePath}/kocaali-satilik-ev`} className="text-white hover:text-primary-300 underline font-medium">
                    Kocaali satılık ev
                  </Link>
                  {' '}sayfamızda tüm yatırım seçeneklerini keşfedebilirsiniz. Uzman tavsiyeleri ve güncel ilanlar ile yatırım kararınızı destekleyin.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Investment Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Neden Kocaali'de Yatırım?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 mb-6">
                    Kocaali, Sakarya'nın sahil ilçelerinden biri olarak, yatırım potansiyeli taşıyan bir bölgedir. 
                    <strong>Karasu'ya göre daha uygun giriş fiyatları</strong> ve sakin yaşam sunar. 
                    Denize yakın konumu ve gelişmekte olan altyapısı ile uzun vadeli yatırımcılar için ilgi çekici olabilir.
                  </p>
                  <ul className="list-disc list-inside space-y-3 text-gray-700">
                    <li>Daha uygun giriş fiyatları (Karasu'ya göre)</li>
                    <li>Denize yakın konum ve turizm potansiyeli</li>
                    <li>Gelişmekte olan altyapı ve yeni projeler</li>
                    <li>Sakin ve huzurlu yaşam alanları</li>
                    <li>Uzun vadede değerlenme potansiyeli</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Comparison with Karasu */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Kocaali mi Karasu mu Yatırım İçin?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Kocaali Avantajları</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Daha uygun giriş fiyatları</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Sakin ve huzurlu yaşam</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Doğal güzellikler</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Gelişmekte olan bölge</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Karasu Avantajları</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Daha gelişmiş altyapı</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Yüksek turizm potansiyeli</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Daha fazla sosyal tesis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Merkez konum avantajı</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`}>
                    <Button variant="outline" size="sm">
                      Karasu Yatırımlık Gayrimenkul
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
          </div>
        </section>

        {/* Investment Properties by Type */}
        {propertiesByType.daire.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Daireler
                    </h2>
                    <p className="text-gray-600">
                      Kocaali'de yatırım potansiyeli yüksek daire seçenekleri
                    </p>
                  </div>
                  <Link
                    href={`${basePath}/satilik?q=Kocaali&tip=daire`}
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    Tümünü Gör
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.daire.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {propertiesByType.villa.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Villalar
                    </h2>
                    <p className="text-gray-600">
                      Kocaali'de yatırım potansiyeli yüksek villa seçenekleri
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.villa.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {propertiesByType.yazlik.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Yazlık Evler
                    </h2>
                    <p className="text-gray-600">
                      Kocaali'de yatırım potansiyeli yüksek yazlık ev seçenekleri
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.yazlik.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-base text-gray-600">
                  Kocaali yatırımlık gayrimenkul hakkında merak edilenler
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {investmentFAQs.map((faq, index) => (
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

        {/* Internal Links */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Daha Fazla Bilgi
                </h3>
                <p className="text-gray-700 mb-4">
                  Kocaali'de yatırımlık gayrimenkul hakkında daha kapsamlı bilgi için{' '}
                  <Link href={`${basePath}/kocaali-satilik-ev`} className="text-primary hover:underline font-medium">
                    Kocaali Satılık Ev
                  </Link>{' '}
                  rehberimize göz atabilirsiniz.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`${basePath}/kocaali-satilik-ev`}>
                    <Button variant="outline" size="sm">
                      Kocaali Satılık Ev
                    </Button>
                  </Link>
                  <Link href={`${basePath}/kocaali-emlak-rehberi`}>
                    <Button variant="outline" size="sm">
                      Kocaali Emlak Rehberi
                    </Button>
                  </Link>
                  <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`}>
                    <Button variant="outline" size="sm">
                      Karasu Yatırımlık
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Kocaali'de Yatırım Fırsatlarını Keşfedin
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali'de yatırımlık gayrimenkul arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
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
