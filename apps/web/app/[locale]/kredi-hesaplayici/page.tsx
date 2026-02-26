import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { MortgageCalculator } from '@/components/calculators/MortgageCalculator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema } from '@/lib/seo/structured-data';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Calculator, CheckCircle, Info, DollarSign, FileText, Phone, Mail, Clock, Award, Target, Zap, Star, ChevronRight, Lightbulb, Users, Shield, ArrowRight, Percent, Calendar, TrendingUp, BarChart3, CreditCard, Building2 } from 'lucide-react';

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
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Konut, Ev ve Emlak Kredisi Hesaplama | Karasu Emlak',
    description: 'Güncel konut kredisi, ev kredisi ve emlak kredisi oranlarıyla ödeme planınızı hesaplayın. Karasu emlak piyasasına özel kredi faiz analiz tablosu.',
    keywords: [
      'konut kredisi',
      'ev kredisi',
      'emlak kredisi',
      'kredi hesaplayıcı',
      'konut kredisi hesaplama',
      'mortgage hesaplayıcı',
      'kredi faiz hesaplama',
      'karasu konut kredisi',
      'kredi faiz oranları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/kredi-hesaplayici`,
      languages: pruneHreflangLanguages({
        'tr': '/kredi-hesaplayici',
        'en': '/en/kredi-hesaplayici',
        'et': '/et/kredi-hesaplayici',
        'ru': '/ru/kredi-hesaplayici',
        'ar': '/ar/kredi-hesaplayici',
      }),
    },
    openGraph: {
      title: 'Konut, Ev ve Emlak Kredisi Hesaplama Aracımız',
      description: 'Konut kredisi ve ev kredisi ödeme planınızı kolayca hesaplayın. Aylık faiz ve amortizasyon tablosu.',
      type: 'website',
    },
  };
}

export default async function MortgageCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Kredi Hesaplayıcı', href: `${basePath}/kredi-hesaplayici` },
  ];

  const articleSchema = generateArticleSchema({
    headline: 'Kredi Hesaplayıcı | Konut Kredisi Hesaplama',
    description: 'Konut kredisi ödeme planınızı hesaplayın. Aylık ödeme, toplam faiz ve amortizasyon tablosu ile kredi detaylarınızı görüntüleyin.',
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  const faqs = [
    {
      question: 'Konut kredisi faiz oranları nasıl belirlenir?',
      answer: 'Konut kredisi faiz oranları, TCMB politika faizi, enflasyon, piyasa koşulları, bankanın risk değerlendirmesi ve müşterinin kredi notuna göre belirlenir. Genellikle değişken ve sabit faiz seçenekleri sunulur. Değişken faiz, TCMB politika faizine bağlı olarak değişirken, sabit faiz kredi vadesi boyunca aynı kalır.',
    },
    {
      question: 'Kredi başvurusu için gerekli belgeler nelerdir?',
      answer: 'Kredi başvurusu için kimlik belgesi, gelir belgesi (maaş bordrosu, SGK dökümü), tapu veya sözleşme örneği, banka hesap ekstreleri, vergi levhası (esnaf için) ve varsa diğer gelir belgeleri gereklidir. Bankalar ek belgeler de isteyebilir. Tüm belgelerin güncel ve eksiksiz olması önemlidir.',
    },
    {
      question: 'Kredi onay süresi ne kadar?',
      answer: 'Kredi onay süresi genellikle 3-7 iş günü arasında değişmektedir. Evrak eksikliği, ek değerlendirme gerektiğinde veya yüksek kredi tutarlarında bu süre uzayabilir. Hızlı onay için tüm belgelerin eksiksiz ve güncel olması önemlidir.',
    },
    {
      question: 'Peşinat oranı ne kadar olmalı?',
      answer: 'Peşinat oranı genellikle ev değerinin %20-30\'u arasında olmalıdır. Yüksek peşinat, daha düşük aylık ödeme ve toplam faiz maliyeti anlamına gelir. Ayrıca yüksek peşinat, kredi onay şansını artırır ve daha uygun faiz oranları almanızı sağlayabilir.',
    },
    {
      question: 'Değişken mi sabit faiz mi seçmeliyim?',
      answer: 'Değişken faiz, genellikle başlangıçta daha düşük olur ancak TCMB politika faizine bağlı olarak değişir. Sabit faiz, kredi vadesi boyunca aynı kalır ve öngörülebilirlik sağlar. Uzun vadeli planlarınız varsa sabit faiz, kısa vadede ödeme yapmayı planlıyorsanız değişken faiz tercih edilebilir.',
    },
    {
      question: 'Kredi hesaplayıcı sonuçları ne kadar doğru?',
      answer: 'Kredi hesaplayıcı sonuçları, girdiğiniz bilgilere göre yaklaşık hesaplamalar yapar. Gerçek aylık ödeme tutarları, bankanın uyguladığı faiz oranı, masraflar ve diğer faktörlere göre değişebilir. Kesin bilgi için bankanızla iletişime geçmeniz önerilir.',
    },
    {
      question: 'Erken ödeme yapabilir miyim?',
      answer: 'Evet, konut kredilerinde erken ödeme yapabilirsiniz. Ancak bankalar erken ödeme için belirli koşullar ve sınırlamalar koyabilir. Erken ödeme yaparak toplam faiz maliyetinizi azaltabilirsiniz. Erken ödeme koşulları için bankanızla iletişime geçin.',
    },
    {
      question: 'Kredi başvurusu reddedilirse ne yapmalıyım?',
      answer: 'Kredi başvurusu reddedilirse, red nedeni hakkında bankadan bilgi alın. Kredi notunuzu yükseltmek, gelir belgelerinizi güçlendirmek veya peşinat oranını artırmak gibi önlemler alabilirsiniz. Farklı bankalara başvurmayı da değerlendirebilirsiniz.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
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
                Konut, Ev ve Emlak Kredisi Hesaplama
              </h1>

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                2026 yılı güncel konut kredisi oranları ile gayrimenkul ödeme planınızı hesaplayın.
                Ev kredisi veya emlak yatırımı yaparken krediye uygun taksitleri kolayca inceleyin.
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
                <div className="text-3xl md:text-4xl font-bold mb-2">15.000+</div>
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
                    Konut ve Ev Kredisi Hesaplama İşlemi
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak yatırımınız veya yeni eviniz için kredi taksitlerinizi tek tıkla bulun.
                  </p>
                </div>
              </div>
            </div>
            <MortgageCalculator />
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
                    Kredi hesaplayıcıyı kullanmak için 4 basit adım
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Gayrimenkul Fiyatını Girin',
                  description: 'Satın almak istediğiniz gayrimenkulün fiyatını girin.',
                },
                {
                  step: '2',
                  title: 'Peşinat Tutarını Belirleyin',
                  description: 'Ödeyeceğiniz peşinat tutarını girin (genellikle %20-30).',
                },
                {
                  step: '3',
                  title: 'Kredi Bilgilerini Ayarlayın',
                  description: 'Vade süresi ve faiz oranını girin.',
                },
                {
                  step: '4',
                  title: 'Sonuçları Analiz Edin',
                  description: 'Aylık ödeme, toplam faiz ve amortizasyon tablosunu inceleyin.',
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

        {/* Info Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Info className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Konut Kredisi Hakkında
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Konut kredisi hakkında önemli bilgiler
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
                    Peşinat Oranı
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Konut kredilerinde genellikle %20-30 peşinat oranı istenir. Yüksek peşinat, daha düşük aylık ödeme ve faiz maliyeti anlamına gelir.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Percent className="h-4 w-4" />
                  <span>İdeal oran: %20-30</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Vade Seçenekleri
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Konut kredileri genellikle 5-30 yıl arasında vade seçenekleri sunar. Uzun vade, düşük aylık ödeme ancak yüksek toplam faiz demektir.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Vade: 5-30 yıl</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border border-orange-200 dark:border-orange-800">
                    <Percent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Faiz Oranları
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Faiz oranları TCMB politikalarına ve banka koşullarına göre değişiklik gösterir. Güncel faiz oranları için bankanızla iletişime geçin.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Değişken ve sabit seçenekler</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Kredi Başvurusu
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  Kredi başvurusu için gerekli belgeler ve koşullar bankadan bankaya değişiklik gösterir. Detaylı bilgi için bankanızla iletişime geçin.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={`${basePath}/iletisim`}>
                    Danışmanlık Al
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
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
                    Kredi hakkında daha fazla bilgi edinin
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href={`${basePath}/rehberler/kredi-nasil-alinir`} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-[#006AFF] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#006AFF] transition-colors">Konut Kredisi Nasıl Alınır?</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kredi başvuru süreci ve gerekli belgeler hakkında detaylı rehber</p>
              </Link>
              <Link href={`${basePath}/rehberler/ev-nasil-alinir`} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-[#006AFF] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#006AFF] transition-colors">Ev Nasıl Alınır?</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ev alma süreci ve dikkat edilmesi gerekenler</p>
              </Link>
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
                  Konut ve Ev Kredisi S.S.S.
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Emlak kredisi süreci ve ödeme planları hakkında en çok merak edilenler
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
                Emlak Danışmanlığına İhtiyacınız mı Var?
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                Uzman ekibimiz size özel emlak danışmanlık hizmeti sunuyor.
                Karasu emlak piyasasında en iyi fırsatları birlikte bulalım.
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

