import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  BarChart3, 
  MapPin,
  Home,
  Calculator,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  PieChart,
  LineChart
} from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
// HowTo schema can be added if needed
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getListingStats } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';

export const revalidate = 3600;

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
    ? '/yatirim/kapsamli-rehber' 
    : `/${locale}/yatirim/kapsamli-rehber`;

  return {
    title: 'Kapsamlı Yatırım Rehberi | Karasu Emlak | Emlak Yatırım Stratejileri',
    description: 'Emlak yatırımı için kapsamlı rehber. Yatırım stratejileri, risk analizi, getiri hesaplama, portföy yönetimi ve karlı yatırım fırsatları. Uzman...',
    keywords: [
      'emlak yatırım rehberi',
      'gayrimenkul yatırım stratejileri',
      'emlak yatırım danışmanlığı',
      'yatırım getiri analizi',
      'emlak portföy yönetimi',
      'karasu yatırım fırsatları',
      'yatırım risk analizi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': `${siteConfig.url}/yatirim/kapsamli-rehber`,
        'en': `${siteConfig.url}/en/yatirim/kapsamli-rehber`,
      }),
    },
    openGraph: {
      title: 'Kapsamlı Yatırım Rehberi | Karasu Emlak',
      description: 'Emlak yatırımı için kapsamlı rehber ve stratejiler',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
    },
  };
}

const investmentStrategies = [
  {
    title: 'Kısa Vadeli Yatırım (1-3 Yıl)',
    description: 'Hızlı kazanç için uygun stratejiler',
    icon: TrendingUp,
    color: 'blue',
    roi: '12-18%',
    timeframe: '1-3 Yıl',
    pros: [
      'Hızlı geri dönüş',
      'Yüksek kar marjı potansiyeli',
      'Piyasa fırsatlarını değerlendirme',
    ],
    cons: [
      'Yüksek risk',
      'Aktif yönetim gerektirir',
      'Piyasa dalgalanmalarına duyarlı',
    ],
    suitableFor: 'Deneyimli yatırımcılar, risk toleransı yüksek olanlar',
  },
  {
    title: 'Uzun Vadeli Yatırım (5+ Yıl)',
    description: 'Sürdürülebilir gelir ve değer artışı',
    icon: Target,
    color: 'green',
    roi: '8-12%',
    timeframe: '5+ Yıl',
    pros: [
      'İstikrarlı kira geliri',
      'Değer artışı potansiyeli',
      'Düşük risk',
    ],
    cons: [
      'Yavaş geri dönüş',
      'Yüksek başlangıç sermayesi',
      'Likidite düşük',
    ],
    suitableFor: 'Emeklilik planlayanlar, uzun vadeli yatırımcılar',
  },
  {
    title: 'Portföy Çeşitlendirme',
    description: 'Risk dağıtımı ve gelir çeşitlendirmesi',
    icon: PieChart,
    color: 'purple',
    roi: '10-15%',
    timeframe: '3-5 Yıl',
    pros: [
      'Risk dağılımı',
      'Çeşitli gelir kaynakları',
      'Piyasa dalgalanmalarına dayanıklı',
    ],
    cons: [
      'Yüksek sermaye gerektirir',
      'Karmaşık yönetim',
      'Diversifikasyon maliyeti',
    ],
    suitableFor: 'Büyük yatırımcılar, portföy yönetimi yapanlar',
  },
];

const investmentSteps = [
  {
    step: 1,
    title: 'Hedef ve Bütçe Belirleme',
    description: 'Yatırım hedeflerinizi netleştirin ve bütçenizi belirleyin',
    icon: Target,
    details: [
      'Kısa vadeli mi uzun vadeli mi?',
      'Gelir odaklı mı değer artışı odaklı mı?',
      'Ne kadar sermaye ayırabilirsiniz?',
      'Risk toleransınız nedir?',
      'Beklenen getiri oranı',
    ],
  },
  {
    step: 2,
    title: 'Piyasa Araştırması ve Analiz',
    description: 'Piyasa koşullarını analiz edin ve fırsatları değerlendirin',
    icon: BarChart3,
    details: [
      'Bölgesel fiyat trendleri',
      'Talep ve arz dengesi',
      'Gelişim projeleri ve altyapı',
      'Ulaşım imkanları',
      'Turizm potansiyeli',
    ],
  },
  {
    step: 3,
    title: 'Emlak Seçimi ve Değerlendirme',
    description: 'Doğru emlakı seçin ve değerini belirleyin',
    icon: Home,
    details: [
      'Lokasyon analizi',
      'Emlak türü seçimi',
      'Fiyat değerlendirmesi',
      'Potansiyel getiri hesaplama',
      'Ekspertiz ve inceleme',
    ],
  },
  {
    step: 4,
    title: 'Finansman Planlama',
    description: 'Finansman seçeneklerini değerlendirin',
    icon: Calculator,
    details: [
      'Nakit mi kredi mi?',
      'Kredi seçenekleri ve faiz oranları',
      'Ödeme planı',
      'Vergi avantajları',
      'Nakit akışı planlaması',
    ],
  },
  {
    step: 5,
    title: 'Hukuki Süreçler',
    description: 'Yasal işlemleri tamamlayın',
    icon: Shield,
    details: [
      'Tapu kontrolü ve araştırma',
      'İpotek durumu',
      'Noter sözleşmesi',
      'Sigorta işlemleri',
      'Vergi yükümlülükleri',
    ],
  },
  {
    step: 6,
    title: 'Yatırım Yönetimi',
    description: 'Yatırımınızı yönetin ve performansı takip edin',
    icon: TrendingUp,
    details: [
      'Kiralama yönetimi',
      'Bakım ve onarım',
      'Vergi yükümlülükleri',
      'Performans takibi',
      'Portföy optimizasyonu',
    ],
  },
];

const roiExamples = [
  {
    type: 'Yazlık Konut',
    investment: 2500000,
    monthlyRent: 15000,
    annualRent: 180000,
    roi: 7.2,
    valueAppreciation: 5,
    totalReturn: 12.2,
    description: 'Yaz aylarında yüksek kiralama potansiyeli, sezonsal gelir',
  },
  {
    type: 'Merkez Daire',
    investment: 3000000,
    monthlyRent: 18000,
    annualRent: 216000,
    roi: 7.2,
    valueAppreciation: 4,
    totalReturn: 11.2,
    description: 'İstikrarlı uzun vadeli kiralama geliri, düşük boş kalma riski',
  },
  {
    type: 'Denize Yakın Villa',
    investment: 5000000,
    monthlyRent: 35000,
    annualRent: 420000,
    roi: 8.4,
    valueAppreciation: 8,
    totalReturn: 16.4,
    description: 'Premium lokasyon, yüksek getiri ve değer artışı potansiyeli',
  },
  {
    type: 'Arsa Yatırımı',
    investment: 2000000,
    monthlyRent: 0,
    annualRent: 0,
    roi: 0,
    valueAppreciation: 10,
    totalReturn: 10,
    description: 'Uzun vadeli değer artışı, gelişim projeleri ile yüksek potansiyel',
  },
];

const faqs = [
  {
    question: 'Emlak yatırımı yapmak için ne kadar sermaye gerekir?',
    answer: 'Emlak yatırımı için gereken sermaye, emlak türü, lokasyon ve finansman seçeneklerine göre değişir. Genellikle emlak değerinin %20-30\'u peşinat olarak yeterlidir. Kredi kullanarak yatırım yapabilirsiniz, ancak nakit yatırım daha avantajlı olabilir. Karasu bölgesinde 1.5 milyon TL\'den başlayan yatırım fırsatları bulunmaktadır.',
  },
  {
    question: 'Hangi emlak türleri yatırım için daha karlı?',
    answer: 'Yazlık konutlar, denize yakın villalar ve merkez konumlardaki daireler yatırım için karlı seçeneklerdir. Yazlık konutlar sezonsal yüksek kiralama geliri, denize yakın villalar premium fiyat ve değer artışı, merkez daireler ise istikrarlı uzun vadeli kiralama geliri sunar.',
  },
  {
    question: 'Yatırım getiri oranı (ROI) nasıl hesaplanır?',
    answer: 'ROI = (Yıllık Kira Geliri / Yatırım Tutarı) × 100 formülü ile hesaplanır. Örneğin, 3 milyon TL\'ye aldığınız bir emlak yılda 216.000 TL kira geliri getiriyorsa, ROI = (216.000 / 3.000.000) × 100 = %7.2\'dir. Ayrıca değer artışı da ROI\'ye dahil edilebilir.',
  },
  {
    question: 'Karasu\'da yatırım yapmak karlı mı?',
    answer: 'Karasu, denize yakın konumu, gelişen turizm altyapısı ve artan talep ile yatırım için cazip bir bölgedir. Yazlık konutlar ve denize yakın emlaklar yüksek kiralama geliri ve değer artışı potansiyeli sunar.',
  },
];

export default async function KapsamliYatirimRehberiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Yatırım', href: `${basePath}/yatirim` },
    { label: 'Kapsamlı Rehber', href: `${basePath}/yatirim/kapsamli-rehber` },
  ];

  // Fetch statistics
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006AFF]/10 mb-6">
                <BookOpen className="h-8 w-8 text-[#006AFF]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">
                Kapsamlı Yatırım Rehberi
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Emlak yatırımı yaparken bilmeniz gereken her şey. Stratejiler, risk analizi, getiri hesaplama ve karlı yatırım fırsatları.
              </p>
            </div>
          </div>
        </section>

        {/* Investment Strategies */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Yatırım Stratejileri
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Farklı yatırım yaklaşımları ve stratejileri
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {investmentStrategies.map((strategy, index) => {
                  const Icon = strategy.icon;
                  const colorClasses = {
                    blue: 'bg-blue-50 text-blue-600 border-blue-200',
                    green: 'bg-green-50 text-green-600 border-green-200',
                    purple: 'bg-purple-50 text-purple-600 border-purple-200',
                  };

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#006AFF]/40 hover:shadow-xl transition-all"
                    >
                      <div className={`w-16 h-16 ${colorClasses[strategy.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-6`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                        {strategy.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {strategy.description}
                      </p>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Getiri Oranı</div>
                          <div className="text-2xl font-bold text-[#006AFF]">{strategy.roi}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Süre</div>
                          <div className="text-2xl font-bold text-gray-900">{strategy.timeframe}</div>
                        </div>
                      </div>

                      {/* Pros */}
                      <div className="mb-6">
                        <div className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Avantajlar
                        </div>
                        <ul className="space-y-2">
                          {strategy.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div className="mb-6">
                        <div className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Dikkat Edilmesi Gerekenler
                        </div>
                        <ul className="space-y-2">
                          {strategy.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suitable For */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-2">KİMLER İÇİN UYGUN</div>
                        <div className="text-sm text-gray-700">{strategy.suitableFor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Investment Steps */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Yatırım Süreci
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Emlak yatırımı yaparken izlemeniz gereken adımlar
                </p>
              </div>

              <div className="space-y-8">
                {investmentSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#006AFF]/40 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl bg-[#006AFF]/10 flex items-center justify-center">
                            <div className="absolute w-16 h-16 rounded-xl bg-[#006AFF] text-white flex items-center justify-center text-2xl font-bold">
                              {step.step}
                            </div>
                            <Icon className="h-8 w-8 text-[#006AFF] relative z-10" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {step.description}
                          </p>
                          <ul className="grid md:grid-cols-2 gap-3">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ROI Examples */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Getiri Örnekleri
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Farklı emlak türlerinde yatırım getiri örnekleri
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {roiExamples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl border-2 border-gray-200 p-8 hover:border-[#006AFF]/40 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                          {example.type}
                        </h3>
                        <p className="text-gray-600 text-sm">{example.description}</p>
                      </div>
                      <Home className="h-8 w-8 text-[#006AFF] opacity-50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Yatırım Tutarı</div>
                        <div className="text-xl font-bold text-gray-900">
                          ₺{new Intl.NumberFormat('tr-TR').format(example.investment)}
                        </div>
                      </div>
                      {example.monthlyRent > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Aylık Kira</div>
                          <div className="text-xl font-bold text-green-600">
                            ₺{new Intl.NumberFormat('tr-TR').format(example.monthlyRent)}
                          </div>
                        </div>
                      )}
                      {example.annualRent > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Yıllık Kira</div>
                          <div className="text-xl font-bold text-green-600">
                            ₺{new Intl.NumberFormat('tr-TR').format(example.annualRent)}
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Değer Artışı</div>
                        <div className="text-xl font-bold text-blue-600">
                          %{example.valueAppreciation}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#006AFF]/10 rounded-xl p-6 border border-[#006AFF]/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-700">Toplam Getiri</div>
                        <div className="text-3xl font-bold text-[#006AFF]">
                          %{example.totalReturn}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Kira Getirisi: %{example.roi}</span>
                        <span>•</span>
                        <span>Değer Artışı: %{example.valueAppreciation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600">
                  Yatırım hakkında merak ettikleriniz
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 lg:p-12 space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-1" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#006AFF] to-blue-700">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Yatırım Danışmanlığı Alın
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Profesyonel yatırım danışmanlığı ile emlak yatırımınızı optimize edin. 
                Uzman ekibimiz size yardımcı olmaya hazır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim`}>
                    Danışmanlık Alın
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/yatirim-hesaplayici`}>
                    Getiri Hesapla
                    <Calculator className="h-5 w-5 ml-2" />
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
