import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { TrendingUp, CheckCircle, AlertCircle, DollarSign, Target, BarChart3, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@karasu/ui';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/yatirim-yapma' : `/${locale}/rehberler/yatirim-yapma`;

  return {
    title: 'Emlak Yatırımı Nasıl Yapılır? | Yatırım Stratejileri Rehberi | Karasu Emlak',
    description: 'Emlak yatırımı yapmak için bilmeniz gereken her şey. Yatırım stratejileri, risk analizi, karlı yatırım fırsatları ve uzun vadeli planlama. Uzman emlak danışmanlarından profesyonel rehber.',
    keywords: [
      'emlak yatırımı nasıl yapılır',
      'emlak yatırım stratejileri',
      'emlak yatırım rehberi',
      'karlı emlak yatırımı',
      'yatırım risk analizi',
      'kira getirisi',
      'emlak yatırım fırsatları',
      'karasu emlak yatırımı',
      'emlak yatırım danışmanlığı',
      'yatırım planlama',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/rehberler/yatirim-yapma',
        'en': '/en/rehberler/yatirim-yapma',
        'et': '/et/rehberler/yatirim-yapma',
        'ru': '/ru/rehberler/yatirim-yapma',
        'ar': '/ar/rehberler/yatirim-yapma',
      },
    },
    openGraph: {
      title: 'Emlak Yatırımı Nasıl Yapılır? | Yatırım Stratejileri Rehberi',
      description: 'Emlak yatırımı yapmak için bilmeniz gereken her şey. Profesyonel yatırım rehberi.',
      type: 'article',
    },
  };
}

export default async function YatirimYapmaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Yatırım Yapma', href: `${basePath}/rehberler/yatirim-yapma` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Emlak Yatırımı Nasıl Yapılır? | Yatırım Stratejileri Rehberi',
    description: 'Emlak yatırımı yapmak için bilmeniz gereken her şey. Yatırım stratejileri, risk analizi, karlı yatırım fırsatları ve uzun vadeli planlama.',
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
              Emlak Yatırımı Nasıl Yapılır?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Emlak yatırımı yapmak için bilmeniz gereken her şey. Yatırım stratejileri, risk analizi, karlı yatırım fırsatları ve uzun vadeli planlama hakkında kapsamlı rehber.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Step 1: Yatırım Hedefi Belirleme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">1. Yatırım Hedefi Belirleme</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Yatırım yapmadan önce hedeflerinizi netleştirin:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kısa vadeli:</strong> Hızlı kazanç için al-sat stratejisi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Uzun vadeli:</strong> Kira getirisi ve değer artışı</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Bütçe:</strong> Yatırım bütçenizi belirleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Risk toleransı:</strong> Risk seviyenizi değerlendirin</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 2: Piyasa Araştırması */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">2. Piyasa Araştırması</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Yatırım yapmadan önce piyasayı detaylı araştırın:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Bölge analizi:</strong> Bölgenin gelişim potansiyelini değerlendirin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Fiyat trendleri:</strong> Fiyat artış trendlerini inceleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kira piyasası:</strong> Kira getirisi potansiyelini araştırın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Altyapı projeleri:</strong> Gelecek projeleri takip edin</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 3: Risk Analizi */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Risk Analizi</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Yatırım risklerini değerlendirin:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Piyasa riski:</strong> Piyasa dalgalanmalarını değerlendirin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Likidite riski:</strong> Satış zorluğu riskini göz önünde bulundurun</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı riski:</strong> Yapı güvenliği ve bakım maliyetleri</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kiracı riski:</strong> Kiracı bulma ve kira ödemesi riskleri</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 4: Yatırım Stratejileri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Yatırım Stratejileri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Vadeli Yatırım</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Flipping (al-sat) stratejisi</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Yenileme ve satış</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Piyasa fırsatlarını takip etme</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Uzun Vadeli Yatırım</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Kira getirisi odaklı yatırım</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Değer artışı beklentisi</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Bölgesel gelişim projelerini takip</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 5: Getiri Hesaplama */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Getiri Hesaplama</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Yatırım getirisini hesaplayın:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kira getirisi:</strong> Yıllık kira geliri / yatırım tutarı x 100</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Değer artışı:</strong> Beklenen değer artışını hesaplayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Toplam getiri:</strong> Kira getirisi + değer artışı</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Masraflar:</strong> Vergi, bakım, yönetim masraflarını çıkarın</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href={`${basePath}/yatirim-hesaplayici`}>
                      <Button className="w-full md:w-auto">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Yatırım Hesaplayıcıyı Kullan
                      </Button>
                    </Link>
                  </div>
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
                        <li>• Yatırım yapmadan önce mutlaka uzman danışmanlık alın</li>
                        <li>• Piyasa araştırması yapın ve trendleri takip edin</li>
                        <li>• Risk analizi yapın ve bütçenizi aşmayın</li>
                        <li>• Uzun vadeli planlama yapın</li>
                        <li>• Diversifikasyon stratejisi uygulayın</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Links */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Rehberler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href={`${basePath}/rehber/yatirim`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Emlak Yatırım Rehberi</h3>
                    <p className="text-sm text-gray-600">Detaylı yatırım rehberi</p>
                  </Link>
                  <Link href={`${basePath}/yatirim-hesaplayici`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Yatırım Hesaplayıcı</h3>
                    <p className="text-sm text-gray-600">Getiri hesaplama aracı</p>
                  </Link>
                  <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Yatırımlık Gayrimenkul</h3>
                    <p className="text-sm text-gray-600">Karasu yatırım fırsatları</p>
                  </Link>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Yatırım Yapmak İster misiniz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman emlak danışmanlarımız, karlı yatırım fırsatlarını bulmanız için size rehberlik eder. Ücretsiz danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/yatirim`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Yatırım Fırsatlarını İncele
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
