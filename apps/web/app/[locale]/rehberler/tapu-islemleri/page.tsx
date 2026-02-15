import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import { FileText, CheckCircle, AlertCircle, Clock, Shield, DollarSign } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler/tapu-islemleri' : `/${locale}/rehberler/tapu-islemleri`;

  return {
    title: 'Tapu İşlemleri Rehberi | Tapu Devir, Harc ve Masraflar | Karasu Emlak',
    description: 'Tapu işlemleri hakkında bilmeniz gereken her şey. Tapu devir, tapu harcı, noter masrafları, gerekli belgeler ve süreçler. Uzman rehber.',
    keywords: [
      'tapu işlemleri',
      'tapu devir',
      'tapu harcı',
      'tapu masrafları',
      'tapu belgeleri',
      'tapu devir süreci',
      'noter tapu işlemleri',
      'karasu tapu işlemleri',
      'emlak tapu rehberi',
      'tapu devir ücreti',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/rehberler/tapu-islemleri',
        'en': '/en/rehberler/tapu-islemleri',
        'et': '/et/rehberler/tapu-islemleri',
        'ru': '/ru/rehberler/tapu-islemleri',
        'ar': '/ar/rehberler/tapu-islemleri',
      }),
    },
    openGraph: {
      title: 'Tapu İşlemleri Rehberi | Tapu Devir ve Masraflar',
      description: 'Tapu işlemleri hakkında bilmeniz gereken her şey. Tapu devir, tapu harcı ve gerekli belgeler.',
      type: 'article',
    },
  };
}

export default async function TapuIslemleriPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehberler', href: `${basePath}/rehberler` },
    { label: 'Tapu İşlemleri', href: `${basePath}/rehberler/tapu-islemleri` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Tapu İşlemleri Rehberi | Tapu Devir ve Masraflar',
    description: 'Tapu işlemleri hakkında bilmeniz gereken her şey. Tapu devir, tapu harcı, noter masrafları ve gerekli belgeler.',
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
              Tapu İşlemleri Rehberi
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tapu devir, tapu harcı, noter masrafları ve gerekli belgeler hakkında kapsamlı rehber. Emlak alım-satım sürecinde tapu işlemlerini adım adım öğrenin.
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              {/* Gerekli Belgeler */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Gerekli Belgeler</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Kimlik belgesi:</strong> Nüfus cüzdanı veya kimlik kartı (aslı ve fotokopisi)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Tapu belgesi:</strong> Mevcut tapu belgesi (aslı ve fotokopisi)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Yapı kullanma izni:</strong> İskan belgesi veya yapı kullanma izni</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Vergi levhası:</strong> Gelir vergisi levhası (varsa)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Enerji kimlik belgesi:</strong> EKB belgesi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Noter sözleşmesi:</strong> Satış sözleşmesi (noterden alınan)</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Tapu Devir Süreci */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Tapu Devir Süreci</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                      <div>
                        <strong>Noter sözleşmesi:</strong> Satış sözleşmesini noterde imzalayın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                      <div>
                        <strong>Tapu müdürlüğü:</strong> Tapu müdürlüğüne başvurun ve randevu alın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                      <div>
                        <strong>Belgeleri hazırlayın:</strong> Tüm gerekli belgeleri eksiksiz hazırlayın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</span>
                      <div>
                        <strong>Tapu devir işlemi:</strong> Tapu müdürlüğünde devir işlemini tamamlayın
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</span>
                      <div>
                        <strong>Yeni tapu:</strong> Yeni tapu belgesini alın
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* Masraflar */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Tapu Masrafları</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Tapu işlemlerinde ödemeniz gereken masraflar:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Tapu harcı:</strong> Gayrimenkul değerinin %2\'si (alıcı ve satıcı arasında paylaşılır)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Noter masrafları:</strong> Sözleşme tutarının %0.5-1\'i</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Emlak vergisi:</strong> Satış fiyatının %2\'si (satıcı öder)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ekspertiz ücreti:</strong> Banka kredisi için gerekli (yaklaşık 500-1000 TL)</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Önemli Notlar */}
              <section className="mb-12">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Önemli Notlar</h3>
                      <ul className="space-y-2 text-yellow-800">
                        <li>• Tapu işlemlerini mutlaka uzman bir emlak danışmanı ile yapın</li>
                        <li>• Tüm belgeleri önceden hazırlayın ve kontrol edin</li>
                        <li>• İpotek varsa önceden kaldırılmalı</li>
                        <li>• Masrafları önceden hesaplayın ve hazırlayın</li>
                        <li>• Tapu devir işlemi genellikle 1-2 hafta sürer</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Tapu İşlemlerinde Yardım mı İstiyorsunuz?</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Uzman ekibimiz, tapu işlemlerinizde size rehberlik eder. Ücretsiz danışmanlık hizmeti.
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
