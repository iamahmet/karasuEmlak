import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TrendingUp, CheckCircle, AlertCircle, DollarSign, Target, BarChart3, MapPin, Clock, Shield, Percent, ArrowRight, Calculator, Briefcase, Info, Lightbulb, Building2, Home, PieChart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { GuideSidebar } from '@/components/guides/GuideSidebar';
import { RelatedGuides } from '@/components/guides/RelatedGuides';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { AIChecker } from '@/components/content/AIChecker';
import { AICheckerBadge } from '@/components/content/AICheckerBadge';

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
  const canonicalPath = locale === routing.defaultLocale ? '/rehber/yatirim' : `/${locale}/rehber/yatirim`;
  
  return {
    title: 'Emlak Yatırım Rehberi | Kapsamlı Yatırım Stratejileri ve Rehber | Karasu Emlak',
    description: 'Emlak yatırımı yaparken bilmeniz gerekenler, yatırım stratejileri, risk analizi, getiri hesaplama ve karlı yatırım fırsatları hakkında kapsamlı rehber. Uzman tavsiyeleri ve pratik ipuçları.',
    keywords: [
      'emlak yatırım rehberi',
      'gayrimenkul yatırım',
      'yatırım stratejileri',
      'emlak yatırım danışmanlığı',
      'yatırım getiri analizi',
      'emlak yatırım risk analizi',
      'karasu yatırım',
      'emlak yatırım fırsatları',
      'yatırım rehberi',
      'gayrimenkul yatırım rehberi',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: pruneHreflangLanguages({
        'tr': '/rehber/yatirim',
        'en': '/en/rehber/yatirim',
        'et': '/et/rehber/yatirim',
        'ru': '/ru/rehber/yatirim',
        'ar': '/ar/rehber/yatirim',
      }),
    },
    openGraph: {
      title: 'Emlak Yatırım Rehberi | Kapsamlı Yatırım Stratejileri',
      description: 'Emlak yatırımı yaparken bilmeniz gerekenler, yatırım stratejileri ve karlı yatırım fırsatları hakkında kapsamlı rehber.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-investment.jpg`,
          width: 1200,
          height: 630,
          alt: 'Emlak Yatırım Rehberi - Karasu ve Kocaali Yatırım Tavsiyeleri',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Emlak Yatırım Rehberi | Karasu Emlak',
      description: 'Emlak yatırımı yaparken bilmeniz gerekenler, yatırım stratejileri ve karlı yatırım fırsatları.',
    },
  };
}

export default async function YatirimPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const strategies = [
    {
      title: 'Kısa Vadeli Yatırım',
      description: 'Hızlı kazanç için uygun stratejiler',
      items: [
        'Flipping (al-sat) stratejisi',
        'Yenileme ve satış',
        'Piyasa fırsatlarını takip etme',
        'Hızlı kar marjı hesaplama',
      ],
    },
    {
      title: 'Uzun Vadeli Yatırım',
      description: 'Sürdürülebilir gelir için stratejiler',
      items: [
        'Kira geliri odaklı yatırım',
        'Değer artışı beklentisi',
        'Bölgesel gelişim projelerini takip',
        'Diversifikasyon stratejisi',
      ],
    },
    {
      title: 'Yazlık Yatırım',
      description: 'Karasu bölgesine özel fırsatlar',
      items: [
        'Sahil yakını konumlar',
        'Yazlık kiralama potansiyeli',
        'Turizm sezonu değerlendirmesi',
        'Doğal güzellik faktörleri',
      ],
    },
  ];

  const factors = [
    {
      icon: TrendingUp,
      title: 'Değer Artış Faktörleri',
      items: [
        'Bölgesel gelişim projeleri',
        'Ulaşım altyapısı',
        'Sosyal tesisler',
        'Eğitim kurumları',
        'Sağlık hizmetleri',
      ],
    },
    {
      icon: DollarSign,
      title: 'Gelir Potansiyeli',
      items: [
        'Kira getirisi',
        'Yazlık kiralama',
        'Turizm gelirleri',
        'Uzun vadeli değer artışı',
        'Vergi avantajları',
      ],
    },
    {
      icon: AlertCircle,
      title: 'Risk Faktörleri',
      items: [
        'Piyasa dalgalanmaları',
        'Bölgesel riskler',
        'Bakım maliyetleri',
        'Boş kalma riski',
        'Yasal değişiklikler',
      ],
    },
  ];

  const tips = [
    'Bölge araştırması yapın',
    'Uzun vadeli plan yapın',
    'Nakit akışını hesaplayın',
    'Profesyonel danışmanlık alın',
    'Diversifikasyon yapın',
    'Piyasa trendlerini takip edin',
  ];

  const investmentSteps = [
    {
      step: 1,
      title: 'Hedef Belirleme',
      description: 'Yatırım hedeflerinizi netleştirin',
      items: [
        'Kısa vadeli mi uzun vadeli mi?',
        'Gelir odaklı mı değer artışı odaklı mı?',
        'Bütçe ve risk toleransı',
        'Beklenen getiri oranı',
      ],
    },
    {
      step: 2,
      title: 'Piyasa Araştırması',
      description: 'Piyasa koşullarını analiz edin',
      items: [
        'Bölgesel fiyat trendleri',
        'Talep ve arz dengesi',
        'Gelişim projeleri',
        'Ulaşım ve altyapı',
      ],
    },
    {
      step: 3,
      title: 'Emlak Seçimi',
      description: 'Doğru emlakı seçin',
      items: [
        'Lokasyon analizi',
        'Emlak türü seçimi',
        'Fiyat değerlendirmesi',
        'Potansiyel getiri hesaplama',
      ],
    },
    {
      step: 4,
      title: 'Finansman Planlama',
      description: 'Finansman seçeneklerini değerlendirin',
      items: [
        'Nakit mi kredi mi?',
        'Kredi seçenekleri',
        'Ödeme planı',
        'Vergi avantajları',
      ],
    },
    {
      step: 5,
      title: 'Hukuki Süreçler',
      description: 'Yasal işlemleri tamamlayın',
      items: [
        'Tapu kontrolü',
        'İpotek durumu',
        'Noter sözleşmesi',
        'Sigorta işlemleri',
      ],
    },
    {
      step: 6,
      title: 'Yatırım Yönetimi',
      description: 'Yatırımınızı yönetin',
      items: [
        'Kiralama yönetimi',
        'Bakım ve onarım',
        'Vergi yükümlülükleri',
        'Performans takibi',
      ],
    },
  ];

  const roiExamples = [
    {
      type: 'Yazlık Konut',
      investment: '2.500.000 TL',
      monthlyRent: '15.000 TL',
      annualRent: '180.000 TL',
      roi: '7.2%',
      description: 'Yaz aylarında yüksek kiralama potansiyeli',
    },
    {
      type: 'Merkez Daire',
      investment: '3.000.000 TL',
      monthlyRent: '18.000 TL',
      annualRent: '216.000 TL',
      roi: '7.2%',
      description: 'İstikrarlı uzun vadeli kiralama geliri',
    },
    {
      type: 'Denize Yakın Villa',
      investment: '5.000.000 TL',
      monthlyRent: '35.000 TL',
      annualRent: '420.000 TL',
      roi: '8.4%',
      description: 'Premium lokasyon, yüksek getiri',
    },
  ];

  const faqs = [
    {
      question: 'Emlak yatırımı yapmak için ne kadar sermaye gerekir?',
      answer: 'Emlak yatırımı için gereken sermaye, emlak türü, lokasyon ve finansman seçeneklerine göre değişir. Genellikle emlak değerinin %20-30\'u peşinat olarak yeterlidir. Kredi kullanarak yatırım yapabilirsiniz, ancak nakit yatırım daha avantajlı olabilir. Karasu bölgesinde 1.5 milyon TL\'den başlayan yatırım fırsatları bulunmaktadır.',
    },
    {
      question: 'Hangi emlak türleri yatırım için daha karlı?',
      answer: 'Yazlık konutlar, denize yakın villalar ve merkez konumlardaki daireler yatırım için karlı seçeneklerdir. Yazlık konutlar sezonsal yüksek kiralama geliri, denize yakın villalar premium fiyat ve değer artışı, merkez daireler ise istikrarlı uzun vadeli kiralama geliri sunar. Her emlak türünün kendine özgü avantajları vardır.',
    },
    {
      question: 'Yatırım getiri oranı (ROI) nasıl hesaplanır?',
      answer: 'ROI = (Yıllık Kira Geliri / Yatırım Tutarı) × 100 formülü ile hesaplanır. Örneğin, 3 milyon TL\'ye aldığınız bir emlak yılda 216.000 TL kira geliri getiriyorsa, ROI = (216.000 / 3.000.000) × 100 = %7.2\'dir. Ayrıca değer artışı da ROI\'ye dahil edilebilir.',
    },
    {
      question: 'Yatırım yaparken hangi riskleri göz önünde bulundurmalıyım?',
      answer: 'Piyasa dalgalanmaları, boş kalma riski, bakım ve onarım maliyetleri, yasal değişiklikler, bölgesel riskler ve likidite riski yatırım yaparken dikkate alınması gereken başlıca risklerdir. Risk yönetimi için profesyonel danışmanlık almanız ve portföyünüzü çeşitlendirmeniz önerilir.',
    },
    {
      question: 'Karasu\'da yatırım yapmak karlı mı?',
      answer: 'Karasu, denize yakın konumu, gelişen turizm altyapısı ve artan talep ile yatırım için cazip bir bölgedir. Yazlık konutlar ve denize yakın emlaklar yüksek kiralama geliri ve değer artışı potansiyeli sunar. Ancak yatırım kararı vermeden önce detaylı piyasa analizi ve profesyonel danışmanlık almanız önerilir.',
    },
    {
      question: 'Yatırım danışmanlığı hizmeti alabilir miyim?',
      answer: 'Evet, profesyonel yatırım danışmanlığı hizmeti sunmaktayız. Yatırım stratejisi geliştirme, emlak seçimi, risk analizi, getiri projeksiyonları, finansman planlama ve portföy yönetimi konularında destek sağlıyoruz. Detaylı bilgi için bizimle iletişime geçebilirsiniz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  // Generate HTML content for TOC
  const guideContent = `
    <h2 id="yatirim-sureci">Yatırım Süreci</h2>
    <p>Emlak yatırımı yaparken izlemeniz gereken adımlar ve süreçler hakkında detaylı bilgiler.</p>
    
    <h3 id="hedef-belirleme">Hedef Belirleme</h3>
    <p>Yatırım hedeflerinizi netleştirin ve stratejinizi belirleyin.</p>
    
    <h3 id="piyasa-arastirmasi">Piyasa Araştırması</h3>
    <p>Piyasa koşullarını analiz edin ve fırsatları değerlendirin.</p>
    
    <h2 id="yatirim-stratejileri">Yatırım Stratejileri</h2>
    <p>Farklı yatırım yaklaşımları ve stratejileri hakkında bilgiler.</p>
    
    <h2 id="getiri-ornekleri">Getiri Örnekleri</h2>
    <p>Farklı emlak türleri için getiri hesaplamaları ve örnekler.</p>
    
    <h2 id="degerlendirme-faktorleri">Değerlendirme Faktörleri</h2>
    <p>Yatırım kararı verirken dikkate alınması gereken faktörler.</p>
    
    <h2 id="yatirim-ipuclari">Yatırım İpuçları</h2>
    <p>Uzman tavsiyeleri ve pratik ipuçları.</p>
  `;

  // Calculate reading time and word count
  const readingTime = calculateReadingTime(guideContent);
  const wordCount = guideContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  // Related guides
  const relatedGuides = [
    {
      id: 'emlak-alim-satim',
      title: 'Emlak Alım-Satım Rehberi',
      href: `${basePath}/rehber/emlak-alim-satim`,
      description: 'Emlak alım-satım sürecinde bilmeniz gerekenler',
      category: 'Alım-Satım',
    },
    {
      id: 'kiralama',
      title: 'Kiralama Rehberi',
      href: `${basePath}/rehber/kiralama`,
      description: 'Ev kiralama sürecinde dikkat edilmesi gerekenler',
      category: 'Kiralama',
    },
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
    <div className="min-h-screen bg-white">
      {/* AI Checker Badge - Admin Only (Hidden from public) */}

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Rehber', href: `${basePath}/rehber` },
          { label: 'Yatırım Rehberi' },
        ]}
        className="mb-8 container mx-auto px-4 pt-8"
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,900px)_380px] gap-10 lg:gap-16">
          {/* Main Content */}
          <main className="min-w-0 w-full">
            {/* AI Checker - Admin Only (Hidden from public) */}

        {/* Header */}
        <ScrollReveal direction="up" delay={0}>
          <header className="mb-12">
            <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 rounded-2xl p-8 md:p-12 border-2 border-orange-200 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center mx-auto mb-6 shadow-md">
                <TrendingUp className="h-10 w-10 text-orange-600" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">Emlak Yatırım Rehberi</h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
                Emlak yatırımı yaparken bilmeniz gerekenler, yatırım stratejileri ve karlı yatırım fırsatları hakkında kapsamlı rehber. Uzman ekibimiz tarafından hazırlanmış yatırım stratejileri, risk analizi ve getiri hesaplama yöntemleri.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg border border-orange-200">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">6 Yatırım Stratejisi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg border border-orange-200">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Gelir Potansiyeli</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Risk Analizi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg border border-orange-200">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">ROI Hesaplama</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link href={`${basePath}/yatirim/roi-hesaplayici`}>
                  <Button size="lg" className="bg-orange-600 text-white hover:bg-orange-700">
                    <Calculator className="h-5 w-5 mr-2" />
                    ROI Hesaplayıcı
                  </Button>
                </Link>
                <Link href={`${basePath}/yatirim/piyasa-analizi`}>
                  <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Piyasa Analizi
                  </Button>
                </Link>
              </div>
            </div>
          </header>
        </ScrollReveal>

        {/* Investment Process Steps */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Yatırım Süreci</h2>
                <p className="text-gray-600 mt-1">Adım adım yatırım rehberi</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investmentSteps.map((step, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-orange-600">{step.step}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                    <ul className="space-y-2">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Investment Strategies */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Yatırım Stratejileri</h2>
                <p className="text-gray-600 mt-1">Farklı yatırım yaklaşımları ve stratejileri</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((strategy, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{strategy.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{strategy.description}</p>
                    <ul className="space-y-2">
                      {strategy.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ROI Examples */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 rounded-xl">
                <Percent className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Getiri Örnekleri</h2>
                <p className="text-gray-600 mt-1">Farklı emlak türleri için getiri hesaplamaları</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roiExamples.map((example, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Home className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{example.type}</h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yatırım:</span>
                        <span className="font-semibold text-gray-900">{example.investment}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aylık Kira:</span>
                        <span className="font-semibold text-gray-900">{example.monthlyRent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Yıllık Kira:</span>
                        <span className="font-semibold text-gray-900">{example.annualRent}</span>
                      </div>
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">ROI:</span>
                          <span className="text-2xl font-bold text-green-600">{example.roi}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">{example.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href={`${basePath}/yatirim/roi-hesaplayici`}>
                <Button size="lg" variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50">
                  <Calculator className="h-5 w-5 mr-2" />
                  Kendi ROI'nizi Hesaplayın
                </Button>
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* Factors */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Değerlendirme Faktörleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {factors.map((factor, index) => {
              const Icon = factor.icon;
              const colorClasses = index === 0 
                ? 'from-green-50 to-emerald-50 border-green-100' 
                : index === 1 
                ? 'from-blue-50 to-cyan-50 border-blue-100'
                : 'from-red-50 to-orange-50 border-red-100';
              return (
                <div key={index} className={`bg-gradient-to-br ${colorClasses} border-2 rounded-xl p-6 hover:shadow-lg transition-shadow`}>
                  <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mb-4">
                    <Icon className={`h-6 w-6 ${index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : 'text-red-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{factor.title}</h3>
                  <ul className="space-y-2">
                    {factor.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Yatırım İpuçları</h2>
                <p className="text-gray-600 mt-1">Uzman tavsiyeleri ve pratik ipuçları</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-orange-100 rounded-xl p-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <li className="flex items-start gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{tip}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>
            </div>
          </section>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Info className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sık Sorulan Sorular</h2>
                <p className="text-gray-600 mt-1">Yatırım hakkında merak edilenler</p>
              </div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <details className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4 group-hover:text-orange-600 transition-colors">
                        {faq.question}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Related Tools */}
        <ScrollReveal direction="up" delay={0}>
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Yatırım Araçları</h2>
                <p className="text-gray-600 mt-1">Yatırım kararlarınızı destekleyen araçlar</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href={`${basePath}/yatirim/roi-hesaplayici`}>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ROI Hesaplayıcı</h3>
                  <p className="text-gray-600 text-sm">Yatırım getiri oranınızı hesaplayın</p>
                </div>
              </Link>
              <Link href={`${basePath}/yatirim/piyasa-analizi`}>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Piyasa Analizi</h3>
                  <p className="text-gray-600 text-sm">Detaylı piyasa analizleri ve trendler</p>
                </div>
              </Link>
              <Link href={`${basePath}/hizmetler/danismanlik`}>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Yatırım Danışmanlığı</h3>
                  <p className="text-gray-600 text-sm">Profesyonel yatırım danışmanlık hizmeti</p>
                </div>
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal direction="up" delay={0}>
          <section className="text-center">
            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-8 md:p-12 text-white shadow-xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Yatırım fırsatlarını keşfedin</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Karasu bölgesindeki yatırım fırsatlarını inceleyin ve profesyonel danışmanlık alın. Uzman ekibimiz size en uygun yatırım stratejisini belirlemenizde yardımcı olacaktır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/satilik`}>
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg">
                    <Home className="h-5 w-5 mr-2" />
                    Yatırım Fırsatlarını Gör
                  </Button>
                </Link>
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Danışmanlık Al
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

            {/* Related Guides Section */}
            <RelatedGuides
              guides={relatedGuides}
              title="İlgili Rehberler"
              basePath={basePath}
              className="mt-16"
            />
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <GuideSidebar
              basePath={basePath}
              guide={{
                id: 'yatirim-rehberi',
                title: 'Emlak Yatırım Rehberi',
                content: guideContent,
                published_at: new Date().toISOString(),
              }}
              readingTime={readingTime}
              wordCount={wordCount}
              relatedGuides={relatedGuides}
              showTOC={true}
            />
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}

