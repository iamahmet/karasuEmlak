import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Phone, MapPin, Utensils } from 'lucide-react';
import { KOCAALI_RESTORANLAR } from '@/lib/local-info/kocaali-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Kocaali\'de nerede balık yenir?',
    answer: 'Kocaali\'de balık yemek için en iyi yerler sahil mahallesindeki balık restoranlarıdır. Taze balık ve deniz ürünleri ile ünlüdür.',
  },
  {
    question: 'Kocaali\'de kahvaltı nerede yapılır?',
    answer: 'Kocaali\'de geleneksel Türk kahvaltısı sunan birçok kahvaltı salonu bulunmaktadır. Merkez ve Sahil mahallelerinde birçok seçenek mevcuttur.',
  },
  {
    question: 'Kocaali sahil kafeleri hangi saatlerde açık?',
    answer: 'Kocaali sahil kafeleri genellikle sabah 08:00\'de açılıp gece 23:00\'e kadar hizmet vermektedir. Yaz aylarında daha geç saatlere kadar açık olabilir.',
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
    title: 'Kocaali Restoranlar ve Yeme-İçme | En İyi Restoranlar | Karasu Emlak',
    description: 'Kocaali restoranlar, kafeler ve yeme-içme mekanları. Taze balık restoranları, kahvaltı salonları ve sahil kafeleri. Kocaali\'de nerede yenir?',
    keywords: [
      'kocaali restoranlar',
      'kocaali balık restoranı',
      'kocaali kafeler',
      'kocaali kahvaltı',
      'kocaali nerede yenir',
      'kocaali yeme içme',
      'sakarya kocaali restoran',
    ],
    alternates: {
      canonical: `${basePath}/kocaali/restoranlar`,
    },
    openGraph: {
      title: 'Kocaali Restoranlar ve Yeme-İçme | En İyi Restoranlar',
      description: 'Kocaali restoranlar, kafeler ve yeme-içme mekanları bilgileri.',
      url: `${siteConfig.url}${basePath}/kocaali/restoranlar`,
      type: 'website',
    },
  };
}

export default async function RestoranlarPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const restoranlar = KOCAALI_RESTORANLAR.filter(r => r.type === 'restoran' || r.type === 'balik-restorani');
  const kafeler = KOCAALI_RESTORANLAR.filter(r => r.type === 'kafe');
  const digerMekanlar = KOCAALI_RESTORANLAR.filter(r => !['restoran', 'balik-restorani', 'kafe'].includes(r.type));

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Restoranlar' },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 md:p-12 border border-blue-100">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Kocaali Restoranlar ve Yeme-İçme Rehberi
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mb-6">
              Kocaali, özellikle taze balık ve deniz ürünleri ile ünlü bir sahil ilçesidir. Sahil mahallesinde bulunan balık restoranları, her mevsim taze deniz ürünleri sunmaktadır. İşte Kocaali'de en iyi restoranlar, kafeler ve yeme-içme mekanları.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Utensils className="h-5 w-5 text-primary" />
                <span>{restoranlar.length} Restoran</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Utensils className="h-5 w-5 text-primary" />
                <span>{kafeler.length} Kafe</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Sahil Mahallesi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Balık Restoranları - Featured Section */}
        {restoranlar.filter(r => r.type === 'balik-restorani').length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Balık Restoranları
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Kocaali sahil mahallesinde bulunan balık restoranları, hem doğal ortam hem de taze balık sunmaktadır.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restoranlar.filter(r => r.type === 'balik-restorani').map((restoran) => (
                <Card key={restoran.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          {restoran.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {restoran.aciklama || 'Taze balık ve deniz ürünleri ile ünlü restoran.'}
                        </p>
                        {restoran.ozellikler && restoran.ozellikler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {restoran.ozellikler.map((ozellik, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {ozellik}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{restoran.adres}</span>
                          </div>
                          {restoran.telefon && (
                            <a
                              href={`tel:${restoran.telefon.replace(/\s/g, '')}`}
                              className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {restoran.telefon}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Diğer Restoranlar */}
        {restoranlar.filter(r => r.type === 'restoran').length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Restoranlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restoranlar.filter(r => r.type === 'restoran').map((restoran) => (
                <Card key={restoran.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-8 h-8 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          {restoran.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {restoran.aciklama || 'Kocaali\'de lezzetli yemekler sunan restoran.'}
                        </p>
                        {restoran.ozellikler && restoran.ozellikler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {restoran.ozellikler.map((ozellik, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium"
                              >
                                {ozellik}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{restoran.adres}</span>
                          </div>
                          {restoran.telefon && (
                            <a
                              href={`tel:${restoran.telefon.replace(/\s/g, '')}`}
                              className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {restoran.telefon}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Sahil Kafeleri */}
        {kafeler.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                Sahil Kafeleri
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Kocaali sahil şeridinde bulunan kafeler, hem deniz manzarası hem de taze içecekler sunmaktadır. Özellikle yaz aylarında tercih edilmektedir.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kafeler.map((kafe) => (
                <Card key={kafe.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-8 h-8 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">
                          {kafe.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {kafe.aciklama || 'Deniz kenarında keyifli vakit geçirebileceğiniz kafe.'}
                        </p>
                        {kafe.ozellikler && kafe.ozellikler.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {kafe.ozellikler.map((ozellik, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium"
                              >
                                {ozellik}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{kafe.adres}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Kahvaltı Salonları ve Diğer Mekanlar */}
        {digerMekanlar.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Kahvaltı Salonları ve Diğer Mekanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digerMekanlar.map((mekan) => (
                <Card key={mekan.name} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mb-3">
                      <Utensils className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {mekan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {mekan.aciklama || 'Kocaali\'de hizmet veren yeme-içme mekanı.'}
                    </p>
                    {mekan.ozellikler && mekan.ozellikler.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mekan.ozellikler.slice(0, 3).map((ozellik, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium"
                          >
                            {ozellik}
                          </span>
                        ))}
                      </div>
                    )}
                    {mekan.adres && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2 text-xs">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{mekan.adres}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Balık Mevsimleri ve Öneriler */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-900">
            Balık Mevsimleri ve Öneriler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Mevsimsel Balık Çeşitleri</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>İlkbahar:</strong> Levrek, çupra</li>
                <li><strong>Yaz:</strong> Palamut, lüfer</li>
                <li><strong>Sonbahar:</strong> Hamsi</li>
                <li><strong>Kış:</strong> Mezgit, istavrit</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Restoran Seçimi İpuçları</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Balığın taze olup olmadığını kontrol edin</li>
                <li>• Denize yakın restoranlar genellikle daha taze balık sunar</li>
                <li>• Özellikle yaz aylarında rezervasyon yaptırın</li>
                <li>• Fiyatları önceden sorun</li>
              </ul>
            </div>
          </div>
        </section>

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
