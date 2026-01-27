import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import { MapPin, Home, Building2, TrendingUp, Award, Waves, Mountain, BarChart3, Phone, ArrowRight, Shield, Clock, Users, Calendar, BookOpen, Landmark, Factory, GraduationCap, Heart, TreePine, Fish, Coffee } from 'lucide-react';
import Link from 'next/link';
import { getNeighborhoods, getListingStats, getFeaturedListings } from '@/lib/supabase/queries';
import { CardImage } from '@/components/images';
import { generateSlug } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generatePlaceSchema } from '@/lib/seo/local-seo-schemas';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { filterListingsByRegion } from '@/lib/utils/region-filter';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

const MarketTrendsDashboard = dynamicImport(() => import('@/components/home/MarketTrendsDashboard').then(mod => ({ default: mod.MarketTrendsDashboard })), {
  loading: () => null,
});

const TestimonialsWithSchema = dynamicImport(() => import('@/components/testimonials/TestimonialsWithSchema').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const InteractiveMap = dynamicImport(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => null,
});

const QuickToolsSection = dynamicImport(() => import('@/components/home/QuickToolsSection').then(mod => ({ default: mod.QuickToolsSection })), {
  loading: () => null,
});

const WeatherWidget = dynamicImport(() => import('@/components/services/WeatherWidget').then(mod => ({ default: mod.WeatherWidget })), {
  loading: () => null,
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
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali' : `/${locale}/kocaali`;
  
  return {
    title: 'Kocaali Emlak | Satılık ve Kiralık Gayrimenkul | Kocaali, Sakarya',
    description: 'Kocaali\'de satılık ve kiralık gayrimenkul ilanları. 12 km kumsal, sakin atmosfer ve İstanbul\'a yakınlığı ile Kocaali emlak fiyatları ve seçenekleri.',
    keywords: [
      'kocaali emlak',
      'kocaali satılık ev',
      'kocaali kiralık daire',
      'kocaali yazlık',
      'kocaali villa',
      'kocaali gayrimenkul',
      'sakarya kocaali emlak',
      'kocaali plaj',
      'kocaali yatırım',
      'kocaali emlak fiyatları',
      'kocaali satılık daire',
      'kocaali kiralık ev',
      'kocaali mahalleleri',
      'kocaali emlak danışmanlığı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/kocaali',
        'en': '/en/kocaali',
        'et': '/et/kocaali',
        'ru': '/ru/kocaali',
        'ar': '/ar/kocaali',
      },
    },
    openGraph: {
      title: 'Kocaali Emlak | Satılık ve Kiralık Gayrimenkul | Kocaali, Sakarya',
      description: 'Kocaali\'de satılık ve kiralık gayrimenkul ilanları. Denize sıfır konumlar, yazlık evler ve modern yaşam alanları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const kocaaliFAQs = [
  {
    question: 'Kocaali\'de emlak fiyatları nasıl?',
    answer: 'Kocaali\'de emlak fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
  },
  {
    question: 'Kocaali\'de hangi mahalleler öne çıkıyor?',
    answer: 'Kocaali\'de Merkez, Sahil Mahallesi gibi denize yakın bölgelerde ve diğer mahallelerde emlak seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.',
  },
  {
    question: 'Kocaali yatırım için uygun mu?',
    answer: 'Evet, Kocaali yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler ve denize yakın konumlar yatırımcıların ilgisini çekmektedir. Turizm potansiyeli ve İstanbul\'a yakınlığı ile uzun vadede değer kazanma potansiyeli yüksektir.',
  },
  {
    question: 'Kocaali\'de yaşam nasıl?',
    answer: 'Kocaali, sakin bir sahil ilçesi olarak doğal güzellikleri ve temiz havasıyla dikkat çeker. 12 km uzunluğundaki plajı ve İstanbul\'a yakınlığı ile hem yazlık hem de kalıcı yaşam için ideal bir bölgedir.',
  },
];

export default async function KocaaliPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch real data with timeout (3s max) - graceful degradation
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const featuredListingsResult = await withTimeout(getFeaturedListings(6), 3000, []);
  const neighborhoods = neighborhoodsResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  const featuredListings = (featuredListingsResult || []) as Awaited<ReturnType<typeof getFeaturedListings>>;

  // Filter listings for Kocaali with robust region matching
  const kocaaliListings = filterListingsByRegion(featuredListings, 'kocaali');

  // Generate comprehensive local SEO schemas
  const placeSchema = generatePlaceSchema({
    name: 'Kocaali',
    description: 'Kocaali, Sakarya\'nın sahil ilçesi. 12 km plajı ve İstanbul\'a yakınlığı ile hem yazlık hem de kalıcı yaşam için ideal bir bölge.',
    address: {
      addressLocality: 'Kocaali',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
      postalCode: '54800',
    },
    geo: {
      latitude: 41.0500,
      longitude: 30.8500,
    },
    url: `${siteConfig.url}${basePath}/kocaali`,
    containedIn: {
      '@type': 'State',
      name: 'Sakarya',
    },
  });

  const faqSchema = generateFAQSchema(kocaaliFAQs);

  return (
    <>
      <StructuredData data={placeSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Kocaali', href: `${basePath}/kocaali` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Kocaali</strong>, Sakarya'nın sahil ilçelerinden biri olarak denize sıfır konumları, 
              yazlık evleri ve sakin yaşam alanları ile dikkat çeker. İstanbul'a yakınlığı, gelişmiş 
              altyapısı ve yüksek turizm potansiyeli ile hem sürekli oturum hem de yatırım amaçlı tercih 
              edilmektedir. Ortalama emlak fiyatları konum ve özelliklere göre değişmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - Modern Design */}
        <section className="relative bg-white dark:bg-gray-900 py-16 lg:py-24 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30">
                    Sakarya'nın İncisi
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                  Kocaali Emlak
                </h1>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Denize sıfır konumlar, yazlık evler ve sakin yaşam alanları. Kocaali'de hayalinizdeki evi bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                    <Link href={`${basePath}/satilik?q=Kocaali`}>
                      <Home className="w-5 h-5 mr-2" />
                      Satılık İlanlar
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Link href={`${basePath}/kiralik?q=Kocaali`}>
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

        {/* About Kocaali Section - History, Geography, Culture */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Kocaali Hakkında
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın sahil ilçesi Kocaali, zengin tarihi, doğal güzellikleri ve modern yaşam alanları ile öne çıkıyor.
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
                      Kocaali, tarihi MÖ 2000'lere kadar uzanan eski bir yerleşim yeridir. Bölge, antik dönemlerde Bitinya Krallığı'nın bir parçasıydı. 
                      Osmanlı döneminde önemli bir sahil kasabası olarak gelişen Kocaali, Cumhuriyet döneminde Sakarya iline bağlı bir ilçe haline gelmiştir.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      1920'li yıllarda Yunan işgali sırasında büyük zarar gören ilçe, Kurtuluş Savaşı sonrasında yeniden inşa edilmiştir. 
                      1950'lerden itibaren turizm potansiyeli keşfedilen Kocaali, özellikle yazlık konut yatırımları ile hızla gelişmiştir.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Günümüzde Kocaali, hem yerleşim hem de turizm açısından Sakarya'nın en önemli ilçelerinden biridir. 
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
                          <span>Kocaali, Sakarya ilinin kuzeyinde, Karadeniz kıyısında yer almaktadır.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>İl merkezine 45 km, İstanbul'a yaklaşık 180 km mesafededir.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Koordinatlar: 41°03'K, 30°51'D</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Yüzölçümü: 320 km²</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Doğal Özellikler</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>12 km uzunluğunda ince taneli kum plajı</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Zengin orman alanları ve doğal yaşam</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Sahil yolu ve yürüyüş parkurları</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Temiz deniz ve doğal kumsal</span>
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
                      <div className="text-3xl font-bold text-primary mb-2">~20.000</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Kış Nüfusu</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-primary mb-2">~100.000</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Yaz Nüfusu</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-3xl font-bold text-primary mb-2">~15</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mahalle Sayısı</div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                    Kocaali'nin kış nüfusu yaklaşık 20.000 civarındadır. Yaz aylarında ise yazlıkçılar ve turistlerle birlikte 
                    nüfus 100.000'e kadar çıkmaktadır. Bu durum, bölgenin turizm potansiyelini ve yazlık konut talebini göstermektedir.
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
                        Kocaali, Karadeniz'in verimli balıkçılık alanlarına sahiptir. Özellikle hamsi, palamut ve lüfer avcılığı 
                        önemli bir geçim kaynağıdır. Sahil bölgesi balıkçı teknelerinin ana limanıdır.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-primary" />
                        Turizm
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Turizm, Kocaali ekonomisinin en önemli sektörlerinden biridir. Yaz aylarında binlerce turist ağırlanır. 
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
                      Kocaali, zengin bir kültürel mirasa sahiptir. Geleneksel Karadeniz kültürü ile modern yaşam tarzı 
                      bir arada bulunur. İlçede düzenlenen festivaller, konserler ve kültürel etkinlikler sosyal hayatı canlandırır.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Geleneksel Etkinlikler</h4>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Kocaali Plaj Festivali (Temmuz-Ağustos)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Yaz Konserleri ve Sahil Etkinlikleri</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>Geleneksel Balık Günleri</span>
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

        {/* Why Kocaali Section - Modern Design */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Neden Kocaali?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın en güzel sahil ilçelerinden biri olan Kocaali, doğal güzellikleri ve stratejik konumuyla öne çıkıyor.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">12 km Plaj</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Türkiye'nin en güzel plajlarından biri. Denize sıfır yaşam fırsatları.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Mountain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Doğal Güzellikler</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Zengin doğal alanlar ve koruma altındaki bölgeler. Doğa severler için ideal.
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
                    Sadece 2.5 saat mesafe. Hafta sonu kaçamakları için ideal.
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

        {/* Kocaali Map Section - Like Live Site */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Kocaali Haritası
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {stats.total}+ ilanın konumunu haritada görüntüleyin
                </p>
              </div>
            </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <InteractiveMap 
                listings={kocaaliListings.length > 0 ? kocaaliListings.map(l => ({
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
                  })) || [],
                  features: l.features,
                })) : featuredListings.map(l => ({
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
                  })) || [],
                  features: l.features,
                }))} 
                  basePath={basePath}
                  height="600px"
                />
              </ScrollReveal>
          </div>
        </section>

        {/* Market Trends Dashboard - Like Live Site */}
        <section className="bg-white dark:bg-gray-900">
          <MarketTrendsDashboard />
        </section>

        {/* Quick Tools Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50">
          <QuickToolsSection />
        </section>

        {/* Weather Widget Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <WeatherWidget city="Kocaali" country="TR" />
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {(kocaaliListings.length > 0 || featuredListings.length > 0) && (
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Kocaali Emlak İlanları
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {stats.total} adet gayrimenkul ilanı • {stats.satilik} satılık • {stats.kiralik} kiralık
                    </p>
                  </div>
                  <Link href={`${basePath}/satilik?q=Kocaali`} className="hidden md:flex items-center gap-2 text-primary hover:text-primary-600 dark:hover:text-primary-400 font-medium">
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(kocaaliListings.length > 0 ? kocaaliListings : featuredListings).slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                  <Link href={`${basePath}/satilik?q=Kocaali`}>
                    Tüm Satılık İlanlar
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`${basePath}/kiralik?q=Kocaali`}>
                    Tüm Kiralık İlanlar
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Quick Links Section - Modern Design */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Kocaali Hakkında
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Kocaali'yi daha yakından tanıyın. Gezilecek yerler, restoranlar, sağlık ve ulaşım bilgileri.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/kocaali/gezilecek-yerler`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                        <Mountain className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        Gezilecek Yerler
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Kocaali'de görülmesi gereken yerler ve doğal güzellikler
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      Keşfet
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
            </div>
          </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
          <Link href={`${basePath}/kocaali/restoranlar`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
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
          <Link href={`${basePath}/kocaali/hastaneler`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
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
          <Link href={`${basePath}/kocaali/ulasim`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300">
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
                <Link href={`${basePath}/kocaali/onemli-telefonlar`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-red-600 dark:hover:border-red-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-red-600/10 dark:bg-red-500/20 flex items-center justify-center border border-red-600/20 dark:border-red-500/30">
                        <Phone className="w-6 h-6 text-red-600 dark:text-red-500" />
        </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                        Önemli Telefonlar
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      Acil durum ve önemli telefon numaraları
                    </p>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-medium text-sm">
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
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30">
                    Neden Bizi Seçmelisiniz?
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Kocaali'de Güvenilir Emlak Partneriniz
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Kocaali'de emlak alım-satım ve kiralama işlemlerinizde güvenilir partneriniz. Deneyimli ekibimiz ve geniş ilan portföyümüzle hayalinizdeki evi bulmanıza yardımcı oluyoruz.
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

        {/* Testimonials Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Müşteri Yorumları
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Kocaali emlak hizmetlerimiz hakkında müşterilerimizin görüşleri
                </p>
              </div>
            </ScrollReveal>
            <TestimonialsWithSchema />
          </div>
        </section>

        {/* İç Link Modülleri - 3'lü Hub Ağı */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Diğer Bölgeler
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın diğer emlak bölgelerini de inceleyin.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/karasu`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Waves className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Karasu</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Karasu'da satılık ve kiralık emlak seçenekleri. Denize sıfır konumlar, yazlık evler.
                  </p>
                  <div className="flex items-center text-primary font-semibold">
                    İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/sapanca`} className="group block bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Mountain className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sapanca</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Sapanca Gölü çevresinde bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri.
                  </p>
                  <div className="flex items-center text-primary font-semibold">
                    İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ Section - Modern Accordion */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Kocaali emlak hakkında merak ettikleriniz
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {kocaaliFAQs.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <details className="group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
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

        {/* CTA Section - Modern Design */}
        <section className="py-20 bg-primary dark:bg-primary-dark text-white">
          <div className="container mx-auto px-4 text-center max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Kocaali'de Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-lg text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali'de emlak arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
            <Link href={`${basePath}/satilik?q=Kocaali`}>
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
