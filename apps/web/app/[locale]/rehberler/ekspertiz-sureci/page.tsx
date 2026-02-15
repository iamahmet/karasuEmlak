import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { FileSearch, CheckCircle, AlertCircle, Clock, DollarSign, Shield } from 'lucide-react';
import { Button } from '@karasu/ui';
import Link from 'next/link';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/ekspertiz-sureci' : `/${locale}/rehberler/ekspertiz-sureci`;

  return {
    title: 'Ekspertiz Süreci Rehberi | Emlak Değerleme ve Ekspertiz | Karasu Emlak',
    description: 'Emlak ekspertiz süreci hakkında bilmeniz gereken her şey. Ekspertiz nedir, nasıl yapılır, ücretleri ve süreçleri. Uzman rehber.',
    keywords: [
      'emlak ekspertiz',
      'ekspertiz süreci',
      'emlak değerleme',
      'ekspertiz raporu',
      'ekspertiz ücreti',
      'emlak ekspertiz nasıl yapılır',
      'karasu ekspertiz',
      'emlak değerleme raporu',
      'ekspertiz şirketleri',
      'emlak ekspertiz rehberi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/ekspertiz-sureci',
        'en': '/en/rehberler/ekspertiz-sureci',
        'et': '/et/rehberler/ekspertiz-sureci',
        'ru': '/ru/rehberler/ekspertiz-sureci',
        'ar': '/ar/rehberler/ekspertiz-sureci',
      }),
    },
    openGraph: {
      title: 'Ekspertiz Süreci Rehberi | Emlak Değerleme',
      description: 'Emlak ekspertiz süreci hakkında bilmeniz gereken her şey. Ekspertiz nedir, nasıl yapılır ve ücretleri.',
      type: 'article',
    },
  };
}

export default async function EkspertizSureciPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Ekspertiz Süreci', href: `${basePath}/rehberler/ekspertiz-sureci` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Ekspertiz Süreci Rehberi | Emlak Değerleme',
    description: 'Emlak ekspertiz süreci hakkında bilmeniz gereken her şey. Ekspertiz nedir, nasıl yapılır, ücretleri ve süreçleri.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <header className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ekspertiz Süreci Rehberi
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Emlak ekspertiz süreci hakkında bilmeniz gereken her şey. Ekspertiz nedir, nasıl yapılır, ücretleri ve süreçleri. Uzman rehber.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Ekspertiz Nedir */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileSearch className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Ekspertiz Nedir?</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ekspertiz, bir gayrimenkulün piyasa değerinin uzman bir değerleme uzmanı tarafından belirlenmesi işlemidir. Özellikle konut kredisi başvurularında bankalar tarafından istenir.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kredi başvuruları:</strong> Bankalar, kredi vermeden önce evin değerini öğrenmek ister</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Sigorta değeri:</strong> Evin sigorta değerini belirlemek için</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Satış fiyatı:</strong> Evin doğru fiyatını belirlemek için</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Hukuki süreçler:</strong> Miras, boşanma gibi durumlarda</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Ekspertiz Süreci */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Ekspertiz Süreci</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                      <div>
                        <strong>Ekspertiz şirketi seçimi:</strong> Banka tarafından onaylı ekspertiz şirketlerinden birini seçin
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                      <div>
                        <strong>Randevu alın:</strong> Ekspertiz şirketi ile randevu alın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                      <div>
                        <strong>Evi gösterin:</strong> Ekspertiz uzmanı evi inceler (yaklaşık 30-60 dakika)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</span>
                      <div>
                        <strong>Rapor hazırlama:</strong> Ekspertiz raporu hazırlanır (1-3 gün)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</span>
                      <div>
                        <strong>Rapor teslimi:</strong> Ekspertiz raporu bankaya ve size teslim edilir
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* Ekspertiz Ücretleri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Ekspertiz Ücretleri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ekspertiz ücretleri evin değerine ve ekspertiz şirketine göre değişir:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ortalama ücret:</strong> 500-1500 TL arası (2024)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Faktörler:</strong> Evin değeri, konumu, büyüklüğü</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ödeme:</strong> Genellikle ekspertiz öncesi veya sonrası yapılır</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Banka anlaşmalı:</strong> Bazı bankalar ekspertiz ücretini kredi içine ekler</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ekspertiz Hizmeti mi İstiyorsunuz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman ekibimiz, emlak değerleme ve ekspertiz sürecinde size rehberlik eder.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/hizmetler/emlak-degerleme`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Değerleme Hizmeti
                    </Button>
                  </Link>
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      İletişime Geç
                    </Button>
                  </Link>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
