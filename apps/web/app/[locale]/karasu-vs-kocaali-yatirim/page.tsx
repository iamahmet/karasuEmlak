import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getAIQuestionsForPage, getComparisonAIQuestions } from '@/lib/supabase/queries/ai-questions';
import { withTimeout } from '@/lib/utils/timeout';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, DollarSign, ChartLine, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import dynamicImport from 'next/dynamic';

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
  const canonicalPath = locale === routing.defaultLocale 
    ? '/karasu-vs-kocaali-yatirim' 
    : `/${locale}/karasu-vs-kocaali-yatirim`;
  
  return {
    title: 'Karasu vs Kocaali Yatırım | Karşılaştırma Rehberi | Karasu Emlak',
    description: 'Karasu ve Kocaali\'de emlak yatırımı karşılaştırması. Yatırım potansiyeli, kiralama geliri, değer kazanma, risk analizi ve hangi bölge yatırım için daha uygun?',
    keywords: [
      'karasu vs kocaali yatırım',
      'karasu kocaali yatırım karşılaştırma',
      'karasu kocaali emlak yatırımı',
      'karasu kocaali kiralama geliri',
      'karasu kocaali yatırım potansiyeli',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/karasu-vs-kocaali-yatirim',
        'en': '/en/karasu-vs-kocaali-yatirim',
        'et': '/et/karasu-vs-kocaali-yatirim',
        'ru': '/ru/karasu-vs-kocaali-yatirim',
        'ar': '/ar/karasu-vs-kocaali-yatirim',
      },
    },
    openGraph: {
      title: 'Karasu vs Kocaali Yatırım | Karşılaştırma Rehberi',
      description: 'Karasu ve Kocaali\'de emlak yatırımı karşılaştırması. Yatırım potansiyeli ve risk analizi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu vs Kocaali Yatırım Karşılaştırması',
        },
      ],
    },
  };
}

export default async function KarasuVsKocaaliYatirimPage({
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

  const comparisonFAQs = await withTimeout(getComparisonAIQuestions(), 2000, []);

  const articleSchema = generateArticleSchema({
    headline: 'Karasu vs Kocaali Yatırım | Karşılaştırma Rehberi',
    description: 'Karasu ve Kocaali\'de emlak yatırımı karşılaştırması. Yatırım potansiyeli, kiralama geliri ve risk analizi.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = comparisonFAQs && comparisonFAQs.length > 0 
    ? generateFAQSchema(comparisonFAQs.map(q => ({ question: q.question, answer: q.answer })))
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu vs Kocaali', url: `${siteConfig.url}${basePath}/karasu-vs-kocaali-satilik-ev` },
      { name: 'Yatırım Karşılaştırması', url: `${siteConfig.url}${basePath}/karasu-vs-kocaali-yatirim` },
    ],
    `${siteConfig.url}${basePath}/karasu-vs-kocaali-yatirim`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Karasu vs Kocaali', href: `${basePath}/karasu-vs-kocaali-satilik-ev` },
            { label: 'Yatırım' },
          ]}
          className="mb-6"
        />

        <header className="mb-12 text-center">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Karasu vs Kocaali: Yatırım Karşılaştırması
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Karasu ve Kocaali'de emlak yatırımı yapmayı düşünenler için objektif bir karşılaştırma. 
              Yatırım potansiyeli, kiralama geliri, değer kazanma ve risk analizi.
            </p>
          </ScrollReveal>
        </header>

        {/* Kısa Cevap */}
        <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-12">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal direction="up" delay={0}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Karasu</strong> ve <strong>Kocaali</strong> her ikisi de yatırım potansiyeli taşır, 
                ancak farklı yatırım profilleri sunarlar. <strong>Karasu</strong> turizm ve yazlık kiralama 
                geliri açısından daha yüksek potansiyel gösterirken, <strong>Kocaali</strong> uzun vadeli 
                değer kazanma ve sakin yaşam tercih eden yatırımcılar için uygundur. 
                Her iki bölgede de fiyat artış potansiyeli mevcuttur, ancak Karasu'nun daha büyük nüfusu 
                ve gelişen altyapısı kısa vadede daha hızlı değer kazanma sağlayabilir.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Yatırım Potansiyeli Comparison */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Yatırım Potansiyeli Karşılaştırması
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal direction="left" delay={100}>
              <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Karasu Yatırım Profili</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Kiralama Geliri Potansiyeli</h4>
                    <p className="text-gray-700 text-sm">
                      Yaz aylarında yüksek kiralama geliri potansiyeli. Turizm sezonunda günlük/haftalık 
                      kiralama seçenekleri yaygındır. Ortalama yıllık kiralama getirisi %4-6 arasında değişebilir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Değer Kazanma Potansiyeli</h4>
                    <p className="text-gray-700 text-sm">
                      Gelişen altyapı ve nüfus artışı ile orta-uzun vadede değer kazanma potansiyeli yüksektir. 
                      İstanbul'a yakınlık ve turizm potansiyeli değer artışını destekler.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Likidite</h4>
                    <p className="text-gray-700 text-sm">
                      Daha büyük pazar hacmi nedeniyle satış süreci genellikle daha hızlıdır. 
                      Alıcı havuzu daha geniştir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Risk Faktörleri</h4>
                    <p className="text-gray-700 text-sm">
                      Turizm sezonuna bağımlılık. Kış aylarında kiralama geliri düşebilir. 
                      Mevsimsel dalgalanmalar göz önünde bulundurulmalıdır.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Kocaali Yatırım Profili</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Kiralama Geliri Potansiyeli</h4>
                    <p className="text-gray-700 text-sm">
                      Daha sakin bir turizm profili. Uzun vadeli kiralama seçenekleri daha yaygındır. 
                      Ortalama yıllık kiralama getirisi %3-5 arasında değişebilir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Değer Kazanma Potansiyeli</h4>
                    <p className="text-gray-700 text-sm">
                      Uzun vadede istikrarlı değer kazanma potansiyeli. Doğal güzellikler ve sakin yaşam 
                      tercih edenler için değer artışı süreklidir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Likidite</h4>
                    <p className="text-gray-700 text-sm">
                      Daha küçük pazar hacmi nedeniyle satış süreci biraz daha uzun sürebilir. 
                      Doğru fiyatlandırma önemlidir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Risk Faktörleri</h4>
                    <p className="text-gray-700 text-sm">
                      Daha sınırlı turizm potansiyeli. Kiralama geliri daha düşük olabilir. 
                      Uzun vadeli yatırım stratejisi gerektirir.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Yatırım Stratejileri */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Yatırım Stratejileri
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Karasu İçin Yatırım Stratejisi</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Yazlık kiralama odaklı yatırım</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Denize yakın konumlar tercih edilmeli</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Kısa-orta vadeli yatırım planı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Turizm sezonu gelirlerini değerlendirme</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kocaali İçin Yatırım Stratejisi</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Uzun vadeli değer kazanma odaklı</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Doğal güzellikler ve sakin konumlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Uzun vadeli yatırım planı (5+ yıl)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Emeklilik ve yaşam amaçlı yatırım</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Karar Özeti */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yatırım Kararı Özeti</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  <strong>Karasu</strong> yatırımı, kısa-orta vadeli kiralama geliri ve turizm potansiyeli 
                  arayan yatırımcılar için daha uygundur. Özellikle yazlık ev yatırımı ve mevsimsel kiralama 
                  geliri düşünenler için idealdir.
                </p>
                <p>
                  <strong>Kocaali</strong> yatırımı, uzun vadeli değer kazanma ve sakin yaşam tercih eden 
                  yatırımcılar için daha uygundur. Emeklilik planı veya uzun vadeli yaşam amaçlı yatırım 
                  yapanlar için idealdir.
                </p>
                <p className="font-semibold text-gray-900">
                  Her iki bölge de kendi içinde değerli yatırım fırsatları sunar. 
                  Yatırım hedefinize, zaman ufkunuza ve risk toleransınıza göre karar vermeniz önerilir.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Internal Links */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlgili Rehberler</h2>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Karasu Yatırımlık Evler
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Kocaali Yatırımlık Gayrimenkul
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu-vs-kocaali-satilik-ev`}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Genel Karşılaştırma
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* FAQ */}
        {comparisonFAQs && comparisonFAQs.length > 0 && (
          <section className="py-16 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-4xl">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Sık Sorulan Sorular
                  </h2>
                </div>
              </ScrollReveal>

              <div className="space-y-4">
                {comparisonFAQs.map((faq, index) => (
                  <ScrollReveal key={faq.id} direction="up" delay={index * 50}>
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
        )}
      </div>
    </>
  );
}
