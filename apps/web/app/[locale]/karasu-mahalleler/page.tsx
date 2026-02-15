import { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import Link from 'next/link';
import { MapPin, Home, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { getNeighborhoods } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Mahalleler | Tüm Mahalleler ve Özellikleri | Karasu Emlak',
    description: 'Karasu mahalleleri hakkında detaylı bilgiler. Merkez, Sahil, Yalı, Aziziye, Cumhuriyet, Atatürk ve diğer mahallelerin özellikleri, fiyatları ve yatırım potansiyeli.',
    keywords: [
      'karasu mahalleler',
      'karasu mahalleleri',
      'karasu merkez mahalle',
      'karasu sahil mahalle',
      'karasu mahalle rehberi',
      'karasu mahalle fiyatları',
      'sakarya karasu mahalleler',
    ],
    alternates: {
      canonical: `${basePath}/karasu-mahalleler`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu-mahalleler',
        'en': '/en/karasu-mahalleler',
        'et': '/et/karasu-mahalleler',
        'ru': '/ru/karasu-mahalleler',
        'ar': '/ar/karasu-mahalleler',
      }),
    },
    openGraph: {
      title: 'Karasu Mahalleler | Tüm Mahalleler ve Özellikleri',
      description: 'Karasu mahalleleri hakkında detaylı bilgiler, özellikleri ve yatırım potansiyeli.',
      url: `${siteConfig.url}${basePath}/karasu-mahalleler`,
      type: 'website',
    },
  };
}

const mahalleBilgileri = [
  {
    slug: 'merkez',
    name: 'Merkez',
    description: 'Karasu\'nun kalbi, tüm hizmetlere yakın konum',
    features: ['Tüm hizmetlere yakın', 'Yoğun nüfus', 'Yüksek talep'],
  },
  {
    slug: 'sahil',
    name: 'Sahil',
    description: 'Denize sıfır konum, yazlık ve tatil evleri',
    features: ['Denize sıfır', 'Yazlık evler', 'Turizm potansiyeli'],
  },
  {
    slug: 'yali',
    name: 'Yalı',
    description: 'Deniz manzaralı lüks konutlar',
    features: ['Deniz manzarası', 'Lüks konutlar', 'Yüksek fiyat'],
  },
  {
    slug: 'aziziye',
    name: 'Aziziye',
    description: 'Sakin ve huzurlu yaşam alanı',
    features: ['Sakin mahalle', 'Aile dostu', 'Uygun fiyat'],
  },
  {
    slug: 'cumhuriyet',
    name: 'Cumhuriyet',
    description: 'Merkeze yakın, gelişen mahalle',
    features: ['Merkeze yakın', 'Gelişen bölge', 'Orta fiyat'],
  },
  {
    slug: 'ataturk',
    name: 'Atatürk',
    description: 'Tarihi ve kültürel değeri yüksek mahalle',
    features: ['Tarihi değer', 'Kültürel zenginlik', 'Orta-yüksek fiyat'],
  },
  {
    slug: 'bota',
    name: 'Bota',
    description: 'Doğal güzellikler ve sakin yaşam',
    features: ['Doğal güzellik', 'Sakin yaşam', 'Uygun fiyat'],
  },
  {
    slug: 'liman',
    name: 'Liman',
    description: 'Liman bölgesi, ticari aktivite',
    features: ['Liman yakını', 'Ticari aktivite', 'Orta fiyat'],
  },
  {
    slug: 'camlik',
    name: 'Çamlık',
    description: 'Yeşil alanlar ve doğa',
    features: ['Yeşil alan', 'Doğa', 'Sakin yaşam'],
  },
  {
    slug: 'kurtulus',
    name: 'Kurtuluş',
    description: 'Merkeze yakın, erişilebilir mahalle',
    features: ['Merkeze yakın', 'Erişilebilir', 'Orta fiyat'],
  },
];

export default async function KarasuMahallelerPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Mahalleler', href: `${basePath}/karasu-mahalleler` },
  ];

  // Fetch neighborhoods from database
  let neighborhoods: string[] = [];
  try {
    const result = await withTimeout(getNeighborhoods(), 2000, [] as string[]);
    neighborhoods = result || [];
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <header className="mb-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Karasu Mahalleler
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl">
                Karasu'nun tüm mahalleleri hakkında detaylı bilgiler, özellikleri ve yatırım potansiyeli. Her mahalle için satılık ve kiralık ilanları.
              </p>
            </ScrollReveal>
          </header>

          {/* Mahalle Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mahalleBilgileri.map((mahalle, index) => {
              const gradientColors = [
                'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400',
                'from-green-50 to-green-100 border-green-200 hover:border-green-400',
                'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400',
                'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400',
                'from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400',
                'from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-400',
                'from-teal-50 to-teal-100 border-teal-200 hover:border-teal-400',
                'from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-400',
                'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400',
                'from-rose-50 to-rose-100 border-rose-200 hover:border-rose-400',
              ];
              const gradientClass = gradientColors[index % gradientColors.length];
              const [bgFrom, bgTo, borderColor, hoverBorder] = gradientClass.split(' ');
              
              return (
                <ScrollReveal key={mahalle.slug} direction="up" delay={100 + index * 50}>
                  <Link
                    href={`${basePath}/karasu/${mahalle.slug}`}
                    className={`group block bg-gradient-to-br ${bgFrom} ${bgTo} rounded-2xl border-2 ${borderColor} ${hoverBorder} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all shadow-md">
                          <MapPin className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {mahalle.name}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {mahalle.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mahalle.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                      <Link
                        href={`${basePath}/karasu/${mahalle.slug}?status=satilik`}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm group/link"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/link:bg-primary/20 transition-colors">
                          <Home className="h-4 w-4" />
                        </div>
                        <span>Satılık</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                      </Link>
                      <Link
                        href={`${basePath}/karasu/${mahalle.slug}?status=kiralik`}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm group/link"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/link:bg-primary/20 transition-colors">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span>Kiralık</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Karşılaştırma Bölümü */}
          <ScrollReveal direction="up" delay={600}>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-10 border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-md">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Mahalleleri Karşılaştırın
                </h2>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
                  Karasu mahallelerini fiyat, konum ve özellikler açısından detaylı olarak karşılaştırın ve en uygun mahalleyi bulun.
                </p>
              </div>
              <div className="text-center">
                <Link
                  href={`${basePath}/karasu/mahalle-karsilastirma`}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark hover:shadow-xl transition-all duration-300 font-semibold text-lg transform hover:-translate-y-0.5"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Mahalle Karşılaştırma Sayfasına Git</span>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
