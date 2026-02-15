import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { FileText, CheckCircle, AlertCircle, Clock, DollarSign, Shield } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/ev-nasil-satilir' : `/${locale}/rehberler/ev-nasil-satilir`;

  return {
    title: 'Ev Nasıl Satılır? | Adım Adım Emlak Satış Rehberi | Karasu Emlak',
    description: 'Evinizi satmak için bilmeniz gereken her şey. Fiyat belirleme, ilan hazırlama, görüntüleme, sözleşme ve tapu işlemleri. Uzman emlak danışmanlarından profesyonel rehber.',
    keywords: [
      'ev nasıl satılır',
      'emlak satış rehberi',
      'ev satış süreci',
      'emlak satış adımları',
      'ev satış fiyat belirleme',
      'emlak ilan hazırlama',
      'ev satış sözleşmesi',
      'tapu devir işlemleri',
      'karasu ev satış',
      'emlak satış danışmanlığı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/ev-nasil-satilir',
        'en': '/en/rehberler/ev-nasil-satilir',
        'et': '/et/rehberler/ev-nasil-satilir',
        'ru': '/ru/rehberler/ev-nasil-satilir',
        'ar': '/ar/rehberler/ev-nasil-satilir',
      }),
    },
    openGraph: {
      title: 'Ev Nasıl Satılır? | Adım Adım Emlak Satış Rehberi',
      description: 'Evinizi satmak için bilmeniz gereken her şey. Profesyonel emlak satış rehberi.',
      type: 'article',
    },
  };
}

export default async function EvNasilSatilirPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Ev Nasıl Satılır?', href: `${basePath}/rehberler/ev-nasil-satilir` },
  ];

  // Generate Article schema
  const articleSchema = generateArticleSchema({
    headline: 'Ev Nasıl Satılır? | Adım Adım Emlak Satış Rehberi',
    description: 'Evinizi satmak için bilmeniz gereken her şey. Fiyat belirleme, ilan hazırlama, görüntüleme, sözleşme ve tapu işlemleri.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${siteConfig.url}${crumb.href}`,
    })),
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          {/* Hero Section */}
          <header className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ev Nasıl Satılır?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Evinizi satmak için bilmeniz gereken her şey. Fiyat belirleme, ilan hazırlama, görüntüleme, sözleşme ve tapu işlemleri hakkında kapsamlı rehber.
            </p>
          </header>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Step 1: Fiyat Belirleme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Fiyat Belirleme</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Evinizin doğru fiyatını belirlemek, satış sürecinin en önemli adımıdır. Yanlış fiyatlandırma, evinizin uzun süre satılmamasına veya değerinden düşük fiyata satılmasına neden olabilir.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Piyasa araştırması yapın:</strong> Bölgenizdeki benzer evlerin satış fiyatlarını inceleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Emlak değerleme yaptırın:</strong> Uzman bir değerleme uzmanından evinizin değerini öğrenin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Emlak danışmanından destek alın:</strong> Deneyimli bir emlak danışmanı size doğru fiyat konusunda rehberlik edebilir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Evin durumunu değerlendirin:</strong> Yenileme ihtiyacı, konum, manzara gibi faktörleri göz önünde bulundurun</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 2: İlan Hazırlama */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. İlan Hazırlama</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Profesyonel bir ilan, daha fazla alıcı çeker ve satış sürecini hızlandırır. İlanınızda mutlaka bulunması gerekenler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yüksek kaliteli fotoğraflar:</strong> Evinizin en iyi açılarını gösteren profesyonel fotoğraflar</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Detaylı açıklama:</strong> Evin özellikleri, konumu, çevresel faktörler</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Teknik bilgiler:</strong> Oda sayısı, metrekare, bina yaşı, kat bilgisi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Fiyat ve iletişim bilgileri:</strong> Net fiyat ve ulaşılabilir iletişim bilgileri</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 3: Görüntüleme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Görüntüleme ve Müzakere</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Potansiyel alıcılarla görüşmeler ve müzakere süreci:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Görüntüleme randevuları:</strong> Alıcıların evi görmesi için uygun zamanlar ayarlayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Evi hazırlayın:</strong> Temizlik, düzen ve küçük onarımlar yapın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Müzakere:</strong> Fiyat, ödeme şekli ve teslim tarihi konusunda esnek olun</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Alıcı değerlendirmesi:</strong> Alıcının finansal durumunu kontrol edin</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 4: Sözleşme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Sözleşme ve Ön Ödeme</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Anlaşma sağlandıktan sonra yasal süreçler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ön sözleşme:</strong> Alıcıdan kapora alın ve ön sözleşme imzalayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Tapu kontrolü:</strong> Tapu durumunu kontrol edin, ipotek varsa kaldırın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Noter sözleşmesi:</strong> Noterde satış sözleşmesi imzalayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ödeme planı:</strong> Ödeme şeklini belirleyin (peşin, kredi, taksitli)</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 5: Tapu Devri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Tapu Devir İşlemleri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Tapu devir işlemleri ve dikkat edilmesi gerekenler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gerekli belgeler:</strong> Kimlik, tapu, vergi levhası, yapı kullanma izni</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Tapu devir işlemi:</strong> Tapu müdürlüğünde devir işlemini tamamlayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vergi ödemeleri:</strong> Emlak vergisi, tapu harcı, noter masrafları</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Enerji kimlik belgesi:</strong> EKB belgesini hazır bulundurun</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Important Notes */}
              <section className="mb-12">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Önemli Notlar</h3>
                      <ul className="space-y-2 text-yellow-800">
                        <li>• Emlak danışmanı ile çalışmak, süreci hızlandırır ve yasal riskleri azaltır</li>
                        <li>• Tüm belgeleri önceden hazırlayın ve kontrol edin</li>
                        <li>• Alıcının finansal durumunu mutlaka doğrulayın</li>
                        <li>• Sözleşmeleri mutlaka noterde imzalayın</li>
                        <li>• Vergi ve masrafları önceden hesaplayın</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Evinizi Satmak İster misiniz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman emlak danışmanlarımız, evinizi en iyi fiyata satmanız için size rehberlik eder. Ücretsiz değerleme ve danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Ücretsiz Değerleme Al
                    </Button>
                  </Link>
                  <Link href={`${basePath}/satilik`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      İlanları İncele
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
