import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { Receipt, CheckCircle, AlertCircle, Calculator, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@karasu/ui';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/emlak-vergisi' : `/${locale}/rehberler/emlak-vergisi`;

  return {
    title: 'Emlak Vergisi Rehberi | Emlak Vergisi Hesaplama ve Ödeme | Karasu Emlak',
    description: 'Emlak vergisi hakkında bilmeniz gereken her şey. Emlak vergisi nedir, nasıl hesaplanır, ne zaman ödenir, muafiyetler ve indirimler. 2024 güncel bilgiler.',
    keywords: [
      'emlak vergisi',
      'emlak vergisi hesaplama',
      'emlak vergisi ödeme',
      'emlak vergisi oranları',
      'emlak vergisi muafiyeti',
      'emlak vergisi ne zaman ödenir',
      'karasu emlak vergisi',
      'gayrimenkul vergisi',
      'emlak vergisi rehberi',
      'emlak vergisi 2024',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/rehberler/emlak-vergisi',
        'en': '/en/rehberler/emlak-vergisi',
        'et': '/et/rehberler/emlak-vergisi',
        'ru': '/ru/rehberler/emlak-vergisi',
        'ar': '/ar/rehberler/emlak-vergisi',
      },
    },
    openGraph: {
      title: 'Emlak Vergisi Rehberi | Hesaplama ve Ödeme',
      description: 'Emlak vergisi hakkında bilmeniz gereken her şey. Emlak vergisi nedir, nasıl hesaplanır ve ne zaman ödenir.',
      type: 'article',
    },
  };
}

export default async function EmlakVergisiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Emlak Vergisi', href: `${basePath}/rehberler/emlak-vergisi` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Emlak Vergisi Rehberi | Hesaplama ve Ödeme',
    description: 'Emlak vergisi hakkında bilmeniz gereken her şey. Emlak vergisi nedir, nasıl hesaplanır, ne zaman ödenir ve muafiyetler.',
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
              Emlak Vergisi Rehberi
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Emlak vergisi hakkında bilmeniz gereken her şey. Emlak vergisi nedir, nasıl hesaplanır, ne zaman ödenir, muafiyetler ve indirimler. 2024 güncel bilgiler.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Emlak Vergisi Nedir */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Emlak Vergisi Nedir?</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Emlak vergisi, Türkiye\'de bulunan gayrimenkuller için belediyeler tarafından alınan bir vergidir. Her yıl düzenli olarak ödenmesi gereken bir yükümlülüktür.
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vergi mükellefi:</strong> Gayrimenkulün sahibi veya kullanıcısı</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vergi oranı:</strong> Gayrimenkulün rayiç değerine göre belirlenir</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ödeme:</strong> Yılda iki taksit halinde ödenir</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Hesaplama */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Emlak Vergisi Hesaplama</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Emlak vergisi, gayrimenkulün rayiç değerine göre hesaplanır:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Konut:</strong> Rayiç değerin %0.1\'i (2024)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>İşyeri:</strong> Rayiç değerin %0.2\'si</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Arsa:</strong> Rayiç değerin %0.1\'i</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Diğer:</strong> Rayiç değerin %0.1\'i</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Ödeme Tarihleri */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Ödeme Tarihleri</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Emlak vergisi yılda iki taksit halinde ödenir:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>İlk taksit:</strong> Mart-Nisan aylarında (ödenebilir)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>İkinci taksit:</strong> Kasım ayında (ödenebilir)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gecikme faizi:</strong> Vadesinde ödenmeyen vergiler için gecikme faizi uygulanır</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Muafiyetler */}
              <section className="mb-12">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Emlak Vergisi Muafiyetleri</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• 65 yaş üstü mükellefler (tek konut için)</li>
                    <li>• Engelli vatandaşlar (tek konut için)</li>
                    <li>• Şehit ve gazi yakınları</li>
                    <li>• 200 m²\'nin altındaki konutlar (bazı belediyelerde)</li>
                  </ul>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Emlak Vergisi Hakkında Sorularınız mı Var?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman ekibimiz, emlak vergisi ve diğer yasal süreçler hakkında size rehberlik eder.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Danışmanlık Al
                    </Button>
                  </Link>
                  <Link href={`${basePath}/rehberler`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Diğer Rehberler
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
