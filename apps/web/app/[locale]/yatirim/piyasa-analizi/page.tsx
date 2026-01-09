import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
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
  FileText,
  Shield,
  Award,
  Lightbulb,
  Briefcase,
  Percent,
  Clock
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/yatirim/piyasa-analizi' 
    : `/${locale}/yatirim/piyasa-analizi`;

  return {
    title: 'Yatırım Piyasa Analizi | Karasu Emlak | Emlak Yatırım Analizleri ve Fırsatları',
    description: 'Karasu emlak yatırım piyasası detaylı analizleri. Yatırım fırsatları, getiri analizleri, risk değerlendirmeleri ve piyasa trendleri. Profesyonel yatırım danışmanlığı ile emlak yatırım kararlarınızı destekleyin.',
    keywords: [
      'karasu yatırım analizi',
      'karasu emlak yatırım',
      'karasu yatırım fırsatları',
      'karasu emlak getiri analizi',
      'karasu yatırım piyasası',
      'karasu emlak yatırım danışmanlığı',
      'karasu yatırım risk analizi',
      'sakarya emlak yatırım',
      'karasu yatırım trendleri',
      'karasu emlak yatırım rehberi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/yatirim/piyasa-analizi`,
        'en': `${siteConfig.url}/en/yatirim/piyasa-analizi`,
        'et': `${siteConfig.url}/et/yatirim/piyasa-analizi`,
        'ru': `${siteConfig.url}/ru/yatirim/piyasa-analizi`,
        'ar': `${siteConfig.url}/ar/yatirim/piyasa-analizi`,
      },
    },
    openGraph: {
      title: 'Yatırım Piyasa Analizi | Karasu Emlak',
      description: 'Karasu emlak yatırım piyasası detaylı analizleri ve yatırım fırsatları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Yatırım Piyasa Analizi',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Yatırım Piyasa Analizi | Karasu Emlak',
      description: 'Karasu emlak yatırım piyasası detaylı analizleri ve yatırım fırsatları.',
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

export default async function YatirimPiyasaAnaliziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Yatırım', href: `${basePath}/yatirim` },
    { label: 'Piyasa Analizi', href: `${basePath}/yatirim/piyasa-analizi` },
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
      question: 'Karasu emlak yatırımı karlı mı?',
      answer: 'Karasu emlak yatırımı, doğru lokasyon ve emlak türü seçildiğinde karlı olabilir. Denize yakın konumlar, yazlık konutlar ve turizm bölgeleri yüksek getiri potansiyeli sunar. Ancak yatırım kararı vermeden önce detaylı piyasa analizi ve profesyonel danışmanlık almanız önerilir.',
    },
    {
      question: 'Hangi emlak türleri yatırım için daha uygundur?',
      answer: 'Yazlık konutlar, denize yakın villalar ve turizm bölgelerindeki emlaklar yatırım için uygundur. Ayrıca merkez konumlardaki daireler ve yeni konut projeleri de uzun vadeli yatırım için değerlendirilebilir. Her emlak türünün kendine özgü avantaj ve riskleri vardır.',
    },
    {
      question: 'Yatırım getiri oranı ne kadar?',
      answer: 'Yatırım getiri oranı, emlak türü, lokasyon, piyasa koşulları ve yatırım stratejisine göre değişmektedir. Genel olarak yazlık kiralama geliri %5-10 arasında, uzun vadeli değer artışı ise yıllık %8-15 arasında olabilir. Detaylı getiri analizi için profesyonel danışmanlık almanızı öneririz.',
    },
    {
      question: 'Yatırım yaparken nelere dikkat etmeliyim?',
      answer: 'Yatırım yaparken lokasyon, emlak türü, piyasa trendleri, tapu durumu, bina yaşı, bakım maliyetleri ve vergi yükümlülüklerini dikkate almalısınız. Ayrıca profesyonel değerleme, hukuki danışmanlık ve finansman seçeneklerini değerlendirmeniz önemlidir.',
    },
    {
      question: 'Yatırım için hangi mahalleler önerilir?',
      answer: 'Denize yakın mahalleler (Sahil, Yalı Mahallesi), merkez konumlar ve yeni konut projelerinin olduğu bölgeler yatırım için önerilir. Ancak her mahallenin kendine özgü avantajları ve riskleri vardır. Detaylı mahalle analizi için bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Yatırım danışmanlığı hizmeti alabilir miyim?',
      answer: 'Evet, profesyonel yatırım danışmanlığı hizmeti sunmaktayız. Yatırım stratejisi geliştirme, emlak seçimi, risk analizi, getiri projeksiyonları ve portföy yönetimi konularında destek sağlıyoruz. Detaylı bilgi için iletişime geçebilirsiniz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  // Investment insights data
  const investmentInsights = [
    {
      type: 'positive',
      title: 'Yüksek Yatırım Potansiyeli',
      description: 'Denize yakın konumlar ve yazlık konutlar yüksek kiralama geliri ve değer artışı potansiyeli sunuyor.',
      icon: TrendingUp,
    },
    {
      type: 'positive',
      title: 'Turizm Gelişimi',
      description: 'Gelişen turizm altyapısı ve artan ziyaretçi sayısı emlak değerlerini destekliyor.',
      icon: Target,
    },
    {
      type: 'neutral',
      title: 'İstikrarlı Piyasa',
      description: 'Piyasa fiyatları genel olarak istikrarlı seyrediyor, ani dalgalanmalar görülmüyor.',
      icon: BarChart3,
    },
    {
      type: 'warning',
      title: 'Sezonsal Dalgalanma',
      description: 'Yaz aylarında yüksek talep ve fiyatlar görülürken, kış aylarında düşüş olabilir.',
      icon: AlertCircle,
    },
  ];

  // Investment opportunities
  const investmentOpportunities = [
    {
      title: 'Yazlık Konutlar',
      description: 'Yaz aylarında yüksek kiralama geliri potansiyeli',
      roi: '8-12%',
      risk: 'Orta',
      icon: Home,
    },
    {
      title: 'Denize Yakın Villalar',
      description: 'Premium lokasyonlar, yüksek değer artışı',
      roi: '10-15%',
      risk: 'Düşük',
      icon: Building2,
    },
    {
      title: 'Merkez Daireler',
      description: 'Uzun vadeli yatırım, istikrarlı getiri',
      roi: '6-9%',
      risk: 'Düşük',
      icon: Home,
    },
    {
      title: 'Turizm Bölgeleri',
      description: 'Yüksek talep, sezonsal gelir',
      roi: '12-18%',
      risk: 'Orta-Yüksek',
      icon: MapPin,
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
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Yatırım Analizi</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Yatırım Piyasa Analizi
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Karasu emlak yatırım piyasası detaylı analizleri. Yatırım fırsatları, getiri analizleri, risk değerlendirmeleri ve piyasa trendleri. 
                Profesyonel yatırım danışmanlığı ile emlak yatırım kararlarınızı destekleyin.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uzman Analiz</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Analizi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Percent className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Getiri Hesaplama</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                  <Link href={`${basePath}/hizmetler/danismanlik`}>
                    <Briefcase className="w-5 h-5 mr-2" />
                    Yatırım Danışmanlığı
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`${basePath}/yatirim/roi-hesaplayici`}>
                    ROI Hesaplayıcı
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Accent Line */}
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
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
                    Karasu emlak yatırım piyasasının genel durumu
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif yatırım fırsatı</p>
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

          {/* Investment Opportunities */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Yatırım Fırsatları
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Karasu'da yatırım için uygun emlak türleri ve getiri potansiyelleri
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {investmentOpportunities.map((opportunity, index) => {
                const Icon = opportunity.icon;
                return (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {opportunity.description}
                      </p>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Getiri:</span>
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">{opportunity.roi}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Risk:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{opportunity.risk}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>

          {/* Investment Insights */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Yatırım İçgörüleri
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Karasu emlak yatırım piyasası hakkında önemli gözlemler
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {investmentInsights.map((insight, index) => {
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

          {/* Neighborhood Investment Analysis */}
          {neighborhoodStats.length > 0 && (
            <section className="mb-16">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Mahalle Bazlı Yatırım Analizi
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      En yatırım değeri yüksek mahalleler ve analizleri
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
                          Yatırım Analizi
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {/* Investment Strategy Content */}
          <section className="mb-16">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Yatırım Stratejisi ve Öneriler
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Karasu emlak yatırımı, doğru strateji ve lokasyon seçimi ile yüksek getiri potansiyeli sunar. 
                    Denize yakın konumlar, yazlık konutlar ve turizm bölgeleri özellikle yatırımcıların ilgisini çekmektedir.
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Yatırım Önerileri</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Denize yakın konumlar uzun vadede yüksek değer artışı potansiyeli sunar</li>
                    <li>Yazlık konutlar sezonsal kiralama geliri ile yatırım getirisi sağlar</li>
                    <li>Merkez konumlardaki daireler istikrarlı kiralama geliri sunar</li>
                    <li>Yeni konut projeleri modern yaşam standartları ile yatırımcıları cezbeder</li>
                    <li>Turizm bölgeleri yüksek talep ve fiyat artışı potansiyeli taşır</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Risk Yönetimi</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Sezonsal dalgalanmaları göz önünde bulundurun</li>
                    <li>Bakım ve onarım maliyetlerini hesaplayın</li>
                    <li>Piyasa trendlerini düzenli takip edin</li>
                    <li>Profesyonel değerleme ve hukuki danışmanlık alın</li>
                    <li>Finansman seçeneklerini değerlendirin</li>
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
              <Link href={`${basePath}/yatirim/roi-hesaplayici`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Percent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">ROI Hesaplayıcı</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Yatırım getiri oranı hesaplama aracı</p>
                </div>
              </Link>

              <Link href={`${basePath}/istatistikler/piyasa-analizi`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Piyasa Analizi</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Detaylı piyasa analizleri ve trendler</p>
                </div>
              </Link>

              <Link href={`${basePath}/hizmetler/danismanlik`}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Yatırım Danışmanlığı</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Profesyonel yatırım danışmanlık hizmeti</p>
                </div>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary dark:bg-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Yatırım Danışmanlığı İster misiniz?</h2>
            <p className="text-lg text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
              Profesyonel yatırım analizi ve danışmanlık hizmeti için bizimle iletişime geçin.
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
