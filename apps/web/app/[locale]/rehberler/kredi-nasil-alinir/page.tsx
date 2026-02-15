import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { CreditCard, FileCheck, Calculator, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/kredi-nasil-alinir' : `/${locale}/rehberler/kredi-nasil-alinir`;

  return {
    title: 'Konut Kredisi Nasıl Alınır? | Kredi Başvuru Rehberi | Karasu Emlak',
    description: 'Konut kredisi başvurusu için bilmeniz gereken her şey. Gerekli belgeler, kredi hesaplama, faiz oranları, başvuru süreci ve onay kriterleri. Uzman rehber.',
    keywords: [
      'konut kredisi nasıl alınır',
      'ev kredisi başvurusu',
      'konut kredisi belgeleri',
      'kredi hesaplama',
      'konut kredisi faiz oranları',
      'kredi başvuru süreci',
      'ev kredisi şartları',
      'konut kredisi onay',
      'karasu konut kredisi',
      'emlak kredisi rehberi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/kredi-nasil-alinir',
        'en': '/en/rehberler/kredi-nasil-alinir',
        'et': '/et/rehberler/kredi-nasil-alinir',
        'ru': '/ru/rehberler/kredi-nasil-alinir',
        'ar': '/ar/rehberler/kredi-nasil-alinir',
      }),
    },
    openGraph: {
      title: 'Konut Kredisi Nasıl Alınır? | Kredi Başvuru Rehberi',
      description: 'Konut kredisi başvurusu için bilmeniz gereken her şey. Gerekli belgeler, kredi hesaplama ve başvuru süreci.',
      type: 'article',
    },
  };
}

export default async function KrediNasilAlinirPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Kredi Nasıl Alınır?', href: `${basePath}/rehberler/kredi-nasil-alinir` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Konut Kredisi Nasıl Alınır? | Kredi Başvuru Rehberi',
    description: 'Konut kredisi başvurusu için bilmeniz gereken her şey. Gerekli belgeler, kredi hesaplama, faiz oranları ve başvuru süreci.',
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
              Konut Kredisi Nasıl Alınır?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Konut kredisi başvurusu için bilmeniz gereken her şey. Gerekli belgeler, kredi hesaplama, faiz oranları, başvuru süreci ve onay kriterleri.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Kredi Hesaplama */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Kredi Hesaplama</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Öncelikle ne kadar kredi alabileceğinizi hesaplayın:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gelir durumu:</strong> Aylık gelirinizin yaklaşık 5-6 katı kadar kredi alabilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kredi hesaplayıcı:</strong> Online kredi hesaplama araçlarını kullanın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Faiz oranları:</strong> Güncel faiz oranlarını bankalardan öğrenin</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href={`${basePath}/kredi-hesaplayici`}>
                      <Button className="w-full md:w-auto">
                        <Calculator className="h-4 w-4 mr-2" />
                        Kredi Hesaplayıcıyı Kullan
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Gerekli Belgeler */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Gerekli Belgeler</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Kredi başvurusu için hazırlamanız gereken belgeler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kimlik belgesi:</strong> Nüfus cüzdanı veya kimlik kartı</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gelir belgesi:</strong> Maaş bordrosu, işyeri belgesi, vergi levhası</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Tapu belgesi:</strong> Satın alacağınız evin tapu belgesi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ekspertiz raporu:</strong> Evin değerleme raporu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Enerji kimlik belgesi:</strong> EKB belgesi</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Başvuru Süreci */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Başvuru Süreci</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                      <div>
                        <strong>Bankaları araştırın:</strong> Farklı bankaların faiz oranlarını ve kampanyalarını karşılaştırın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                      <div>
                        <strong>Ön onay alın:</strong> Bankadan ön onay alarak kredi limitinizi öğrenin
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                      <div>
                        <strong>Başvuru yapın:</strong> Gerekli belgelerle birlikte başvurunuzu yapın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</span>
                      <div>
                        <strong>Değerlendirme:</strong> Banka başvurunuzu değerlendirir (1-2 hafta)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</span>
                      <div>
                        <strong>Onay ve imza:</strong> Onay sonrası kredi sözleşmesini imzalayın
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* Onay Kriterleri */}
              <section className="mb-12">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Kredi Onay Kriterleri</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Düzenli gelir (en az 6 ay aynı işyerinde çalışma)</li>
                    <li>• Kredi notu (en az 1.500 puan önerilir)</li>
                    <li>• Borç durumu (mevcut borçların gelire oranı %50\'nin altında olmalı)</li>
                    <li>• Yaş sınırı (18-65 yaş arası)</li>
                    <li>• Evin değeri (kredi tutarı ev değerinin %80-90\'ı kadar olabilir)</li>
                  </ul>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Kredi Başvurusu İçin Yardım mı İstiyorsunuz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman ekibimiz, konut kredisi başvurunuzda size rehberlik eder. Ücretsiz danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Danışmanlık Al
                    </Button>
                  </Link>
                  <Link href={`${basePath}/kredi-hesaplayici`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Kredi Hesapla
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
