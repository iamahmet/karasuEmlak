import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { Home, CheckCircle, AlertCircle, FileText, DollarSign, Search, Key, Calendar } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/ev-nasil-kiralanir' : `/${locale}/rehberler/ev-nasil-kiralanir`;

  return {
    title: 'Ev Nasıl Kiralanır? | Adım Adım Kiralama Rehberi | Karasu Emlak',
    description: 'Ev kiralamak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, kira sözleşmesi ve taşınma süreçleri. Uzman emlak...',
    keywords: [
      'ev nasıl kiralanır',
      'ev kiralama rehberi',
      'kira sözleşmesi',
      'ev kiralama süreci',
      'kiracı hakları',
      'depozito',
      'kira artış oranı',
      'karasu kiralık ev',
      'emlak kiralama danışmanlığı',
      'ev kiralama adımları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/ev-nasil-kiralanir',
        'en': '/en/rehberler/ev-nasil-kiralanir',
        'et': '/et/rehberler/ev-nasil-kiralanir',
        'ru': '/ru/rehberler/ev-nasil-kiralanir',
        'ar': '/ar/rehberler/ev-nasil-kiralanir',
      }),
    },
    openGraph: {
      title: 'Ev Nasıl Kiralanır? | Adım Adım Kiralama Rehberi',
      description: 'Ev kiralamak için bilmeniz gereken her şey. Profesyonel kiralama rehberi.',
      type: 'article',
    },
  };
}

export default async function EvNasilKiralanirPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Ev Nasıl Kiralanır?', href: `${basePath}/rehberler/ev-nasil-kiralanir` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Ev Nasıl Kiralanır? | Adım Adım Kiralama Rehberi',
    description: 'Ev kiralamak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, kira sözleşmesi ve taşınma süreçleri.',
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
              Ev Nasıl Kiralanır?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ev kiralamak için bilmeniz gereken her şey. Bütçe belirleme, ev arama, görüntüleme, kira sözleşmesi ve taşınma süreçleri hakkında kapsamlı rehber.
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
                    Ev kiralamak için öncelikle aylık kira bütçenizi belirlemeniz gerekir. Bu, arama sürecinizi daraltır.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Aylık kira:</strong> Gelirinizin %30-40\'ı kadar kira ödeyebilirsiniz</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Depozito:</strong> Genellikle 1-2 aylık kira tutarında depozito istenir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Aidat:</strong> Site aidatı ve ortak giderler</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Taşınma masrafları:</strong> Nakliye ve taşınma maliyetleri</span>
                    </li>
                  </ul>
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

              {/* Step 3: Görüntüleme */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Home className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">3. Görüntüleme</h2>
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
                      <span><strong>Eşya durumu:</strong> Eşyaların durumunu kontrol edin ve fotoğraflayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Çevre:</strong> Mahalle, komşular, ulaşım imkanlarını değerlendirin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Emlak sahibi:</strong> Emlak sahibinin kimliğini doğrulayın</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 4: Kira Sözleşmesi */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">4. Kira Sözleşmesi</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Kira sözleşmesi hazırlarken dikkat edilmesi gerekenler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Sözleşme şartları:</strong> Sözleşme şartlarını detaylı inceleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kira artış oranı:</strong> Yıllık kira artış oranını kontrol edin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Depozito:</strong> Depozito tutarını ve iade şartlarını belirleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Noter onayı:</strong> Sözleşmeyi noterde onaylatın</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Step 5: Taşınma */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">5. Taşınma</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Taşınma sürecinde yapılması gerekenler:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Taşınma tarihi:</strong> Taşınma tarihini belirleyin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Eşya listesi:</strong> Eşya listesini hazırlayın ve fotoğraflayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Nakliye:</strong> Güvenilir bir nakliye firması seçin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Adres değişikliği:</strong> Adres değişikliği yapın</span>
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
                        <li>• Kira sözleşmesini mutlaka okuyun ve anlayın</li>
                        <li>• Depozito tutarını ve iade şartlarını belirleyin</li>
                        <li>• Emlak sahibinin kimliğini doğrulayın</li>
                        <li>• Evin durumunu fotoğraflayın</li>
                        <li>• Kira artış oranını kontrol edin</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Links */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Rehberler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href={`${basePath}/rehberler/ev-nasil-alinir`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ev Nasıl Alınır?</h3>
                    <p className="text-sm text-gray-600">Ev alma süreci ve dikkat edilecekler</p>
                  </Link>
                  <Link href={`${basePath}/rehber/kiralama`} className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kiralama Rehberi</h3>
                    <p className="text-sm text-gray-600">Detaylı kiralama rehberi</p>
                  </Link>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Kiralık Ev mi Arıyorsunuz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman emlak danışmanlarımız, size uygun kiralık evi bulmanız için rehberlik eder. Ücretsiz danışmanlık hizmeti.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/kiralik`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Kiralık İlanları İncele
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
