import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { KOCAALI_GEZILECEK_YERLER } from '@/lib/local-info/kocaali-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Kocaali\'de gezilecek en önemli yerler nelerdir?',
    answer: 'Kocaali\'de gezilecek en önemli yerler: 12 km uzunluğundaki Kocaali Plajı, sahil yolu, merkez parkı ve doğa yürüyüş parkurları. Sakin atmosferi ve doğal güzellikleriyle dikkat çeker.',
  },
  {
    question: 'Kocaali plajı ücretsiz mi?',
    answer: 'Evet, Kocaali plajı halka açık ve ücretsizdir. 12 km uzunluğundaki plajın birçok noktasında plaj tesisleri ve restoranlar bulunmaktadır.',
  },
  {
    question: 'Kocaali\'de doğa yürüyüşü yapılabilir mi?',
    answer: 'Evet, Kocaali çevresinde doğa yürüyüşü için ideal parkurlar bulunmaktadır. Orman içi yollar ve deniz kenarı yürüyüş yolları mevcuttur.',
  },
];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Kocaali Gezilecek Yerler | Turistik Yerler ve Doğal Güzellikler | Karasu Emlak',
    description: 'Kocaali gezilecek yerler: Kocaali Plajı, sahil yolu, merkez parkı ve doğa yürüyüş parkurları. Kocaali\'de görülmesi gereken yerler.',
    keywords: [
      'kocaali gezilecek yerler',
      'kocaali plaj',
      'kocaali turistik yerler',
      'kocaali doğal güzellikler',
      'kocaali sahil yolu',
      'sakarya kocaali gezilecek yerler',
    ],
    alternates: {
      canonical: `${basePath}/kocaali/gezilecek-yerler`,
    },
    openGraph: {
      title: 'Kocaali Gezilecek Yerler | Turistik Yerler ve Doğal Güzellikler',
      description: 'Kocaali gezilecek yerler: Plajlar, doğal alanlar ve turistik mekanlar.',
      url: `${siteConfig.url}${basePath}/kocaali/gezilecek-yerler`,
      type: 'website',
    },
  };
}

export default async function GezilecekYerlerPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const plajlar = KOCAALI_GEZILECEK_YERLER.filter(y => y.type === 'plaj');
  const dogalAlanlar = KOCAALI_GEZILECEK_YERLER.filter(y => y.type === 'dogal-alan');
  const digerYerler = KOCAALI_GEZILECEK_YERLER.filter(y => !['plaj', 'dogal-alan'].includes(y.type));

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Gezilecek Yerler' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-green-100">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Kocaali Gezilecek Yerler ve Turistik Mekanlar
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mb-6">
              Kocaali, doğal güzellikleri, uzun plajları ve eşsiz turistik yerleri ile ziyaretçilerini büyüleyen bir sahil ilçesidir. 12 km uzunluğundaki plajı, sakin atmosferi ve doğal güzellikleri ile doğa severler için ideal bir destinasyondur.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">{KOCAALI_GEZILECEK_YERLER.length} Gezilecek Yer</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>12 km Plaj</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Doğal Yürüyüş Parkurları</span>
              </div>
            </div>
          </div>
        </section>

        {/* Plajlar */}
        {plajlar.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Plajlar ve Sahil Alanları
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Kocaali'nin 12 km uzunluğundaki plajı, ince taneli kumu ve temiz deniziyle ünlüdür. Sakin atmosferi ile yaz aylarında ziyaretçileri ağırlar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plajlar.map((yer) => (
                <Card key={yer.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          {yer.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {yer.aciklama}
                        </p>
                        {yer.ozellikler && yer.ozellikler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {yer.ozellikler.map((ozellik, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium"
                              >
                                {ozellik}
                              </span>
                            ))}
                          </div>
                        )}
                        {yer.konum && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-start gap-2 text-sm">
                              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-600">{yer.konum}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Doğal Alanlar */}
        {dogalAlanlar.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Doğal Alanlar ve Yürüyüş Parkurları
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Kocaali, zengin doğal güzellikleri ve yürüyüş parkurları ile doğa severler için ideal bir destinasyondur.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dogalAlanlar.map((yer) => (
                <Card key={yer.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          {yer.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {yer.aciklama}
                        </p>
                        {yer.ozellikler && yer.ozellikler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {yer.ozellikler.map((ozellik, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                              >
                                {ozellik}
                              </span>
                            ))}
                          </div>
                        )}
                        {yer.konum && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-start gap-2 text-sm">
                              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-600">{yer.konum}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Turistik Yerler ve Parklar */}
        {digerYerler.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Turistik Yerler ve Parklar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digerYerler.map((yer) => (
                <Card key={yer.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {yer.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {yer.aciklama}
                    </p>
                    {yer.ozellikler && yer.ozellikler.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {yer.ozellikler.slice(0, 3).map((ozellik, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {ozellik}
                          </span>
                        ))}
                      </div>
                    )}
                    {yer.konum && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2 text-xs">
                          <svg className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600">{yer.konum}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-muted/50 rounded-xl p-6 border">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm md:text-base text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
