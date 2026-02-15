import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { generateHowToSchema } from '@/lib/seo/ai-optimization';
import { Home, CheckCircle, AlertCircle, Shield, FileText, DollarSign, Search, Key } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/ev-nasil-alinir' : `/${locale}/rehberler/ev-nasil-alinir`;

  return {
    title: 'Ev Nasıl Alınır? | Adım Adım Emlak Alım Rehberi | Karasu Emlak',
    description: 'Ev almak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, değerlendirme, sözleşme ve tapu işlemleri. Uzman emlak danışmanlarından profesyonel rehber.',
    keywords: [
      'ev nasıl alınır',
      'emlak alım rehberi',
      'ev alma süreci',
      'emlak alım adımları',
      'ev alırken dikkat edilecekler',
      'ev alma sözleşmesi',
      'tapu işlemleri',
      'karasu ev alım',
      'emlak alım danışmanlığı',
      'ev alım süreci',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/ev-nasil-alinir',
        'en': '/en/rehberler/ev-nasil-alinir',
        'et': '/et/rehberler/ev-nasil-alinir',
        'ru': '/ru/rehberler/ev-nasil-alinir',
        'ar': '/ar/rehberler/ev-nasil-alinir',
      }),
    },
    openGraph: {
      title: 'Ev Nasıl Alınır? | Adım Adım Emlak Alım Rehberi',
      description: 'Ev almak için bilmeniz gereken her şey. Profesyonel emlak alım rehberi.',
      type: 'article',
    },
  };
}

export default async function EvNasilAlinirPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/ev-nasil-alinir' : `/${locale}/rehberler/ev-nasil-alinir`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Ev Nasıl Alınır?', href: `${basePath}/rehberler/ev-nasil-alinir` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Ev Nasıl Alınır? | Adım Adım Emlak Alım Rehberi',
    description: 'Ev almak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, değerlendirme, sözleşme ve tapu işlemleri.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  // Generate HowTo schema for AI responses
  const howToSchema = generateHowToSchema({
    name: 'Ev Nasıl Alınır?',
    description: 'Karasu\'da ev almak için adım adım rehber. Bütçe belirlemeden tapu işlemlerine kadar tüm süreç.',
    totalTime: 'PT2M', // Estimated reading time
    url: `${siteConfig.url}${canonicalPath}`,
    steps: [
      {
        name: 'Bütçe Belirleme',
        text: 'Ev almak için öncelikle bütçenizi belirleyin. Kredi imkanlarınızı araştırın ve ön onay alın. Nakit ve kredi oranınızı planlayın.',
      },
      {
        name: 'Konum ve Özellik Seçimi',
        text: 'İhtiyaçlarınıza uygun konum ve özellikleri belirleyin. Oda sayısı, banyo sayısı, balkon, otopark gibi kriterleri netleştirin.',
      },
      {
        name: 'Emlak Arama',
        text: 'Karasu Emlak platformunda filtreleme yaparak size uygun ilanları bulun. Emlak danışmanımızdan profesyonel destek alın.',
      },
      {
        name: 'Görüntüleme ve Değerlendirme',
        text: 'Seçtiğiniz emlakları görüntüleyin. Mahalle, ulaşım, altyapı ve çevre faktörlerini değerlendirin.',
      },
      {
        name: 'Ekspertiz ve Hukuki Kontrol',
        text: 'Emlak ekspertiz raporu alın. Tapu durumu, ipotek, yasal durumlar ve belgeleri kontrol edin.',
      },
      {
        name: 'Sözleşme ve Ödeme',
        text: 'Satış sözleşmesini imzalayın. Ödeme planınızı belirleyin ve gerekli ödemeleri yapın.',
      },
      {
        name: 'Tapu İşlemleri',
        text: 'Tapu devir işlemlerini tamamlayın. Noter masrafları ve diğer yasal işlemleri gerçekleştirin.',
      },
    ],
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={howToSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <header className="text-center mb-12 lg:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ev Nasıl Alınır?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ev almak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, değerlendirme, sözleşme ve tapu işlemleri hakkında kapsamlı rehber.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Step 1: Bütçe Belirleme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Bütçe Belirleme</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ev almak için öncelikle bütçenizi belirlemeniz gerekir. Bu, arama sürecinizi daraltır ve zaman kaybını önler.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gelir analizi:</strong> Aylık gelirinizi ve giderlerinizi hesaplayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kredi hesaplama:</strong> Alabileceğiniz kredi tutarını öğrenin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ek masraflar:</strong> Tapu, noter, ekspertiz, taşınma masraflarını hesaplayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Rezerv bütçe:</strong> Beklenmeyen masraflar için rezerv bırakın</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href={`${basePath}/kredi-hesaplayici`}>
                      <Button className="w-full md:w-auto">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Kredi Hesaplayıcıyı Kullan
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Step 2: Ev Arama */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Ev Arama</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Doğru evi bulmak için sistematik bir arama yapın:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Online arama:</strong> Emlak sitelerinde detaylı arama yapın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Emlak danışmanı:</strong> Profesyonel bir emlak danışmanından destek alın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Bölge araştırması:</strong> İstediğiniz bölgeleri önceden araştırın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Filtreleme:</strong> Fiyat, konum, özellikler gibi kriterlere göre filtreleyin</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 3: Görüntüleme ve Değerlendirme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Home className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Görüntüleme ve Değerlendirme</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Ev görüntüleme sırasında dikkat edilmesi gerekenler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı durumu:</strong> Yapının genel durumunu kontrol edin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Çevre:</strong> Mahalle, komşular, ulaşım imkanlarını değerlendirin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Belgeler:</strong> Tapu, iskan, yapı ruhsatı gibi belgeleri kontrol edin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ekspertiz:</strong> Gerekirse ekspertiz yaptırın</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 4: Sözleşme ve Ön Ödeme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
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
                      <span><strong>Ön sözleşme:</strong> Satıcı ile ön sözleşme imzalayın ve kapora verin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kredi başvurusu:</strong> Kredi başvurunuzu yapın ve onay bekleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Noter sözleşmesi:</strong> Noterde satış sözleşmesi imzalayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ödeme planı:</strong> Ödeme şeklini belirleyin</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 5: Tapu Devri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <Key className="h-6 w-6 text-red-600" />
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
                      <span><strong>Gerekli belgeler:</strong> Kimlik, tapu, kredi belgeleri, vergi levhası</span>
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
                      <span><strong>Enerji kimlik belgesi:</strong> EKB belgesini kontrol edin</span>
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
                        <li>• Emlak danışmanı ile çalışmak, süreci hızlandırır ve riskleri azaltır</li>
                        <li>• Tüm belgeleri önceden hazırlayın ve kontrol edin</li>
                        <li>• Evin değerini mutlaka ekspertiz ile doğrulayın</li>
                        <li>• Sözleşmeleri mutlaka noterde imzalayın</li>
                        <li>• Vergi ve masrafları önceden hesaplayın</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Links */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Rehberler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href={`${basePath}/rehberler/kredi-nasil-alinir`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Konut Kredisi Nasıl Alınır?</h3>
                    <p className="text-sm text-gray-600">Kredi başvuru süreci ve gerekli belgeler</p>
                  </Link>
                  <Link href={`${basePath}/rehberler/tapu-islemleri`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tapu İşlemleri</h3>
                    <p className="text-sm text-gray-600">Tapu devir süreci ve masraflar</p>
                  </Link>
                  <Link href={`${basePath}/rehberler/ekspertiz-sureci`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ekspertiz Süreci</h3>
                    <p className="text-sm text-gray-600">Emlak değerleme ve ekspertiz</p>
                  </Link>
                  <Link href={`${basePath}/rehberler/emlak-vergisi`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Emlak Vergisi</h3>
                    <p className="text-sm text-gray-600">Emlak vergisi hesaplama ve ödeme</p>
                  </Link>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Evinizi Almak İster misiniz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman emlak danışmanlarımız, hayalinizdeki evi bulmanız için size rehberlik eder. Ücretsiz danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/satilik`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Satılık İlanları İncele
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
