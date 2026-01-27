import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { InvestmentCalculator } from '@/components/calculators/InvestmentCalculator';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TrendingUp, Calculator, Info, Percent, DollarSign, Clock, AlertCircle, CheckCircle, ArrowRight, BarChart3, Lightbulb, Target, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';

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
    ? '/yatirim/roi-hesaplayici' 
    : `/${locale}/yatirim/roi-hesaplayici`;

  return {
    title: 'ROI Hesaplayıcı | Yatırım Getirisi Hesaplama | Karasu Emlak',
    description: 'Gayrimenkul yatırımınızın ROI (Return on Investment) değerini, kira getirisini ve geri dönüş süresini hesaplayın. Detaylı yatırım analizi ve getiri hesaplama aracı.',
    keywords: [
      'roi hesaplayıcı',
      'yatırım getirisi',
      'kira getirisi hesaplama',
      'gayrimenkul yatırım',
      'roi hesaplama',
      'yatırım analizi',
      'geri dönüş süresi',
      'karasu yatırım',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/yatirim/roi-hesaplayici',
        'en': '/en/yatirim/roi-hesaplayici',
        'et': '/et/yatirim/roi-hesaplayici',
        'ru': '/ru/yatirim/roi-hesaplayici',
        'ar': '/ar/yatirim/roi-hesaplayici',
      },
    },
    openGraph: {
      title: 'ROI Hesaplayıcı | Yatırım Getirisi Hesaplama',
      description: 'Gayrimenkul yatırımınızın ROI değerini, kira getirisini ve geri dönüş süresini hesaplayın.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

export default async function ROIHesaplayiciPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Rehber', href: `${basePath}/rehber` },
    { label: 'Yatırım Rehberi', href: `${basePath}/rehber/yatirim` },
    { label: 'ROI Hesaplayıcı', href: `${basePath}/yatirim/roi-hesaplayici` },
  ];

  const faqs = [
    {
      question: 'ROI nedir ve nasıl hesaplanır?',
      answer: 'ROI (Return on Investment - Yatırım Getirisi), yatırımınızdan elde ettiğiniz getirinin yatırım tutarına oranıdır. Formül: ROI = (Net Yıllık Gelir / Yatırım Tutarı) × 100. Örneğin, 3 milyon TL\'ye aldığınız bir emlak yılda 216.000 TL net gelir getiriyorsa, ROI = (216.000 / 3.000.000) × 100 = %7.2\'dir.',
    },
    {
      question: 'İyi bir ROI oranı nedir?',
      answer: 'Gayrimenkul yatırımları için genellikle %5-10 arası ROI oranı iyi kabul edilir. %7-8 üzeri ROI oranları yüksek getiri sağlar. Ancak ROI oranı tek başına yeterli değildir, değer artışı, likidite ve risk faktörlerini de değerlendirmek gerekir.',
    },
    {
      question: 'ROI hesaplarken hangi faktörleri göz önünde bulundurmalıyım?',
      answer: 'ROI hesaplarken kira geliri, yıllık giderler (aidat, sigorta, bakım), vergi yükümlülükleri, boş kalma riski ve değer artışı potansiyelini göz önünde bulundurmalısınız. Ayrıca finansman maliyetleri (kredi faizi) varsa bunları da hesaplamaya dahil etmelisiniz.',
    },
    {
      question: 'Geri dönüş süresi nedir?',
      answer: 'Geri dönüş süresi, yatırım tutarınızın ne kadar sürede geri döneceğini gösterir. Formül: Geri Dönüş Süresi = Yatırım Tutarı / Yıllık Net Gelir. Örneğin, 2 milyon TL yatırım yaptınız ve yıllık 120.000 TL net gelir elde ediyorsanız, geri dönüş süresi yaklaşık 16.7 yıldır.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  const roiTips = [
    {
      icon: Target,
      title: 'Hedef Belirleyin',
      description: 'Yatırım hedefinizi netleştirin. Kısa vadeli gelir mi, uzun vadeli değer artışı mı istiyorsunuz?',
    },
    {
      icon: BarChart3,
      title: 'Piyasa Analizi',
      description: 'Bölgesel fiyat trendlerini ve kira piyasasını analiz edin. Karşılaştırmalı analiz yapın.',
    },
    {
      icon: Calculator,
      title: 'Detaylı Hesaplama',
      description: 'Tüm giderleri (aidat, sigorta, bakım, vergi) hesaba katın. Net geliri doğru hesaplayın.',
    },
    {
      icon: AlertCircle,
      title: 'Risk Değerlendirmesi',
      description: 'Boş kalma riski, piyasa dalgalanmaları ve bölgesel riskleri değerlendirin.',
    },
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} className="container mx-auto px-4 pt-8" />
        
        {/* Hero Section */}
        <ScrollReveal direction="up" delay={0}>
          <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 lg:py-24 border-b border-gray-200">
            <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6 shadow-md">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  ROI Hesaplayıcı
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Gayrimenkul yatırımınızın ROI (Return on Investment) değerini, kira getirisini ve geri dönüş süresini hesaplayın. Detaylı yatırım analizi ile bilinçli kararlar verin.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <Percent className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">ROI Hesaplama</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Kira Getirisi</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Geri Dönüş Süresi</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 max-w-7xl">
          {/* Calculator Section */}
          <ScrollReveal direction="up" delay={0}>
            <section className="mb-16">
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8 lg:p-12">
                <InvestmentCalculator />
              </div>
            </section>
          </ScrollReveal>

          {/* Tips Section */}
          <ScrollReveal direction="up" delay={0}>
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">ROI Hesaplama İpuçları</h2>
                  <p className="text-gray-600 mt-1">Daha doğru hesaplama için öneriler</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roiTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <ScrollReveal key={index} direction="up" delay={index * 100}>
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
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
                  <p className="text-gray-600 mt-1">ROI hesaplama hakkında merak edilenler</p>
                </div>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <details className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                      <summary className="cursor-pointer flex items-center justify-between">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
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

          {/* Related Pages */}
          <ScrollReveal direction="up" delay={0}>
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <ArrowRight className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">İlgili Sayfalar</h2>
                  <p className="text-gray-600 mt-1">Yatırım kararlarınızı destekleyen diğer araçlar</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href={`${basePath}/yatirim/piyasa-analizi`}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Piyasa Analizi</h3>
                    <p className="text-gray-600 text-sm">Detaylı piyasa analizleri ve trendler</p>
                  </div>
                </Link>
                <Link href={`${basePath}/rehber/yatirim`}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Yatırım Rehberi</h3>
                    <p className="text-gray-600 text-sm">Kapsamlı yatırım stratejileri ve rehber</p>
                  </div>
                </Link>
                <Link href={`${basePath}/hizmetler/danismanlik`}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
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

          {/* CTA Section */}
          <ScrollReveal direction="up" delay={0}>
            <section className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Yatırım Danışmanlığı İster misiniz?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Profesyonel yatırım analizi ve danışmanlık hizmeti için bizimle iletişime geçin. Uzman ekibimiz size en uygun yatırım stratejisini belirlemenizde yardımcı olacaktır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    İletişime Geç
                  </Button>
                </Link>
                <Link href={`${basePath}/hizmetler/danismanlik`}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                    Danışmanlık Hizmeti
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
