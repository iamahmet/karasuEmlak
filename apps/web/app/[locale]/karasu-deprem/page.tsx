import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { AlertTriangle, Shield, Home, TrendingDown, CheckCircle, Info } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-deprem' : `/${locale}/karasu-deprem`;

  return {
    title: 'Karasu Deprem | Deprem Sonrası Emlak Piyasası ve Güvenlik | Karasu Emlak',
    description: 'Karasu deprem bilgileri, emlak piyasası etkileri, yapı güvenliği ve deprem sonrası süreçler. Uzman görüşleri ve güncel haberler.',
    keywords: [
      'karasu deprem',
      'karasu deprem 2025',
      'karasu deprem sonrası',
      'karasu emlak piyasası deprem',
      'karasu yapı güvenliği',
      'karasu deprem etkileri',
      'karasu deprem haberleri',
      'karasu emlak güvenliği',
      'karasu deprem analizi',
      'karasu deprem uzman görüşleri',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu-deprem',
        'en': '/en/karasu-deprem',
        'et': '/et/karasu-deprem',
        'ru': '/ru/karasu-deprem',
        'ar': '/ar/karasu-deprem',
      }),
    },
    openGraph: {
      title: 'Karasu Deprem | Deprem Sonrası Emlak Piyasası',
      description: 'Karasu deprem bilgileri, emlak piyasası etkileri ve yapı güvenliği hakkında güncel bilgiler.',
      type: 'article',
    },
  };
}

export default async function KarasuDepremPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Karasu Deprem', href: `${basePath}/karasu-deprem` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Karasu Deprem | Deprem Sonrası Emlak Piyasası',
    description: 'Karasu deprem bilgileri, emlak piyasası etkileri, yapı güvenliği ve deprem sonrası süreçler.',
    datePublished: '2025-01-01T00:00:00Z',
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <AlertTriangle className="h-12 w-12 text-orange-500" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                Karasu Deprem
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Karasu deprem bilgileri, emlak piyasası etkileri, yapı güvenliği ve deprem sonrası süreçler hakkında güncel bilgiler ve uzman görüşleri.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Deprem Bilgileri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Info className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Deprem Bilgileri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Karasu ve çevresinde meydana gelen depremler hakkında güncel bilgiler ve resmi açıklamalar.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>AFAD açıklamaları:</strong> Resmi deprem bilgileri için AFAD\'ı takip edin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Artçı depremler:</strong> Ana deprem sonrası artçı depremler normaldir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Güvenlik önlemleri:</strong> Deprem sonrası güvenlik önlemlerini alın</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Emlak Piyasası Etkileri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Emlak Piyasası Etkileri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Deprem sonrası emlak piyasasında yaşanan değişiklikler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Fiyat etkileri:</strong> Deprem sonrası kısa vadede fiyat dalgalanmaları görülebilir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Talep değişiklikleri:</strong> Güvenli yapılar daha çok tercih edilir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı güvenliği:</strong> Yapı güvenliği kontrolleri artar</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Yapı Güvenliği */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Yapı Güvenliği</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Emlak alırken yapı güvenliği kontrolü yapılması önemlidir:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı ruhsatı:</strong> Yapı ruhsatı ve iskan belgesi kontrol edilmeli</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı yaşı:</strong> Yeni yapılar genellikle daha güvenlidir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Zemin etüdü:</strong> Zemin etüdü yapılmış olmalı</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Uzman kontrolü:</strong> Yapı mühendisi kontrolü yapılmalı</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* İlgili Blog Yazıları */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Blog Yazıları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href={`${basePath}/blog/karasu-deprem-2025-ocak-haberi`} className="group border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                      Karasu Deprem 2025 Ocak Haberi
                    </h3>
                    <p className="text-sm text-gray-600">
                      Güncel deprem haberleri ve resmi açıklamalar
                    </p>
                  </Link>
                  <Link href={`${basePath}/blog/karasu-deprem-emlak-piyasasi-etkileri`} className="group border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                      Karasu Deprem Emlak Piyasası Etkileri
                    </h3>
                    <p className="text-sm text-gray-600">
                      Deprem sonrası emlak piyasası analizi
                    </p>
                  </Link>
                  <Link href={`${basePath}/blog/karasu-deprem-uzman-gorusleri`} className="group border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                      Karasu Deprem Uzman Görüşleri
                    </h3>
                    <p className="text-sm text-gray-600">
                      Uzman görüşleri ve analizler
                    </p>
                  </Link>
                  <Link href={`${basePath}/blog/karasu-yapi-guvenligi-rehberi`} className="group border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                      Karasu Yapı Güvenliği Rehberi
                    </h3>
                    <p className="text-sm text-gray-600">
                      Yapı güvenliği kontrolü rehberi
                    </p>
                  </Link>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Güvenli Emlak mı Arıyorsunuz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman ekibimiz, güvenli ve sağlam yapılar konusunda size rehberlik eder. Yapı güvenliği kontrolleri ve danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/satilik`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Güvenli İlanları İncele
                    </Button>
                  </Link>
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Danışmanlık Al
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
