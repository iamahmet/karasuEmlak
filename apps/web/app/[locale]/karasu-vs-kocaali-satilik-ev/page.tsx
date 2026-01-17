import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getAIQuestionsForPage, getComparisonAIQuestions } from '@/lib/supabase/queries/ai-questions';
import { withTimeout } from '@/lib/utils/timeout';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, TrendingUp, MapPin, Waves, Building2, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
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
    ? '/karasu-vs-kocaali-satilik-ev' 
    : `/${locale}/karasu-vs-kocaali-satilik-ev`;
  
  return {
    title: 'Karasu vs Kocaali Satılık Ev | Karşılaştırma Rehberi | Karasu Emlak',
    description: 'Karasu ve Kocaali\'de satılık ev karşılaştırması. Fiyat algısı, yaşam tarzı, ulaşım, yatırım potansiyeli ve kimler için hangisi daha uygun? Objektif karşılaştırma rehberi.',
    keywords: [
      'karasu vs kocaali',
      'karasu kocaali karşılaştırma',
      'karasu mu kocaali mi',
      'karasu kocaali satılık ev',
      'karasu kocaali fiyat',
      'karasu kocaali yatırım',
      'karasu kocaali yaşam',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/karasu-vs-kocaali-satilik-ev',
        'en': '/en/karasu-vs-kocaali-satilik-ev',
        'et': '/et/karasu-vs-kocaali-satilik-ev',
        'ru': '/ru/karasu-vs-kocaali-satilik-ev',
        'ar': '/ar/karasu-vs-kocaali-satilik-ev',
      },
    },
    openGraph: {
      title: 'Karasu vs Kocaali Satılık Ev | Karşılaştırma Rehberi',
      description: 'Karasu ve Kocaali\'de satılık ev karşılaştırması. Objektif analiz ve karar rehberi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu vs Kocaali Karşılaştırması',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu vs Kocaali Satılık Ev | Karşılaştırma',
      description: 'Karasu ve Kocaali\'de satılık ev karşılaştırması. Objektif analiz.',
    },
  };
}

export default async function KarasuVsKocaaliSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch comparison Q&As
  const comparisonFAQs = await withTimeout(getComparisonAIQuestions(), 2000, []);

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu vs Kocaali Satılık Ev | Karşılaştırma Rehberi',
    description: 'Karasu ve Kocaali\'de satılık ev karşılaştırması. Fiyat algısı, yaşam tarzı, ulaşım, yatırım potansiyeli ve kimler için hangisi daha uygun?',
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
      { name: 'Karasu Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-satilik-ev` },
      { name: 'Kocaali Satılık Ev', url: `${siteConfig.url}${basePath}/kocaali-satilik-ev` },
      { name: 'Karasu vs Kocaali', url: `${siteConfig.url}${basePath}/karasu-vs-kocaali-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-vs-kocaali-satilik-ev`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Karasu', href: `${basePath}/karasu-satilik-ev` },
            { label: 'Kocaali', href: `${basePath}/kocaali-satilik-ev` },
            { label: 'Karşılaştırma' },
          ]}
          className="mb-6"
        />

        {/* Header */}
        <header className="mb-12 text-center">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Karasu vs Kocaali: Satılık Ev Karşılaştırması
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Karasu ve Kocaali'de satılık ev arayanlar için objektif bir karşılaştırma rehberi. 
              Fiyat algısı, yaşam tarzı, ulaşım ve yatırım potansiyeli açısından detaylı analiz.
            </p>
          </ScrollReveal>
        </header>

        {/* Kısa Cevap / AI Overviews Block */}
        <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-12">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal direction="up" delay={0}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Karasu ve Kocaali</strong> arasında seçim yaparken dikkate alınması gereken temel faktörler: 
                <strong>Karasu</strong> daha büyük bir nüfusa ve gelişmiş altyapıya sahipken, 
                <strong>Kocaali</strong> daha sakin bir yaşam tarzı ve doğal güzellikler sunar. 
                Her iki bölge de yatırım potansiyeli taşır; Karasu turizm ve sürekli oturum için, 
                Kocaali ise huzurlu yaşam ve doğa severler için idealdir. 
                Fiyat aralıkları benzerdir, ancak konum ve özelliklere göre değişkenlik gösterir.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Side-by-Side Comparison */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Karasu vs Kocaali: Detaylı Karşılaştırma
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Karasu Column */}
            <ScrollReveal direction="left" delay={100}>
              <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Karasu</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      Fiyat Algısı
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Karasu'da satılık ev fiyatları geniş bir aralıkta değişmektedir. 
                      Merkez ve denize yakın konumlar daha yüksek fiyatlara sahiptir. 
                      Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasında değişmektedir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Home className="h-5 w-5 text-gray-600" />
                      Yaşam Tarzı
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Karasu daha büyük bir nüfusa ve gelişmiş sosyal altyapıya sahiptir. 
                      Daha fazla işletme, restoran, kafe ve sosyal aktivite seçeneği bulunur. 
                      Hem sürekli oturum hem de yazlık kullanım için uygundur.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      Ulaşım
                    </h4>
                    <p className="text-gray-700 text-sm">
                      İstanbul'a yakınlığı (yaklaşık 2 saat) ve gelişmiş karayolu bağlantıları 
                      avantaj sağlar. Toplu taşıma seçenekleri daha fazladır. 
                      Havaalanına erişim kolaydır.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                      Yatırım Potansiyeli
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Turizm potansiyeli yüksektir. Yaz aylarında kiralama geliri yüksek olabilir. 
                      Gelişen altyapı ve nüfus artışı uzun vadede değer kazanma potansiyeli sağlar.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Kocaali Column */}
            <ScrollReveal direction="right" delay={200}>
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Kocaali</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      Fiyat Algısı
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Kocaali'de satılık ev fiyatları benzer aralıklarda seyretmektedir. 
                      Daha sakin ve doğal konumlar tercih edilir. 
                      Ortalama fiyat aralığı 450.000 TL ile 2.500.000 TL arasında değişmektedir.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Home className="h-5 w-5 text-gray-600" />
                      Yaşam Tarzı
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Kocaali daha sakin ve huzurlu bir yaşam sunar. 
                      Doğal güzellikler ve temiz hava ön plandadır. 
                      Daha az kalabalık, daha çok doğa ile iç içe bir yaşam tarzı vardır.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      Ulaşım
                    </h4>
                    <p className="text-gray-700 text-sm">
                      İstanbul'a mesafe benzerdir. Karayolu bağlantıları iyidir. 
                      Toplu taşıma seçenekleri daha sınırlıdır. 
                      Özel araç kullanımı daha yaygındır.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                      Yatırım Potansiyeli
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Doğal güzellikler ve sakin yaşam tercih edenler için yatırım potansiyeli vardır. 
                      Uzun vadede değer kazanma potansiyeli mevcuttur. 
                      Daha az turistik, daha çok yaşam odaklı bir yatırım profili sunar.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Kimler İçin Karasu */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Kimler İçin Karasu Daha Uygun?
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sosyal yaşam ve aktivite çeşitliliği arayanlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Yazlık ve turizm odaklı yatırım yapmak isteyenler</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gelişmiş altyapı ve hizmetlere ihtiyaç duyanlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Toplu taşıma kullanmayı tercih edenler</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Hem sürekli oturum hem yazlık kullanım planlayanlar</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </section>

        {/* Kimler İçin Kocaali */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                Kimler İçin Kocaali Daha Uygun?
              </h2>
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
                  <span>Uzun vadeli yaşam ve emeklilik planlayanlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Özel araç kullanımı yaygın olanlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Kalabalıktan uzak, doğal bir çevre tercih edenler</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </section>

        {/* Kısa Karar Özeti */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kısa Karar Özeti</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  <strong>Karasu</strong> ve <strong>Kocaali</strong> arasında seçim yaparken, 
                  öncelikle yaşam tarzı tercihlerinizi ve yatırım hedeflerinizi değerlendirmeniz önemlidir.
                </p>
                <p>
                  Eğer sosyal aktiviteler, gelişmiş altyapı ve turizm potansiyeli ön plandaysa, 
                  <strong>Karasu</strong> daha uygun bir seçim olabilir. 
                  Özellikle yazlık kullanım ve kiralama geliri düşünen yatırımcılar için idealdir.
                </p>
                <p>
                  Eğer sakin yaşam, doğal güzellikler ve huzurlu bir çevre ön plandaysa, 
                  <strong>Kocaali</strong> daha uygun bir seçim olabilir. 
                  Uzun vadeli yaşam planlayanlar ve emeklilik için ev arayanlar için idealdir.
                </p>
                <p className="font-semibold text-gray-900">
                  Her iki bölge de kendi içinde değerli seçenekler sunar. 
                  Karar vermeden önce her iki bölgeyi de ziyaret etmeniz ve 
                  kendi ihtiyaçlarınıza göre değerlendirmeniz önerilir.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Internal Links to Hubs */}
        <section className="mb-16">
          <ScrollReveal direction="up" delay={0}>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Daha Fazla Bilgi</h2>
              <p className="text-gray-700 mb-4">
                Karasu ve Kocaali hakkında daha detaylı bilgi için rehberlerimize göz atabilirsiniz:
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu-satilik-ev`}>
                    <Home className="h-4 w-4 mr-2" />
                    Karasu Satılık Ev Rehberi
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/kocaali-satilik-ev`}>
                    <Home className="h-4 w-4 mr-2" />
                    Kocaali Satılık Ev Rehberi
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu-vs-kocaali-yatirim`}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Yatırım Karşılaştırması
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu-vs-kocaali-yasam`}>
                    <Waves className="h-4 w-4 mr-2" />
                    Yaşam Karşılaştırması
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* FAQ Section */}
        {comparisonFAQs && comparisonFAQs && comparisonFAQs.length > 0 && (
          <section className="py-16 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-4xl">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Sık Sorulan Sorular
                  </h2>
                  <p className="text-base text-gray-600">
                    Karasu vs Kocaali karşılaştırması hakkında merak edilenler
                  </p>
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Karasu veya Kocaali'de Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, her iki bölgede de satılık ev arayanlar için 
                profesyonel danışmanlık hizmeti sunmaktadır. Tüm süreçte yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/karasu-satilik-ev`}>
                    Karasu Satılık Ev Rehberi
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
