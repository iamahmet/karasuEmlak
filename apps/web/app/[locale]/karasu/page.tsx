import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import { MapPin, Home, Building2, TrendingUp, Award, Waves, Mountain, BarChart3, Phone, ArrowRight, Shield, Clock, Users, Calendar, BookOpen, Landmark, Factory, GraduationCap, Heart, TreePine, Fish, Coffee } from 'lucide-react';
import Link from 'next/link';
import { getNeighborhoods, getListingStats, getFeaturedListings } from '@/lib/supabase/queries';
import { getNeighborhoodsWithImages, getNeighborhoodImageUrl } from '@/lib/supabase/queries/neighborhoods';
import { CardImage } from '@/components/images';
import { generateSlug } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generatePlaceSchema } from '@/lib/seo/local-seo-schemas';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

const MarketTrendsDashboard = dynamicImport(() => import('@/components/home/MarketTrendsDashboard').then(mod => ({ default: mod.MarketTrendsDashboard })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const TestimonialsWithSchema = dynamicImport(() => import('@/components/testimonials/TestimonialsWithSchema').then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const InteractiveMap = dynamicImport(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => <div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse" />,
});

const QuickToolsSection = dynamicImport(() => import('@/components/home/QuickToolsSection').then(mod => ({ default: mod.QuickToolsSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const WeatherWidget = dynamicImport(() => import('@/components/services/WeatherWidget').then(mod => ({ default: mod.WeatherWidget })), {
  loading: () => <div className="h-48 bg-white rounded-lg animate-pulse" />,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu' : `/${locale}/karasu`;
  
  return {
    title: 'Karasu Emlak | Satılık ve Kiralık Gayrimenkul | Karasu, Sakarya',
    description: 'Karasu\'da satılık ve kiralık gayrimenkul ilanları. 20 km kumsal, Acarlar Longozu ve İstanbul\'a yakınlığı ile Karasu emlak fiyatları ve seçenekleri.',
    keywords: [
      'karasu emlak',
      'karasu satılık ev',
      'karasu kiralık daire',
      'karasu yazlık',
      'karasu villa',
      'karasu gayrimenkul',
      'sakarya karasu emlak',
      'karasu plaj',
      'acarlar longozu',
      'karasu yatırım',
      'karasu emlak fiyatları',
      'karasu satılık daire',
      'karasu kiralık ev',
      'karasu mahalleleri',
      'karasu emlak danışmanlığı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/karasu',
        'en': '/en/karasu',
        'et': '/et/karasu',
        'ru': '/ru/karasu',
        'ar': '/ar/karasu',
      },
    },
    openGraph: {
      title: 'Karasu Emlak | Satılık ve Kiralık Gayrimenkul | Karasu, Sakarya',
      description: 'Karasu\'da satılık ve kiralık gayrimenkul ilanları. Denize sıfır konumlar, yazlık evler ve modern yaşam alanları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const karasuFAQs = [
  {
    question: 'Karasu\'da emlak fiyatları nasıl?',
    answer: 'Karasu\'da emlak fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
  },
  {
    question: 'Karasu\'da hangi mahalleler öne çıkıyor?',
    answer: 'Karasu\'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi gibi denize yakın bölgelerde ve diğer mahallelerde emlak seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.',
  },
  {
    question: 'Karasu yatırım için uygun mu?',
    answer: 'Evet, Karasu yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler ve denize yakın konumlar yatırımcıların ilgisini çekmektedir. Turizm potansiyeli ve İstanbul\'a yakınlığı ile uzun vadede değer kazanma potansiyeli yüksektir.',
  },
  {
    question: 'Karasu\'da yaşam nasıl?',
    answer: 'Karasu, sakin bir sahil ilçesi olarak doğal güzellikleri ve temiz havasıyla dikkat çeker. 20 km uzunluğundaki plajı, Acarlar Longozu ve İstanbul\'a yakınlığı ile hem yazlık hem de kalıcı yaşam için ideal bir bölgedir.',
  },
];

export default async function KarasuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch real data with timeout (3s max) - graceful degradation
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const neighborhoodsImagesResult = await withTimeout(getNeighborhoodsWithImages(12), 3000, []);
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const featuredListingsResult = await withTimeout(getFeaturedListings(6), 3000, []);
  const neighborhoods = neighborhoodsResult || [];
  const neighborhoodsWithImages = neighborhoodsImagesResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  const featuredListings = (featuredListingsResult || []) as Awaited<ReturnType<typeof getFeaturedListings>>;

  // Generate comprehensive local SEO schemas
  const placeSchema = generatePlaceSchema({
    name: 'Karasu',
    description: 'Karasu, Sakarya\'nın sahil ilçesi. 20 km plajı, Acarlar Longozu ve İstanbul\'a yakınlığı ile hem yazlık hem de kalıcı yaşam için ideal bir bölge.',
    address: {
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
      postalCode: '54500',
    },
    geo: {
      latitude: 41.0969,
      longitude: 30.6906,
    },
    url: `${siteConfig.url}${basePath}/karasu`,
    containedIn: {
      '@type': 'State',
      name: 'Sakarya',
    },
  });

  const faqSchema = generateFAQSchema(karasuFAQs);

  return (
    <>
      <StructuredData data={placeSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu', href: `${basePath}/karasu` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block - Modern Design */}
      <section className="py-8 bg-white dark:bg-gray-900 border-l-4 border-primary dark:border-primary-light rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Karasu</strong>, Sakarya'nın sahil ilçelerinden biri olarak denize sıfır konumları, 
              yazlık evleri ve modern yaşam alanları ile dikkat çeker. İstanbul'a yakınlığı, gelişmiş 
              altyapısı ve yüksek turizm potansiyeli ile hem sürekli oturum hem de yatırım amaçlı tercih 
              edilmektedir. Ortalama emlak fiyatları konum ve özelliklere göre değişmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
      {/* Hero Section - Modern & Minimal */}
        <section className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-20 md:py-32 overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/20 dark:border-primary/30">
                    Sakarya'nın İncisi
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                  Karasu
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Sakarya'nın incisi, Karadeniz'in sakin kıyısı. 20 km plajı, Acarlar Longozu ve zengin tarihi ile keşfedilmeyi bekleyen bir cennet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                    <Link href={`${basePath}/satilik`}>
                      <Home className="w-5 h-5 mr-2" />
                      Satılık İlanlar
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Link href={`${basePath}/kiralik`}>
                      <Building2 className="w-5 h-5 mr-2" />
                      Kiralık İlanlar
                    </Link>
                  </Button>
                </div>
                {/* Accent Line */}
                <div className="h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full mx-auto"></div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats Section - Modern Design */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 -mt-4 relative z-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Aktif İlan</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={50}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{neighborhoods.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mahalle</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.satilik}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Satılık</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={150}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.kiralik}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Kiralık</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
      </section>

        {/* About Karasu Section - History, Geography, Culture */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Karasu Hakkında
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın sahil ilçesi Karasu, zengin tarihi, doğal güzellikleri ve modern yaşam alanları ile öne çıkıyor.
                </p>
              </div>
            </ScrollReveal>

            {/* Tarih */}
            <div className="mb-16">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Tarih</h3>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      Karasu, tarihi MÖ 2000'lere kadar uzanan eski bir yerleşim yeridir. Bölge, antik dönemlerde Bitinya Krallığı'nın bir parçasıydı. 
                      Osmanlı döneminde önemli bir liman kenti olarak gelişen Karasu, Cumhuriyet döneminde Sakarya iline bağlı bir ilçe haline gelmiştir.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      1920'li yıllarda Yunan işgali sırasında büyük zarar gören ilçe, Kurtuluş Savaşı sonrasında yeniden inşa edilmiştir. 
                      1950'lerden itibaren turizm potansiyeli keşfedilen Karasu, özellikle yazlık konut yatırımları ile hızla gelişmiştir.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Günümüzde Karasu, hem yerleşim hem de turizm açısından Sakarya'nın en önemli ilçelerinden biridir. 
                      Tarihi dokusunu koruyarak modern yaşam standartlarına kavuşmuştur.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Coğrafya */}
            <div className="mb-16">
              <ScrollReveal direction="up" delay={50}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Coğrafya</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Konum</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Karasu, Sakarya ilinin kuzeyinde, Karadeniz kıyısında yer almaktadır.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>İl merkezine 50 km, İstanbul'a yaklaşık 150 km mesafededir.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Koordinatlar: 41°05'K, 30°41'D</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Yüzölçümü: 458 km²</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Doğal Özellikler</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>20 km uzunluğunda ince taneli kum plajı</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Acarlar Longozu (1562 hektar, dünyanın en büyük longozu)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Sakarya Nehri'nin Karadeniz'e döküldüğü Botağzı bölgesi</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Zengin orman alanları ve doğal yaşam</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Nüfus ve Demografi */}
            <div className="mb-16">
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Nüfus ve Demografi</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-primary mb-2">~30.000</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Kış Nüfusu</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-primary mb-2">~150.000</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Yaz Nüfusu</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-primary mb-2">~25</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mahalle Sayısı</div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                    Karasu'nun kış nüfusu yaklaşık 30.000 civarındadır. Yaz aylarında ise yazlıkçılar ve turistlerle birlikte 
                    nüfus 150.000'e kadar çıkmaktadır. Bu durum, bölgenin turizm potansiyelini ve yazlık konut talebini göstermektedir.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Ekonomi */}
            <div className="mb-16">
              <ScrollReveal direction="up" delay={150}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Ekonomi</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Fish className="w-5 h-5 text-primary" />
                        Balıkçılık
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Karasu, Karadeniz'in verimli balıkçılık alanlarına sahiptir. Özellikle hamsi, palamut ve lüfer avcılığı 
                        önemli bir geçim kaynağıdır. Botağzı bölgesi balıkçı teknelerinin ana limanıdır.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-primary" />
                        Turizm
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Turizm, Karasu ekonomisinin en önemli sektörlerinden biridir. Yaz aylarında binlerce turist ağırlanır. 
                        Oteller, pansiyonlar, restoranlar ve eğlence mekanları önemli istihdam alanları oluşturur.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Factory className="w-5 h-5 text-primary" />
                        Tarım ve Hayvancılık
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        İlçede fındık, mısır ve sebze üretimi yaygındır. Hayvancılık da önemli bir geçim kaynağıdır. 
                        Organik tarım projeleri son yıllarda gelişmektedir.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Emlak ve İnşaat
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Emlak sektörü, yazlık konut talebi ve turizm yatırımları ile hızla büyümektedir. 
                        Yeni konut projeleri, oteller ve turizm tesisleri sürekli gelişmektedir.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Kültür ve Yaşam */}
            <div className="mb-16">
              <ScrollReveal direction="up" delay={200}>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Kültür ve Yaşam</h3>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      Karasu, zengin bir kültürel mirasa sahiptir. Geleneksel Karadeniz kültürü ile modern yaşam tarzı 
                      bir arada bulunur. İlçede düzenlenen festivaller, konserler ve kültürel etkinlikler sosyal hayatı canlandırır.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Geleneksel Etkinlikler</h4>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Karasu Balık Festivali (Ağustos)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Yaz Konserleri ve Sahil Etkinlikleri</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Geleneksel Hamsi Günleri</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sosyal Yaşam</h4>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Plaj aktiviteleri ve su sporları</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Doğa yürüyüşleri ve kamp alanları</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Restoranlar ve kafeler</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Why Karasu Section - Modern Design */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Neden Karasu?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın en güzel sahil ilçelerinden biri olan Karasu, doğal güzellikleri ve stratejik konumuyla öne çıkıyor.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">20 km Plaj</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Türkiye'nin en uzun plajlarından biri. Denize sıfır yaşam fırsatları.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Mountain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acarlar Longozu</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Dünyanın tek parça halindeki en büyük longozu. Doğal güzellikler.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">İstanbul'a Yakın</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Sadece 2 saat mesafe. Hafta sonu kaçamakları için ideal.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Yatırım Potansiyeli</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Gelişen altyapı ve turizm potansiyeli ile değer kazanan bölge.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
      </section>

        {/* Karasu Map Section - Like Live Site */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Karasu Haritası
                </h2>
                <p className="text-gray-600">
                  {stats.total}+ ilanın konumunu haritada görüntüleyin
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <InteractiveMap 
                listings={featuredListings.map(l => ({
                  id: l.id,
                  title: l.title,
                  slug: l.slug,
                  location_neighborhood: l.location_neighborhood,
                  location_district: l.location_district,
                  coordinates_lat: l.coordinates_lat?.toString() || '',
                  coordinates_lng: l.coordinates_lng?.toString() || '',
                  price_amount: l.price_amount?.toString() || '',
                  status: l.status,
                  property_type: l.property_type,
                  images: l.images?.map(img => ({
                    public_id: img.public_id || '',
                    url: img.url,
                    alt: img.alt,
                  })),
                  features: l.features,
                }))} 
                basePath={basePath}
                height="600px"
              />
            </ScrollReveal>
          </div>
        </section>

        {/* Market Trends Dashboard - Like Live Site */}
        <section className="bg-white">
          <MarketTrendsDashboard />
        </section>

        {/* Quick Tools Section */}
        <section className="bg-gray-50">
          <QuickToolsSection />
        </section>

        {/* Weather Widget Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <WeatherWidget city="Karasu" country="TR" />
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Karasu Emlak İlanları
                    </h2>
                    <p className="text-gray-600">
                      {stats.total} adet gayrimenkul ilanı • {stats.satilik} satılık • {stats.kiralik} kiralık
                    </p>
                  </div>
                  <Link href={`${basePath}/satilik`} className="hidden md:flex items-center gap-2 text-primary hover:text-primary-600 font-medium">
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredListings.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button asChild size="lg">
                  <Link href={`${basePath}/satilik`}>
                    Tüm Satılık İlanlar
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={`${basePath}/kiralik`}>
                    Tüm Kiralık İlanlar
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Neighborhoods Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Karasu Mahalleleri
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Her mahallenin kendine özgü karakteri ve avantajları var. Size en uygun mahalleyi keşfedin.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {neighborhoodsWithImages.slice(0, 12).map((neighborhood, index) => {
                const imageUrl = getNeighborhoodImageUrl(neighborhood);
                // Mock listing count for neighborhoods
                const listingCount = Math.floor(Math.random() * 40) + 1;
                const isPopular = index < 6;
                
                return (
                  <ScrollReveal key={neighborhood.id || neighborhood.name} direction="up" delay={index * 50}>
                    <Link href={`${basePath}/mahalle/${neighborhood.slug || generateSlug(neighborhood.name)}`}>
                      <div className="group bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300">
                        <div className="relative h-40 bg-gray-200 overflow-hidden">
                          <CardImage
                            publicId={imageUrl}
                            alt={`${neighborhood.name} Mahallesi - Karasu Emlak`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          {isPopular && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                Popüler
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-bold text-base drop-shadow-lg mb-1">
                              {neighborhood.name}
                            </h3>
                            <p className="text-white/90 text-xs">
                              {neighborhood.description || `Karasu ${neighborhood.name} Mahallesi`}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 font-medium">{listingCount} ilan</span>
                            <span className="text-xs text-primary font-semibold">İncele →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
        {neighborhoods.length > 12 && (
              <div className="text-center mt-8">
                <Button asChild variant="outline">
                  <Link href={`${basePath}/karasu/mahalle-karsilastirma`}>
                    Tüm Mahalleleri Karşılaştır
            </Link>
                </Button>
              </div>
            )}
          </div>
      </section>

        {/* Quick Links Section - Modern & Minimal Design */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Karasu Hakkında
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Karasu'yu daha yakından tanıyın. Gezilecek yerler, restoranlar, sağlık ve ulaşım bilgileri.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/karasu/gezilecek-yerler`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <Mountain className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Gezilecek Yerler
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Karasu'da görülmesi gereken yerler ve doğal güzellikler
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Keşfet
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/karasu/restoranlar`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Restoranlar
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      En iyi restoranlar ve kafeler
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Keşfet
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <Link href={`${basePath}/karasu/hastaneler`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Sağlık
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Hastaneler ve sağlık kuruluşları
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Keşfet
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <Link href={`${basePath}/karasu/ulasim`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Ulaşım
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Ulaşım bilgileri ve haritalar
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Keşfet
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <Link href={`${basePath}/karasu/mahalle-karsilastirma`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Mahalle Karşılaştırma
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Mahalleleri fiyat ve özellikler açısından karşılaştırın
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Karşılaştır
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={250}>
                <Link href={`${basePath}/karasu/onemli-telefonlar`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-red-600 dark:hover:border-red-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-200/50 dark:border-red-800/30">
                        <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        Önemli Telefonlar
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Acil durum ve önemli telefon numaraları
                    </p>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-sm">
                      Görüntüle
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section - Modern Design */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/20 dark:border-primary/30">
                    Neden Bizi Seçmelisiniz?
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Karasu'da Güvenilir Emlak Partneriniz
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Karasu'da emlak alım-satım ve kiralama işlemlerinizde güvenilir partneriniz. Deneyimli ekibimiz ve geniş ilan portföyümüzle hayalinizdeki evi bulmanıza yardımcı oluyoruz.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Güvenilir Hizmet</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    10+ yıllık deneyim ve %100 müşteri memnuniyeti ile güvenilir emlak danışmanlığı
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Stratejik Konumlar</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Denize sıfır, şehir merkezine yakın özel seçenekler ve premium lokasyonlar
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Yatırım Fırsatları</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Değer kazanan bölgelerde profesyonel yatırım danışmanlığı ve piyasa analizi
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">7/24 Destek</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    WhatsApp ve telefon desteği ile her zaman yanınızdayız
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Like Live Site */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Müşteri Yorumları
                </h2>
                <p className="text-gray-600">
                  Karasu emlak hizmetlerimiz hakkında müşterilerimizin görüşleri
                </p>
              </div>
            </ScrollReveal>
            <TestimonialsWithSchema />
          </div>
        </section>

        {/* FAQ Section - Modern Design */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Karasu emlak hakkında merak ettikleriniz
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {karasuFAQs.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <details className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-primary transition-colors">
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
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links Section - Modern Design */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  İlgili Sayfalar
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Karasu hakkında daha fazla bilgi edinmek için ilgili sayfalarımızı keşfedin.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/karasu-satilik-ev`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow hover:border-primary dark:hover:border-primary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Karasu Satılık Ev</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Karasu'da satılık ev ilanlarını inceleyin.
                  </p>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow hover:border-primary dark:hover:border-primary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Yatırımlık Gayrimenkul</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Yatırım amaçlı gayrimenkul seçenekleri.
                  </p>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <Link href={`${basePath}/karasu-emlak-rehberi`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow hover:border-primary dark:hover:border-primary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Emlak Rehberi</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Karasu emlak hakkında kapsamlı rehber.
                  </p>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/kocaali`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow hover:border-primary dark:hover:border-primary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Kocaali</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Komşu ilçe Kocaali hakkında bilgiler.
                  </p>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <Link href={`${basePath}/sapanca`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow hover:border-primary dark:hover:border-primary/50">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Mountain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Sapanca</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Sapanca Gölü çevresinde bungalov ve emlak seçenekleri.
                  </p>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section - Modern Design */}
        <section className="py-20 bg-primary dark:bg-primary-dark text-white">
          <div className="container mx-auto px-4 text-center max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-lg text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da emlak arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
                  <Link href={`${basePath}/satilik`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm İlanları İncele
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
