import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { InvestmentCalculator } from '@/components/calculators/InvestmentCalculator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema } from '@/lib/seo/structured-data';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, CheckCircle, Info, DollarSign, BarChart3, Calculator, Phone, Mail, Clock, Award, Target, Zap, Star, ChevronRight, Lightbulb, Users, Shield, ArrowRight, Percent, Calendar, TrendingDown } from 'lucide-react';
import dynamicImport from 'next/dynamic';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';

const CurrencyConverter = dynamicImport(() => import('@/components/services/CurrencyConverter').then(mod => ({ default: mod.CurrencyConverter })), {
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
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Yatırım Hesaplayıcı | Kira Getirisi ve ROI Hesaplama | Karasu Emlak',
    description: 'Gayrimenkul yatırımınızın kira getirisi, ROI ve geri dönüş süresini hesaplayın. Karasu emlak yatırımları için detaylı analiz.',
    keywords: [
      'yatırım hesaplayıcı',
      'kira getirisi hesaplama',
      'roi hesaplama',
      'gayrimenkul yatırımı',
      'yatırım analizi',
      'geri dönüş süresi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/yatirim-hesaplayici`,
      languages: {
        'tr': '/yatirim-hesaplayici',
        'en': '/en/yatirim-hesaplayici',
        'et': '/et/yatirim-hesaplayici',
        'ru': '/ru/yatirim-hesaplayici',
        'ar': '/ar/yatirim-hesaplayici',
      },
    },
    openGraph: {
      title: 'Yatırım Hesaplayıcı | Kira Getirisi ve ROI Hesaplama',
      description: 'Gayrimenkul yatırımınızın kira getirisi, ROI ve geri dönüş süresini hesaplayın.',
      url: `${siteConfig.url}${basePath}/yatirim-hesaplayici`,
      type: 'website',
    },
  };
}

export default async function InvestmentCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Yatırım Hesaplayıcı', href: `${basePath}/yatirim-hesaplayici` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Yatırım Hesaplayıcı | Kira Getirisi ve ROI Hesaplama',
    description: 'Gayrimenkul yatırımınızın kira getirisi, ROI ve geri dönüş süresini hesaplayın. Karasu emlak yatırımları için detaylı analiz.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${siteConfig.url}${crumb.href}`,
    })),
  };

  const faqs = [
    {
      question: 'Yatırım hesaplayıcı nasıl kullanılır?',
      answer: 'Yatırım hesaplayıcıyı kullanmak için gayrimenkul fiyatı, aylık kira geliri, yıllık giderler ve vergi oranını girmeniz yeterlidir. Hesaplayıcı otomatik olarak kira getirisi, ROI ve geri dönüş süresini hesaplayacaktır. Sonuçları analiz ederek yatırım kararınızı verebilirsiniz.',
    },
    {
      question: 'Kira getirisi nedir ve nasıl hesaplanır?',
      answer: 'Kira getirisi, yıllık net kira gelirinin gayrimenkul fiyatına oranıdır. Formül: (Yıllık Net Kira Geliri / Gayrimenkul Fiyatı) × 100. Örneğin, 2.000.000 TL değerinde bir gayrimenkulden yıllık 120.000 TL net gelir elde ediyorsanız, kira getirisi %6\'dır. Yüksek getiri oranı, daha karlı bir yatırım anlamına gelir.',
    },
    {
      question: 'ROI (Yatırım Getirisi) ne anlama gelir?',
      answer: 'ROI (Return on Investment), yatırımınızın ne kadar karlı olduğunu gösteren önemli bir metrik. Yıllık net gelirin yatırım tutarına oranı olarak hesaplanır. Yüksek ROI, daha iyi bir yatırım performansı demektir. Genellikle %5-8 arası ROI, gayrimenkul yatırımları için iyi kabul edilir.',
    },
    {
      question: 'Geri dönüş süresi ne demektir?',
      answer: 'Geri dönüş süresi, yatırımınızın ne kadar sürede kendini amorti edeceğini gösterir. Yatırım tutarının yıllık net gelire bölünmesiyle hesaplanır. Örneğin, 2.000.000 TL yatırım yaptıysanız ve yıllık 100.000 TL net gelir elde ediyorsanız, geri dönüş süresi 20 yıldır. Kısa süre, daha hızlı kazanç demektir.',
    },
    {
      question: 'Yıllık giderlere neler dahil edilmeli?',
      answer: 'Yıllık giderlere aidat, sigorta, bakım-onarım, vergiler, boş kalma süreleri, yönetim giderleri ve diğer olağan giderler dahil edilmelidir. Tüm giderleri doğru hesaplamak, gerçekçi bir yatırım analizi için önemlidir. Genellikle yıllık kira gelirinin %15-25\'i gider olarak hesaplanabilir.',
    },
    {
      question: 'Hangi vergi oranını kullanmalıyım?',
      answer: 'Gayrimenkul kira geliri için genellikle %15 gelir vergisi uygulanır. Ancak bu oran, gelir diliminize ve diğer faktörlere göre değişebilir. En güncel vergi oranları için mali müşavirinize danışmanız önerilir. Hesaplayıcıda varsayılan olarak %15 kullanılmaktadır.',
    },
    {
      question: 'İyi bir yatırım için hangi metrikler önemli?',
      answer: 'İyi bir yatırım için kira getirisi %5-8 arası, ROI pozitif ve geri dönüş süresi 15-25 yıl arası olmalıdır. Ancak bu metrikler tek başına yeterli değildir. Bölge potansiyeli, değer artış beklentisi, likidite ve risk faktörleri de değerlendirilmelidir. Detaylı analiz için uzman danışmanlık hizmeti almanız önerilir.',
    },
    {
      question: 'Hesaplayıcı sonuçlarına göre yatırım kararı verebilir miyim?',
      answer: 'Hesaplayıcı sonuçları, yatırım kararınız için önemli bir rehberdir ancak tek başına yeterli değildir. Piyasa analizi, bölge potansiyeli, değer artış beklentisi, likidite ve risk değerlendirmesi de yapılmalıdır. Profesyonel yatırım danışmanlığı hizmeti alarak daha kapsamlı bir analiz yapabilirsiniz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section - Modern & Minimal */}
        <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-16 lg:py-24 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="p-2 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-lg">
                  <Calculator className="w-4 h-4 text-[#006AFF]" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesyonel Araç</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Yatırım Hesaplayıcı
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Gayrimenkul yatırımınızın kira getirisi, ROI (Yatırım Getirisi) ve geri dönüş süresini hesaplayın. 
                Karasu emlak yatırımları için detaylı analiz yapın ve bilinçli yatırım kararları verin.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <TrendingUp className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Anlık Hesaplama</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Shield className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilir Sonuçlar</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Award className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ücretsiz Kullanım</span>
                </div>
              </div>
              
              {/* Accent Line */}
              <div className="h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-[#006AFF] dark:bg-[#0052CC] text-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">10.000+</div>
                <div className="text-sm md:text-base text-blue-100">Hesaplama Yapıldı</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">%100</div>
                <div className="text-sm md:text-base text-blue-100">Ücretsiz</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">7/24</div>
                <div className="text-sm md:text-base text-blue-100">Erişilebilir</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">%98</div>
                <div className="text-sm md:text-base text-blue-100">Doğruluk Oranı</div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Calculator className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Yatırım Hesaplayıcı
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gayrimenkul yatırımınızın karlılığını hesaplayın
                  </p>
                </div>
              </div>
            </div>
            <InvestmentCalculator />
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Zap className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Nasıl Kullanılır?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Yatırım hesaplayıcıyı kullanmak için 4 basit adım
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Gayrimenkul Fiyatını Girin',
                  description: 'Yatırım yapmayı planladığınız gayrimenkulün fiyatını girin.',
                },
                {
                  step: '2',
                  title: 'Kira Gelirini Belirleyin',
                  description: 'Aylık kira gelirini ve yıllık giderleri girin.',
                },
                {
                  step: '3',
                  title: 'Vergi Oranını Ayarlayın',
                  description: 'Güncel vergi oranını girin (varsayılan %15).',
                },
                {
                  step: '4',
                  title: 'Sonuçları Analiz Edin',
                  description: 'Kira getirisi, ROI ve geri dönüş süresini inceleyin.',
                },
              ].map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-full bg-[#006AFF] text-white flex items-center justify-center font-bold mb-4 text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Currency Converter Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Döviz Çevirici
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Yatırım tutarlarını farklı para birimlerine çevirin
                  </p>
                </div>
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <CurrencyConverter />
            </div>
          </div>
        </section>

        {/* Metrics Info Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Info className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Yatırım Metrikleri Hakkında
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Yatırım hesaplamalarında kullanılan önemli kavramlar
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Kira Getirisi
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Kira getirisi, yıllık net kira gelirinin gayrimenkul fiyatına oranıdır. Yüksek getiri oranı, daha karlı bir yatırım anlamına gelir.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Percent className="h-4 w-4" />
                  <span>İdeal aralık: %5-8</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    ROI (Yatırım Getirisi)
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  ROI, yatırımınızın ne kadar karlı olduğunu gösteren önemli bir metrik. Yüksek ROI, daha iyi bir yatırım performansı demektir.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Pozitif ROI hedeflenmelidir</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border border-orange-200 dark:border-orange-800">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Geri Dönüş Süresi
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Geri dönüş süresi, yatırımınızın ne kadar sürede kendini amorti edeceğini gösterir. Kısa süre, daha hızlı kazanç demektir.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>İdeal aralık: 15-25 yıl</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Yatırım Danışmanlığı
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Detaylı yatırım analizi ve danışmanlık hizmeti için uzman ekibimizle iletişime geçin. Size özel yatırım stratejileri sunuyoruz.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={`${basePath}/iletisim`}>
                    İletişime Geç
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Tips Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Yatırım İpuçları
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Başarılı yatırım için önemli ipuçları
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Hedef Belirleyin',
                  description: 'Yatırım hedefinizi net olarak belirleyin. Kısa vadeli mi, uzun vadeli mi yatırım yapmak istiyorsunuz?',
                },
                {
                  icon: BarChart3,
                  title: 'Piyasa Analizi Yapın',
                  description: 'Bölge piyasasını detaylı analiz edin. Fiyat trendleri, kira piyasası ve gelecek potansiyelini değerlendirin.',
                },
                {
                  icon: Shield,
                  title: 'Risk Yönetimi',
                  description: 'Yatırım risklerini değerlendirin. Boş kalma süreleri, bakım maliyetleri ve piyasa dalgalanmalarını hesaba katın.',
                },
                {
                  icon: TrendingUp,
                  title: 'Değer Artış Potansiyeli',
                  description: 'Bölgenin gelecek potansiyelini araştırın. Altyapı projeleri, gelişim planları ve nüfus artışı önemlidir.',
                },
                {
                  icon: DollarSign,
                  title: 'Nakit Akışı',
                  description: 'Düzenli nakit akışı sağlayan yatırımları tercih edin. Kira geliri, yatırımınızın sürdürülebilirliği için kritiktir.',
                },
                {
                  icon: Users,
                  title: 'Uzman Desteği',
                  description: 'Profesyonel yatırım danışmanlığı alın. Deneyimli ekibimiz size en iyi yatırım fırsatlarını sunar.',
                },
              ].map((tip, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                    <tip.icon className="h-6 w-6 text-[#006AFF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Info className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Sık Sorulan Sorular
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Yatırım hesaplayıcı hakkında merak ettikleriniz
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 transition-all duration-200 hover:shadow-md">
                  <summary className="cursor-pointer flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-[#006AFF] transition-colors">
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
              ))}
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Star className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    İlgili Rehberler
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Yatırım hakkında daha fazla bilgi edinin
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href={`${basePath}/rehberler/yatirim-yapma`} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-[#006AFF] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#006AFF] transition-colors">Emlak Yatırımı Nasıl Yapılır?</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Yatırım stratejileri ve risk analizi hakkında detaylı rehber</p>
              </Link>
              <Link href={`${basePath}/rehber/yatirim`} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-[#006AFF] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#006AFF] transition-colors">Emlak Yatırım Rehberi</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Yatırım rehberi ve fırsatlar</p>
              </Link>
              <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-[#006AFF] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#006AFF] transition-colors">Yatırımlık Gayrimenkul</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Karasu yatırım fırsatları</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mx-auto mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                  <Phone className="w-6 h-6 text-[#006AFF]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Telefon</h3>
                <a href="tel:+905325933854" className="text-[#006AFF] hover:text-[#0052CC] dark:hover:text-[#006AFF] font-medium">
                  +90 546 639 54 61
                </a>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mx-auto mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                  <Mail className="w-6 h-6 text-[#006AFF]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">E-posta</h3>
                <a href="mailto:info@karasuemlak.net" className="text-[#006AFF] hover:text-[#0052CC] dark:hover:text-[#006AFF] font-medium text-sm">
                  info@karasuemlak.net
                </a>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mx-auto mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                  <Clock className="w-6 h-6 text-[#006AFF]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Çalışma Saatleri</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pazartesi - Pazar: 09:00 - 20:00</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Modern Design */}
        <section className="py-20 bg-[#006AFF] dark:bg-[#0052CC] text-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                Yatırım Danışmanlığına İhtiyacınız mı Var?
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                Uzman ekibimiz size özel yatırım analizi ve danışmanlık hizmeti sunuyor. 
                Karasu emlak piyasasında en iyi yatırım fırsatlarını birlikte bulalım.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100 dark:bg-white dark:text-[#006AFF] dark:hover:bg-gray-100 px-8 py-6 text-lg">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen İletişime Geç
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 px-8 py-6 text-lg">
                  <Link href={`${basePath}/satilik`}>
                    Satılık İlanlar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

