import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getComparisonAIQuestions } from '@/lib/supabase/queries/ai-questions';
import { withTimeout } from '@/lib/utils/timeout';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Waves, Building2, School, ShoppingCart, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import dynamicImport from 'next/dynamic';

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
  const canonicalPath = locale === routing.defaultLocale 
    ? '/karasu-vs-kocaali-yasam' 
    : `/${locale}/karasu-vs-kocaali-yasam`;
  
  return {
    title: 'Karasu vs Kocaali Yaşam | Karşılaştırma Rehberi | Karasu Emlak',
    description: 'Karasu ve Kocaali\'de yaşam karşılaştırması. Sosyal yaşam, altyapı, eğitim, sağlık, ulaşım ve hangi bölge hangi yaşam tarzı için daha uygun?',
    keywords: [
      'karasu vs kocaali yaşam',
      'karasu kocaali yaşam karşılaştırma',
      'karasu kocaali sosyal yaşam',
      'karasu kocaali altyapı',
      'karasu kocaali yaşam kalitesi',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/karasu-vs-kocaali-yasam',
        'en': '/en/karasu-vs-kocaali-yasam',
        'et': '/et/karasu-vs-kocaali-yasam',
        'ru': '/ru/karasu-vs-kocaali-yasam',
        'ar': '/ar/karasu-vs-kocaali-yasam',
      },
    },
    openGraph: {
      title: 'Karasu vs Kocaali Yaşam | Karşılaştırma Rehberi',
      description: 'Karasu ve Kocaali\'de yaşam karşılaştırması. Sosyal yaşam, altyapı ve yaşam kalitesi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu vs Kocaali Yaşam Karşılaştırması',
        },
      ],
    },
  };
}

export default async function KarasuVsKocaaliYasamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const comparisonFAQs = await withTimeout(getComparisonAIQuestions(), 2000, []);

  const articleSchema = generateArticleSchema({
    headline: 'Karasu vs Kocaali Yaşam | Karşılaştırma Rehberi',
    description: 'Karasu ve Kocaali\'de yaşam karşılaştırması. Sosyal yaşam, altyapı, eğitim ve sağlık hizmetleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = comparisonFAQs && comparisonFAQs && comparisonFAQs.length > 0 
    ? generateFAQSchema(comparisonFAQs.map(q => ({ question: q.question, answer: q.answer })))
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu vs Kocaali', url: `${siteConfig.url}${basePath}/karasu-vs-kocaali-satilik-ev` },
      { name: 'Yaşam Karşılaştırması', url: `${siteConfig.url}${basePath}/karasu-vs-kocaali-yasam` },
    ],
    `${siteConfig.url}${basePath}/karasu-vs-kocaali-yasam`
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
            { label: 'Yaşam' },
          ]}
          className="mb-6"
        />

        <header className="mb-12 text-center">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Karasu vs Kocaali: Yaşam Karşılaştırması
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Karasu ve Kocaali'de yaşamayı düşünenler için objektif bir karşılaştırma. 
              Sosyal yaşam, altyapı, eğitim, sağlık ve ulaşım açısından detaylı analiz.
            </p>
          </ScrollReveal>
        </header>

        {/* Kısa Cevap */}
        <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-12">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal direction="up" delay={0}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Karasu</strong> daha büyük nüfusa ve gelişmiş sosyal altyapıya sahiptir. 
                Daha fazla işletme, restoran, kafe ve sosyal aktivite seçeneği bulunur. 
                <strong>Kocaali</strong> ise daha sakin, doğal ve huzurlu bir yaşam sunar. 
                Her iki bölge de kendi içinde değerli yaşam seçenekleri sunar; 
                tercih yaşam tarzınıza ve ihtiyaçlarınıza bağlıdır.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Yaşam Faktörleri Comparison */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Yaşam Faktörleri Karşılaştırması
            </h2>
          </ScrollReveal>

          <div className="space-y-8">
            {/* Sosyal Yaşam */}
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left" delay={100}>
                <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-600" />
                    Karasu: Sosyal Yaşam
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha fazla restoran, kafe ve eğlence mekanı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha aktif sosyal hayat ve etkinlikler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha geniş sosyal çevre imkanları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Yaz aylarında daha canlı atmosfer</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={200}>
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-6 w-6 text-blue-600" />
                    Kocaali: Sosyal Yaşam
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Daha sakin ve huzurlu sosyal ortam</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Doğa ile iç içe aktiviteler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Daha samimi ve küçük topluluk hissi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Yıl boyu sakin ve dengeli yaşam</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            {/* Altyapı */}
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left" delay={100}>
                <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-red-600" />
                    Karasu: Altyapı
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha gelişmiş sağlık hizmetleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha fazla eğitim kurumu seçeneği</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha geniş alışveriş ve hizmet seçenekleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha iyi toplu taşıma imkanları</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={200}>
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    Kocaali: Altyapı
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Temel sağlık hizmetleri mevcuttur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Eğitim kurumları sınırlıdır</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Daha az ama yeterli hizmet seçenekleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Özel araç kullanımı daha yaygın</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            {/* Doğa ve Çevre */}
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left" delay={100}>
                <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Waves className="h-6 w-6 text-red-600" />
                    Karasu: Doğa ve Çevre
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Geniş sahil şeridi ve plajlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Yaz aylarında canlı deniz aktiviteleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Daha fazla turistik tesis</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={200}>
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Waves className="h-6 w-6 text-blue-600" />
                    Kocaali: Doğa ve Çevre
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Daha sakin ve doğal çevre</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Daha az kalabalık plajlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Doğa yürüyüşleri ve açık hava aktiviteleri</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Yaşam Tarzı Önerileri */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Hangi Yaşam Tarzı İçin Hangisi?
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Karasu Daha Uygun İçin:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Aktif sosyal yaşam arayanlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Geniş hizmet ve alışveriş seçenekleri isteyenler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Toplu taşıma kullanmayı tercih edenler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Yazlık ve sürekli oturum kombinasyonu</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kocaali Daha Uygun İçin:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Sakin ve huzurlu yaşam arayanlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Doğa ile iç içe yaşamak isteyenler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Emeklilik ve uzun vadeli yaşam planlayanlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Özel araç kullanımı yaygın olanlar</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yaşam Kararı Özeti</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  <strong>Karasu</strong> daha aktif sosyal yaşam, gelişmiş altyapı ve geniş hizmet seçenekleri 
                  arayanlar için daha uygundur. Özellikle genç aileler, çalışan profesyoneller ve 
                  sosyal aktivite severler için idealdir.
                </p>
                <p>
                  <strong>Kocaali</strong> sakin yaşam, doğal güzellikler ve huzurlu çevre arayanlar için 
                  daha uygundur. Özellikle emeklilik planlayanlar, doğa severler ve sakin yaşam tercih edenler 
                  için idealdir.
                </p>
                <p className="font-semibold text-gray-900">
                  Her iki bölge de kendi içinde değerli yaşam seçenekleri sunar. 
                  Karar vermeden önce her iki bölgeyi de ziyaret etmeniz ve kendi yaşam tarzınıza 
                  göre değerlendirmeniz önerilir.
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
                  <Link href={`${basePath}/karasu-emlak-rehberi`}>
                    <Home className="h-4 w-4 mr-2" />
                    Karasu Emlak Rehberi
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/kocaali-emlak-rehberi`}>
                    <Home className="h-4 w-4 mr-2" />
                    Kocaali Emlak Rehberi
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
