import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Home, 
  MapPin, 
  Calendar, 
  DollarSign,
  PieChart,
  LineChart,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Info,
  Zap,
  FileText
} from 'lucide-react';
import { getListingStats } from '@/lib/supabase/queries';
import { getNeighborhoodStats } from '@/lib/supabase/queries/neighborhood-stats';
import { withTimeout } from '@/lib/utils/timeout';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/istatistikler/piyasa-analizi' 
    : `/${locale}/istatistikler/piyasa-analizi`;

  return {
    title: 'Piyasa Analizi | Karasu Emlak | Detaylı Emlak Piyasa Analizleri ve Trendler',
    description: 'Karasu emlak piyasası detaylı analizleri. Fiyat trendleri, piyasa göstergeleri, yatırım fırsatları ve risk analizleri. Güncel veriler ve uzman yorumları ile emlak yatırım kararlarınızı destekleyin.',
    keywords: [
      'karasu piyasa analizi',
      'karasu emlak analizi',
      'karasu fiyat analizi',
      'karasu emlak trendleri',
      'karasu yatırım analizi',
      'karasu emlak piyasası',
      'karasu emlak raporu',
      'sakarya emlak analizi',
      'karasu emlak istatistikleri',
      'karasu emlak göstergeleri',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/istatistikler/piyasa-analizi`,
        'en': `${siteConfig.url}/en/istatistikler/piyasa-analizi`,
        'et': `${siteConfig.url}/et/istatistikler/piyasa-analizi`,
        'ru': `${siteConfig.url}/ru/istatistikler/piyasa-analizi`,
        'ar': `${siteConfig.url}/ar/istatistikler/piyasa-analizi`,
      },
    },
    openGraph: {
      title: 'Piyasa Analizi | Karasu Emlak',
      description: 'Karasu emlak piyasası detaylı analizleri ve trendleri. Güncel veriler ve uzman yorumları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Piyasa Analizi',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Piyasa Analizi | Karasu Emlak',
      description: 'Karasu emlak piyasası detaylı analizleri ve trendleri.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PiyasaAnaliziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İstatistikler', href: `${basePath}/istatistikler` },
    { label: 'Piyasa Analizi', href: `${basePath}/istatistikler/piyasa-analizi` },
  ];

  // Fetch statistics with timeout
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const neighborhoodStatsResult = await withTimeout(getNeighborhoodStats(), 3000, []);
  
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  const neighborhoodStats = neighborhoodStatsResult || [];

  // Calculate market indicators
  const satilikPercentage = stats.total > 0 ? Math.round((stats.satilik / stats.total) * 100) : 0;
  const kiralikPercentage = stats.total > 0 ? Math.round((stats.kiralik / stats.total) * 100) : 0;

  const faqs = [
    {
      question: 'Piyasa analizi ne sıklıkla güncellenir?',
      answer: 'Piyasa analizlerimiz aylık olarak güncellenir. Önemli piyasa değişiklikleri olduğunda haftalık güncellemeler de yapılır. Güncel veriler ve trend analizleri ile en doğru piyasa bilgilerini sunuyoruz.',
    },
    {
      question: 'Piyasa analizinde hangi veriler kullanılıyor?',
      answer: 'Analizlerimizde toplam ilan sayısı, satılık/kiralık dağılımı, emlak türü bazlı istatistikler, mahalle bazlı fiyat analizleri, piyasa trendleri, talep analizleri ve yatırım göstergeleri kullanılmaktadır. Tüm veriler gerçek zamanlı olarak toplanır ve analiz edilir.',
    },
    {
      question: 'Piyasa analizi yatırım kararlarım için yeterli mi?',
      answer: 'Piyasa analizleri yatırım kararlarınız için önemli bir rehberdir, ancak profesyonel danışmanlık almanızı öneririz. Özel durumunuz, bütçeniz ve hedefleriniz doğrultusunda kişiselleştirilmiş bir analiz ve strateji geliştirmek için uzman ekibimizle iletişime geçebilirsiniz.',
    },
    {
      question: 'Hangi bölgeler için analiz yapılıyor?',
      answer: 'Öncelikli olarak Karasu ve çevresindeki mahalleler için detaylı analizler yapılmaktadır. Ayrıca Sakarya geneli ve komşu ilçeler için de genel piyasa analizleri sunulmaktadır. Özel bölge analizi talepleriniz için bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Piyasa analizinde gelecek tahminleri var mı?',
      answer: 'Evet, analizlerimizde kısa ve orta vadeli piyasa tahminleri yer almaktadır. Ancak bu tahminler genel trendlere dayalıdır ve yatırım tavsiyesi niteliği taşımaz. Detaylı projeksiyonlar için profesyonel danışmanlık hizmeti almanızı öneririz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  // Market insights data
  const marketInsights = [
    {
      type: 'positive',
      title: 'Yüksek Talep',
      description: 'Yazlık konut ve denize yakın evlere olan talep sürekli artıyor.',
      icon: TrendingUp,
    },
    {
      type: 'positive',
      title: 'Yatırım Potansiyeli',
      description: 'Gelişen altyapı ve turizm yatırımları bölgeyi daha cazip hale getiriyor.',
      icon: Target,
    },
    {
      type: 'neutral',
      title: 'Fiyat İstikrarı',
      description: 'Piyasa fiyatları genel olarak istikrarlı seyrediyor.',
      icon: BarChart3,
    },
    {
      type: 'warning',
      title: 'Sezonsal Dalgalanma',
      description: 'Yaz aylarında talep ve fiyatlar artarken, kış aylarında düşüş görülebiliyor.',
      icon: AlertCircle,
    },
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section - Modern Design */}
        <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-16 lg:py-24 border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Detaylı Analiz</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Piyasa Analizi
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Karasu emlak piyasası detaylı analizleri. Fiyat trendleri, piyasa göstergeleri, yatırım fırsatları ve risk analizleri. 
                Güncel veriler ve uzman yorumları ile emlak yatırım kararlarınızı destekleyin.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aylık Güncelleme</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilir Veriler</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gerçek Zamanlı</span>
                </div>
              </div>
              
              {/* Accent Line */}
              <div className="h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 max-w-7xl">
          {/* Market Overview */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <LineChart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Piyasa Genel Bakış
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Karasu emlak piyasasının genel durumu ve temel göstergeler
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Toplam İlan</h3>
                  </div>
                  <p className="text-4xl font-bold text-primary mb-2">{stats.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif ilan sayısı</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={50}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center border border-green-200/50 dark:border-green-800/30">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Satılık</h3>
                  </div>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.satilik}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{satilikPercentage}% toplam içinde</p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/30">
                      <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kiralık</h3>
                  </div>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stats.kiralik}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kiralikPercentage}% toplam içinde</p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Property Type Distribution */}
          {Object.keys(stats.byType).length > 0 && (
            <section className="mb-16">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <PieChart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Emlak Türü Dağılımı
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Emlak türlerine göre ilan dağılımı ve analizi
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.byType).map(([type, count], index) => {
                  const percentage = stats.total > 0 ? Math.round(((count as number) / stats.total) * 100) : 0;
                  return (
                    <ScrollReveal key={type} direction="up" delay={index * 50}>
                      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{type}</span>
                          <span className="text-2xl font-bold text-primary">{count as number}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{percentage}% toplam içinde</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </section>
          )}

          {/* Market Insights */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Piyasa İçgörüleri
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Karasu emlak piyasası hakkında önemli gözlemler ve trendler
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {marketInsights.map((insight, index) => {
                const Icon = insight.icon;
                const bgColor = insight.type === 'positive' 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30'
                  : insight.type === 'warning'
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30'
                  : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30';
                
                const iconColor = insight.type === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : insight.type === 'warning'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-blue-600 dark:text-blue-400';

                return (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <div className={`bg-white dark:bg-gray-900 rounded-xl p-6 border-2 ${bgColor} hover:shadow-lg transition-all`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 border`}>
                          <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {insight.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>

          {/* Neighborhood Statistics */}
          {neighborhoodStats.length > 0 && (
            <section className="mb-16">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Mahalle Bazlı Analiz
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      En aktif mahalleler ve ortalama fiyat analizleri
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {neighborhoodStats.slice(0, 9).map((neighborhood, index) => (
                  <ScrollReveal key={neighborhood.name} direction="up" delay={index * 50}>
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{neighborhood.name}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Toplam İlan:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{neighborhood.totalListings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Satılık:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{neighborhood.satilikCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Kiralık:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">{neighborhood.kiralikCount}</span>
                        </div>
                        {neighborhood.avgPrice > 0 && (
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Ort. Fiyat:</span>
                            <span className="font-semibold text-primary">
                              ₺{new Intl.NumberFormat('tr-TR').format(neighborhood.avgPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link href={`${basePath}/mahalle/${encodeURIComponent(neighborhood.name.toLowerCase().replace(/\s+/g, '-'))}`}>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          Detaylı Analiz
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {/* Market Analysis Content */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Piyasa Analizi ve Yorumlar
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Karasu emlak piyasası, denize sıfır konumu ve doğal güzellikleri ile sürekli gelişen bir bölgedir. 
                    Özellikle yazlık konut ve denize yakın villalar yüksek talep görmektedir. İstanbul'a yakınlığı ve 
                    gelişen altyapısı ile hem oturum hem de yatırım amaçlı tercih edilmektedir.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Piyasa analizlerimiz, güncel veriler ve trend analizleri ile yatırımcılara ve emlak alıcılarına 
                    rehberlik etmektedir. Düzenli olarak güncellenen analizlerimiz ile piyasa hakkında en güncel 
                    bilgilere ulaşabilirsiniz.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Analiz Kapsamı</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Mahalle bazlı detaylı istatistikler ve fiyat analizleri</li>
                    <li>Emlak türü bazlı piyasa değerlendirmeleri</li>
                    <li>Piyasa trendleri ve gelecek projeksiyonları</li>
                    <li>Yatırım fırsatları ve risk analizleri</li>
                    <li>Talep ve arz dengesi değerlendirmeleri</li>
                    <li>Fiyat hareketleri ve sezonsal dalgalanmalar</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Info className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Sık Sorulan Sorular
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
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
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Related Pages */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  İlgili Sayfalar
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href={`${basePath}/istatistikler/piyasa-raporlari`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Piyasa Raporları</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Detaylı piyasa raporları ve istatistikler</p>
                </div>
              </Link>

              <Link href={`${basePath}/istatistikler/fiyat-trendleri`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <LineChart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fiyat Trendleri</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Fiyat hareketleri ve trend analizleri</p>
                </div>
              </Link>

              <Link href={`${basePath}/istatistikler/bolge-analizi`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bölge Analizi</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Mahalle bazlı detaylı analizler</p>
                </div>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary dark:bg-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Özel Analiz İster misiniz?</h2>
            <p className="text-lg text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
              Özel piyasa analizi ve yatırım danışmanlığı için bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100">
                <Link href={`${basePath}/iletisim`}>
                  İletişime Geç
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
                <Link href={`${basePath}/hizmetler/danismanlik`}>
                  Danışmanlık Hizmeti
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
