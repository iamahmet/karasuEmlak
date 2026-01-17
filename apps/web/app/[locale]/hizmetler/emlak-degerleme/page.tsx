import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Scale, CheckCircle, FileText, Calculator, TrendingUp, Shield, Phone, Mail, Clock, Award, Target, Zap, Star, ChevronRight, Info, Users, BarChart3, MapPin, Home, Building2 } from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';

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
    ? '/hizmetler/emlak-degerleme' 
    : `/${locale}/hizmetler/emlak-degerleme`;

  return {
    title: 'Emlak Değerleme Hizmeti | Karasu Emlak',
    description: 'Profesyonel emlak değerleme hizmeti. Gayrimenkulünüzün gerçek piyasa değerini öğrenin. Uzman değerleme raporları ile yatırım kararlarınızı güvenle alın.',
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/hizmetler/emlak-degerleme`,
        'en': `${siteConfig.url}/en/hizmetler/emlak-degerleme`,
      },
    },
    openGraph: {
      title: 'Emlak Değerleme Hizmeti | Karasu Emlak',
      description: 'Profesyonel emlak değerleme hizmeti ile gayrimenkulünüzün gerçek değerini öğrenin.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const services = [
  {
    icon: FileText,
    title: 'Detaylı Değerleme Raporu',
    description: 'Gayrimenkulünüzün kapsamlı analizi ve değerleme raporu.',
    features: [
      'Kapsamlı fiziksel inceleme',
      'Piyasa karşılaştırması',
      'Detaylı mali analiz',
      'Görsel dokümantasyon',
      'Yasal uygunluk raporu',
    ],
  },
  {
    icon: Calculator,
    title: 'Piyasa Analizi',
    description: 'Bölgedeki benzer emlakların fiyat analizi ve karşılaştırması.',
    features: [
      'Bölgesel fiyat analizi',
      'Benzer emlak karşılaştırması',
      'Piyasa trend analizi',
      'Fiyat tahminleri',
      'Yatırım potansiyeli',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Yatırım Değerlendirmesi',
    description: 'Emlak yatırım potansiyeli ve karlılık analizi.',
    features: [
      'Getiri analizi',
      'Risk değerlendirmesi',
      'Yatırım senaryoları',
      'Karlılık hesaplamaları',
      'Uzun vadeli projeksiyon',
    ],
  },
  {
    icon: Shield,
    title: 'Hukuki Uygunluk Kontrolü',
    description: 'Tapu, imar durumu ve yasal uygunluk kontrolleri.',
    features: [
      'Tapu kayıt kontrolü',
      'İmar durumu analizi',
      'Yapı ruhsatı kontrolü',
      'İpotek durumu',
      'Yasal uygunluk raporu',
    ],
  },
];

const benefits = [
  {
    icon: Award,
    title: 'Uzman Değerleme Ekibi',
    description: 'Sektörde deneyimli ve sertifikalı değerleme uzmanları ile profesyonel hizmet.',
  },
  {
    icon: Zap,
    title: 'Hızlı ve Güvenilir Raporlama',
    description: '3-5 iş günü içinde detaylı değerleme raporu. Acil durumlar için hızlı hizmet.',
  },
  {
    icon: BarChart3,
    title: 'Piyasa Bazlı Değerleme',
    description: 'Güncel piyasa verileri ve benzer emlak karşılaştırması ile objektif değerleme.',
  },
  {
    icon: FileText,
    title: 'Detaylı Analiz ve Raporlama',
    description: 'Kapsamlı analiz ve görsel dokümantasyon ile profesyonel değerleme raporu.',
  },
  {
    icon: Shield,
    title: 'Hukuki Uygunluk Kontrolü',
    description: 'Tapu, imar durumu ve yasal uygunluk kontrolleri ile güvenli değerleme.',
  },
  {
    icon: TrendingUp,
    title: 'Yatırım Danışmanlığı',
    description: 'Değerleme sonrası yatırım danışmanlığı ve strateji önerileri.',
  },
];

const stats = [
  { value: '1000+', label: 'Değerleme Raporu' },
  { value: '15+', label: 'Yıl Deneyim' },
  { value: '%98', label: 'Müşteri Memnuniyeti' },
  { value: '3-5', label: 'Gün Raporlama' },
];

const processSteps = [
  {
    step: '1',
    title: 'Başvuru ve Bilgi Toplama',
    description: 'Değerleme talebinizi iletin. Gayrimenkul bilgilerini ve belgelerini paylaşın.',
  },
  {
    step: '2',
    title: 'Fiziksel İnceleme',
    description: 'Uzman ekibimiz gayrimenkulü yerinde inceler. Tüm detayları kayıt altına alır.',
  },
  {
    step: '3',
    title: 'Piyasa Analizi',
    description: 'Bölgedeki benzer emlakları analiz ederiz. Piyasa trendlerini değerlendiririz.',
  },
  {
    step: '4',
    title: 'Rapor Hazırlama',
    description: 'Detaylı değerleme raporu hazırlanır. Tüm analizler ve sonuçlar dokümante edilir.',
  },
];

export default async function EmlakDegerlemePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hizmetler', href: `${basePath}/hizmetler` },
    { label: 'Emlak Değerleme', href: `${basePath}/hizmetler/emlak-degerleme` },
  ];

  const faqs = [
    {
      question: 'Emlak değerleme nasıl yapılır?',
      answer: 'Emlak değerleme, gayrimenkulün konumu, büyüklüğü, yaşı, durumu, bina özellikleri ve bölgedeki benzer emlakların fiyatları dikkate alınarak yapılır. Uzman ekibimiz fiziksel inceleme, piyasa analizi ve detaylı hesaplamalar yaparak size kapsamlı bir değerleme raporu sunar. Değerleme sürecinde konum, metrekare, oda sayısı, bina yaşı, bakım durumu ve çevresel faktörler değerlendirilir.',
    },
    {
      question: 'Değerleme raporu ne kadar sürede hazırlanır?',
      answer: 'Değerleme raporu genellikle 3-5 iş günü içinde hazırlanır. Fiziksel inceleme, piyasa analizi ve rapor hazırlama süreçlerini içerir. Acil durumlarda hızlı değerleme hizmeti de sunmaktayız. Hızlı değerleme için ek ücret alınabilir ve süre 1-2 iş gününe düşürülebilir.',
    },
    {
      question: 'Değerleme ücreti ne kadar?',
      answer: 'Değerleme ücreti, gayrimenkulün tipi, büyüklüğü ve değerleme kapsamına göre değişiklik gösterir. Standart değerleme hizmeti için ücretlendirme yapılırken, detaylı rapor ve özel analizler için ek ücret alınabilir. Ücretsiz ön değerlendirme hizmeti de sunmaktayız.',
    },
    {
      question: 'Hangi belgeler gereklidir?',
      answer: 'Değerleme için tapu fotokopisi, kimlik belgesi, varsa yapı ruhsatı ve iskan belgesi, son 3 aylık aidat ödeme belgeleri ve gayrimenkulün fotoğrafları gereklidir. Ayrıca bina yönetim planı, varsa tadilat belgeleri ve diğer ilgili belgeler de faydalı olacaktır.',
    },
    {
      question: 'Değerleme raporu hangi amaçlarla kullanılabilir?',
      answer: 'Değerleme raporu, emlak alım-satım işlemleri, kredi başvuruları, sigorta işlemleri, miras paylaşımı, vergi hesaplamaları, yatırım kararları ve hukuki süreçler için kullanılabilir. Rapor, resmi kurumlar ve bankalar tarafından kabul edilen standartlarda hazırlanır.',
    },
    {
      question: 'Online değerleme yapılabilir mi?',
      answer: 'Temel bir değerleme için online bilgiler kullanılabilir ancak kesin ve güvenilir bir değerleme için fiziksel inceleme şarttır. Online değerleme, ön değerlendirme ve fikir verme amaçlı kullanılabilir. Kesin değerleme için uzman ekibimizin yerinde inceleme yapması gerekmektedir.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section - Modern & Minimal */}
        <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-16 lg:py-24 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="p-2 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-lg">
                  <Scale className="w-4 h-4 text-[#006AFF]" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesyonel Hizmet</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Emlak Değerleme Hizmeti
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Gayrimenkulünüzün gerçek piyasa değerini profesyonel değerleme hizmetimiz ile öğrenin. 
                Uzman ekibimiz detaylı analiz yaparak size güvenilir bir değerleme raporu sunar. 15+ yıllık deneyim ile yanınızdayız.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Award className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">15+ Yıl Deneyim</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Shield className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilir Raporlama</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Zap className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hızlı Hizmet</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-[#006AFF] text-white hover:bg-[#0052CC] dark:bg-[#006AFF] dark:hover:bg-[#0052CC]">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Ücretsiz Değerleme İste
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`${basePath}/hizmetler`}>
                    Tüm Hizmetler
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Accent Line */}
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-[#006AFF] dark:bg-[#0052CC] text-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Scale className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Değerleme Hizmetlerimiz
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Kapsamlı emlak değerleme hizmetleri ile yatırım kararlarınızı güvenle alın
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                    <service.icon className="h-6 w-6 text-[#006AFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#006AFF] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  {service.features && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-[#006AFF] flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Star className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Neden Bizi Seçmelisiniz?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Değerleme hizmetimizin avantajları
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center flex-shrink-0 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                      <benefit.icon className="h-6 w-6 text-[#006AFF]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Zap className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Değerleme Süreci
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Değerleme hizmetimiz nasıl çalışır?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-full bg-[#006AFF] text-white flex items-center justify-center font-bold mb-4 text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
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
                Emlak değerleme hakkında merak ettikleriniz
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
                Emlakınızın Değerini Öğrenin
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                Ücretsiz değerleme hizmetimizden yararlanın ve gayrimenkulünüzün gerçek değerini öğrenin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#006AFF] hover:bg-gray-100 dark:bg-white dark:text-[#006AFF] dark:hover:bg-gray-100 px-8 py-6 text-lg">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen İletişime Geç
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 px-8 py-6 text-lg">
                  <Link href={`${basePath}/hizmetler`}>
                    Tüm Hizmetler
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
