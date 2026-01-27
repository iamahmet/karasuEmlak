import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent, Button } from '@karasu/ui';
import Link from 'next/link';
import { Phone, MapPin, Car, Bus, Plane, ExternalLink, Navigation, Clock, Route, Map, Train, Ship, Navigation2, Award, ChevronRight, Utensils } from 'lucide-react';
import { KARASU_ULASIM_YOLLARI, KARASU_ULASIM_BILGILERI } from '@/lib/local-info/karasu-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'İstanbul\'dan Karasu\'ya nasıl gidilir?',
    answer: `İstanbul'dan Karasu'ya ${KARASU_ULASIM_YOLLARI.istanbul.mesafe} mesafe, yaklaşık ${KARASU_ULASIM_YOLLARI.istanbul.sure} sürmektedir. Yavuz Sultan Selim Köprüsü ve Karadeniz Sahil Yolu üzerinden ulaşım sağlanmaktadır. Özel araç ile en hızlı ve konforlu ulaşım yöntemidir. Alternatif olarak Sakarya Otobüs Terminali üzerinden otobüs ile de ulaşım mümkündür.`,
  },
  {
    question: 'Karasu\'ya otobüs ile nasıl gidilir?',
    answer: 'Karasu\'ya Sakarya Otobüs Terminali üzerinden ulaşım sağlanmaktadır. Sakarya\'dan Karasu\'ya düzenli otobüs seferleri bulunmaktadır. İstanbul\'dan önce Sakarya\'ya gelip, oradan Karasu\'ya geçebilirsiniz. Otobüs seferleri gün içinde düzenli aralıklarla yapılmaktadır.',
  },
  {
    question: 'Karasu\'ya en yakın havalimanı hangisi?',
    answer: 'Karasu\'ya en yakın havalimanı İstanbul Havalimanı\'dır. Yaklaşık 1.5 saat mesafededir. Sabiha Gökçen Havalimanı ise 2 saat mesafededir. Havalimanından Karasu\'ya özel transfer, taksi veya araç kiralama ile ulaşım sağlanabilir.',
  },
  {
    question: 'Karasu\'ya özel araçla nasıl gidilir?',
    answer: 'Karasu\'ya özel araçla ulaşım için Yavuz Sultan Selim Köprüsü ve Karadeniz Sahil Yolu kullanılabilir. İstanbul\'dan yaklaşık 1.5 saat, Sakarya\'dan 45 dakika sürmektedir. Yol boyunca manzaralı bir rota sunmaktadır. Özellikle yaz aylarında trafik yoğunluğu olabilir.',
  },
  {
    question: 'Karasu\'da park yeri var mı?',
    answer: 'Evet, Karasu\'da merkez ve sahil bölgelerinde park yerleri bulunmaktadır. Özellikle yaz aylarında plaj bölgelerinde park yeri bulmak zor olabilir. Merkez bölgede ücretli ve ücretsiz park alanları mevcuttur.',
  },
  {
    question: 'Karasu\'ya toplu taşıma ile nasıl gidilir?',
    answer: 'Karasu\'ya toplu taşıma ile ulaşım için önce Sakarya\'ya gelmeniz gerekmektedir. Sakarya\'dan Karasu\'ya minibüs ve otobüs seferleri bulunmaktadır. Karasu içinde de minibüs hatları mevcuttur.',
  },
  {
    question: 'Karasu\'ya en uygun ulaşım yöntemi nedir?',
    answer: 'Karasu\'ya ulaşım için en uygun yöntem özel araçtır. İstanbul\'dan yaklaşık 1.5 saat sürmektedir ve esneklik sağlar. Otobüs ile ulaşım daha ekonomik bir seçenektir. Havalimanından gelenler için özel transfer veya araç kiralama önerilir.',
  },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'otobus':
      return Bus;
    case 'taksi':
      return Car;
    case 'havaalani':
      return Plane;
    default:
      return Car;
  }
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Ulaşım Bilgileri | Nasıl Gidilir? | Karasu Emlak',
    description: 'Karasu\'ya nasıl gidilir? İstanbul, Sakarya ve Ankara\'dan Karasu\'ya ulaşım bilgileri. Otobüs, taksi ve havalimanı bilgileri.',
    keywords: [
      'karasu ulaşım',
      'karasu nasıl gidilir',
      'karasu otobüs',
      'karasu taksi',
      'istanbul karasu ulaşım',
      'karasu havalimanı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karasu/ulasim`,
      languages: {
        'tr': '/karasu/ulasim',
        'en': '/en/karasu/ulasim',
        'et': '/et/karasu/ulasim',
        'ru': '/ru/karasu/ulasim',
        'ar': '/ar/karasu/ulasim',
      },
    },
    openGraph: {
      title: 'Karasu Ulaşım Bilgileri | Nasıl Gidilir?',
      description: 'Karasu\'ya ulaşım bilgileri: Otobüs, taksi, havalimanı ve karayolu bilgileri.',
      url: `${siteConfig.url}${basePath}/karasu/ulasim`,
      type: 'website',
    },
  };
}

export default async function UlasimPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Karasu', href: `${basePath}/karasu` },
            { label: 'Ulaşım', href: `${basePath}/karasu/ulasim` },
          ]}
          className="mb-6"
        />

        {/* Hero Section - Modern & Minimal */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 md:p-12 lg:p-16">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}></div>
            </div>
            
            <div className="relative z-10">
              {/* Location Badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Navigation className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Karasu, Sakarya</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Karasu Ulaşım Bilgileri
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Karasu'ya nasıl gidilir? İstanbul, Sakarya ve Ankara'dan Karasu'ya ulaşım bilgileri. Özel araç, otobüs, taksi ve havalimanı bilgileri ile detaylı yol tarifleri.
              </p>
              
              {/* Transport Types */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Car className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Özel Araç</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Bus className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Otobüs</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Plane className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Havalimanı</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Train className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tren</span>
                </div>
              </div>

              {/* Accent Line */}
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Ulaşım Yolları - Modern Design */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <Route className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Ulaşım Yolları
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Şehirlerden Karasu'ya ulaşım bilgileri
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(KARASU_ULASIM_YOLLARI).map(([sehir, bilgi]) => (
              <Card key={sehir} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
                      {sehir === 'istanbul' ? 'İstanbul' : sehir === 'sakarya' ? 'Sakarya' : 'Ankara'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mesafe</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{bilgi.mesafe}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Süre</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{bilgi.sure}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-2 mb-2">
                        <Route className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Yol</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{bilgi.yol}</p>
                    </div>
                    {bilgi.aciklama && (
                      <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 dark:border-primary/20">
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {bilgi.aciklama}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Ulaşım Araçları - Modern Design */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Bus className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Ulaşım Araçları
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Otobüs, taksi ve diğer ulaşım seçenekleri
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KARASU_ULASIM_BILGILERI.map((bilgi) => {
              const Icon = getIconForType(bilgi.type);
              return (
                <Card key={bilgi.name} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/20 dark:border-primary/30">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                          {bilgi.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                          {bilgi.aciklama}
                        </p>
                        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {bilgi.phone && (
                            <a
                              href={`tel:${bilgi.phone.replace(/\s/g, '')}`}
                              className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-primary-light font-medium transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {bilgi.phone}
                            </a>
                          )}
                          {bilgi.web && (
                            <a
                              href={bilgi.web}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-primary-light font-medium transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Web Sitesi
                            </a>
                          )}
                          {bilgi.saatler && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span><strong>Çalışma Saatleri:</strong> {bilgi.saatler}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ - Modern Design */}
        <section id="sss" className="mb-16 scroll-mt-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Award className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Sık Sorulan Sorular
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold pr-4 text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Related Links - Modern Design */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">İlgili Sayfalar</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Karasu hakkında daha fazla bilgi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`${basePath}/karasu/gezilecek-yerler`} className="group border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Gezilecek Yerler</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Karasu turistik yerler</p>
            </Link>
            <Link href={`${basePath}/karasu/restoranlar`} className="group border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Restoranlar</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Yeme-içme mekanları</p>
            </Link>
            <Link href={`${basePath}/karasu`} className="group border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Map className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Karasu Rehberi</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tüm Karasu bilgileri</p>
            </Link>
            <Link href={`${basePath}/karasu/hastaneler`} className="group border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Hastaneler</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sağlık kuruluşları</p>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

