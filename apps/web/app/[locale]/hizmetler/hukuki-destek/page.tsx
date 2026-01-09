import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Scale, CheckCircle, FileText, Shield, AlertCircle, Users, Phone, Mail, Clock, Award, Target, Zap, Star, ChevronRight, Info, BarChart3, Gavel, FileCheck, Lock } from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { PageIntro } from '@/components/content/PageIntro';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/hizmetler/hukuki-destek' 
    : `/${locale}/hizmetler/hukuki-destek`;

  return {
    title: 'Hukuki Destek | Emlak Hukuku Danışmanlığı | Karasu Emlak',
    description: 'Emlak işlemlerinde hukuki destek ve danışmanlık hizmeti. Tapu işlemleri, sözleşme hazırlama, hukuki uygunluk kontrolleri ve emlak hukuku danışmanlığı.',
    keywords: [
      'karasu emlak hukuki destek',
      'emlak hukuku danışmanlığı',
      'tapu işlemleri danışmanlığı',
      'emlak sözleşme hazırlama',
      'karasu emlak hukuki danışmanlık',
      'gayrimenkul hukuku',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/hizmetler/hukuki-destek`,
        'en': `${siteConfig.url}/en/hizmetler/hukuki-destek`,
        'et': `${siteConfig.url}/et/hizmetler/hukuki-destek`,
        'ru': `${siteConfig.url}/ru/hizmetler/hukuki-destek`,
        'ar': `${siteConfig.url}/ar/hizmetler/hukuki-destek`,
      },
    },
    openGraph: {
      title: 'Hukuki Destek | Karasu Emlak',
      description: 'Emlak işlemlerinde hukuki destek ve danışmanlık hizmeti.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Hukuki Destek',
        },
      ],
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

const services = [
  {
    icon: FileText,
    title: 'Tapu İşlemleri Danışmanlığı',
    description: 'Tapu devri, ipotek işlemleri ve tapu kayıt kontrolleri konusunda profesyonel danışmanlık.',
    features: [
      'Tapu devri işlemleri',
      'İpotek işlemleri',
      'Tapu kayıt kontrolleri',
      'Tapu düzeltme işlemleri',
      'Hisseli tapu işlemleri',
    ],
  },
  {
    icon: Shield,
    title: 'Sözleşme Hazırlama',
    description: 'Emlak alım-satım ve kiralama sözleşmelerinin hazırlanması ve hukuki incelemesi.',
    features: [
      'Alım-satım sözleşmeleri',
      'Kiralama sözleşmeleri',
      'Sözleşme incelemesi',
      'Hukuki danışmanlık',
      'Sözleşme revizyonu',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Hukuki Uygunluk Kontrolü',
    description: 'Tapu, imar durumu, yapı ruhsatı ve yasal uygunluk kontrolleri.',
    features: [
      'Tapu kayıt kontrolü',
      'İmar durumu analizi',
      'Yapı ruhsatı kontrolü',
      'İskan belgesi kontrolü',
      'Yasal uygunluk raporu',
    ],
  },
  {
    icon: Users,
    title: 'Hukuki Danışmanlık',
    description: 'Emlak işlemlerinde karşılaşabileceğiniz hukuki sorunlar için danışmanlık hizmeti.',
    features: [
      'Hukuki sorun analizi',
      'Çözüm önerileri',
      'Yasal süreç danışmanlığı',
      'Uyuşmazlık çözümü',
      'Hukuki risk değerlendirmesi',
    ],
  },
];

const benefits = [
  {
    icon: Award,
    title: 'Deneyimli Hukuk Danışmanları',
    description: 'Emlak hukuku konusunda uzman ve deneyimli hukuk danışmanları ile profesyonel hizmet.',
  },
  {
    icon: Zap,
    title: 'Hızlı ve Güvenilir Hizmet',
    description: 'Hızlı yanıt süresi ve güvenilir hukuki destek. Acil durumlar için öncelikli hizmet.',
  },
  {
    icon: Target,
    title: 'Şeffaf Fiyatlandırma',
    description: 'Şeffaf ve önceden belirlenen fiyatlandırma. Gizli maliyet yok, net fiyat teklifi.',
  },
  {
    icon: FileCheck,
    title: 'Kapsamlı Hukuki İnceleme',
    description: 'Tüm yasal belgelerin detaylı incelenmesi ve kapsamlı hukuki raporlama.',
  },
  {
    icon: Shield,
    title: 'Yasal Uygunluk Garantisi',
    description: 'Tüm işlemlerin yasal uygunluğunun kontrolü ve garanti altına alınması.',
  },
  {
    icon: Clock,
    title: '7/24 Destek',
    description: 'İhtiyaç duyduğunuz her an yanınızdayız. Kesintisiz hukuki destek ve danışmanlık.',
  },
];

const stats = [
  { value: '500+', label: 'Hukuki İşlem' },
  { value: '15+', label: 'Yıl Deneyim' },
  { value: '%100', label: 'Yasal Uygunluk' },
  { value: '2-3', label: 'Gün Hizmet' },
];

const processSteps = [
  {
    step: '1',
    title: 'İletişim ve İhtiyaç Analizi',
    description: 'Hukuki destek ihtiyacınızı bizimle paylaşın. Uzman ekibimiz durumunuzu analiz eder.',
  },
  {
    step: '2',
    title: 'Belge İnceleme',
    description: 'Tüm yasal belgeleriniz detaylı olarak incelenir. Hukuki uygunluk kontrolü yapılır.',
  },
  {
    step: '3',
    title: 'Hizmet Sunumu',
    description: 'Profesyonel hukuki destek hizmeti sunulur. Sözleşme hazırlama veya danışmanlık sağlanır.',
  },
  {
    step: '4',
    title: 'Takip ve Destek',
    description: 'İşlem süresi boyunca yanınızdayız. Düzenli güncellemeler ve sürekli destek.',
  },
];

export default async function HukukiDestekPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hizmetler', href: `${basePath}/hizmetler` },
    { label: 'Hukuki Destek', href: `${basePath}/hizmetler/hukuki-destek` },
  ];

  const faqs = [
    {
      question: 'Hukuki destek hizmeti hangi konuları kapsar?',
      answer: 'Hukuki destek hizmetimiz tapu işlemleri, sözleşme hazırlama, hukuki uygunluk kontrolleri, ipotek işlemleri, emlak hukuku danışmanlığı, uyuşmazlık çözümü ve yasal süreç danışmanlığını kapsamaktadır. Tüm emlak işlemlerinizde hukuki destek sağlıyoruz.',
    },
    {
      question: 'Sözleşme hazırlama hizmeti ne kadar sürer?',
      answer: 'Sözleşme hazırlama hizmeti genellikle 2-3 iş günü içinde tamamlanmaktadır. Sözleşme türü ve karmaşıklığına göre bu süre değişebilir. Acil durumlarda hızlı hizmet seçeneği de sunulmaktadır. Öncelikli hizmet için ek ücret alınabilir.',
    },
    {
      question: 'Hukuki uygunluk kontrolü neleri kapsar?',
      answer: 'Hukuki uygunluk kontrolü tapu kayıtları, imar durumu, yapı ruhsatı, iskan belgesi, ipotek durumu, komşu hakları, yapı kullanma izni ve diğer yasal belgeleri kapsamaktadır. Kapsamlı bir kontrol ile tüm yasal riskler değerlendirilir.',
    },
    {
      question: 'Hukuki destek ücreti nasıl belirlenir?',
      answer: 'Hukuki destek ücreti, hizmet kapsamı, işlem karmaşıklığı ve süresine göre belirlenmektedir. Şeffaf fiyatlandırma politikamız ile önceden belirlenen ücretler hakkında detaylı bilgi alabilirsiniz. İlk görüşmede ücretsiz değerlendirme yapıyoruz.',
    },
    {
      question: 'Online hukuki danışmanlık alabilir miyim?',
      answer: 'Evet, online hukuki danışmanlık hizmeti de sunmaktayız. Video görüşme, telefon veya e-posta üzerinden danışmanlık alabilirsiniz. Özellikle genel bilgilendirme ve ön değerlendirme için online danışmanlık idealdir.',
    },
    {
      question: 'Tapu işlemlerinde nasıl yardımcı oluyorsunuz?',
      answer: 'Tapu işlemlerinde tapu devri, ipotek işlemleri, tapu kayıt kontrolleri, tapu düzeltme işlemleri ve hisseli tapu işlemlerinde danışmanlık sağlıyoruz. Tüm süreç boyunca yanınızdayız ve işlemlerinizin sorunsuz tamamlanmasını sağlıyoruz.',
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
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-lg">
                  <Gavel className="w-4 h-4 text-[#006AFF]" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesyonel Hizmet</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Hukuki Destek
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Emlak işlemlerinizde hukuki danışmanlık ve destek. Tapu işlemleri, sözleşme hazırlama ve hukuki uygunluk kontrolleri ile güvenli emlak işlemleri. 15+ yıllık deneyim ile yanınızdayız.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Award className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">15+ Yıl Deneyim</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Shield className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilir Hizmet</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Clock className="h-5 w-5 text-[#006AFF]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">7/24 Destek</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-[#006AFF] text-white hover:bg-[#0052CC] dark:bg-[#006AFF] dark:hover:bg-[#0052CC]">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen İletişime Geç
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
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
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
                  <Gavel className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Hukuki Destek Hizmetlerimiz
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak işlemlerinizde ihtiyaç duyabileceğiniz tüm hukuki hizmetler
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
                    Hukuki destek hizmetimizin avantajları
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
                    Hukuki Destek Süreci
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Hukuki destek hizmetimiz nasıl çalışır?
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
                Hukuki destek hakkında merak ettikleriniz
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
                <a href="tel:+905466395461" className="text-[#006AFF] hover:text-[#0052CC] dark:hover:text-[#006AFF] font-medium">
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
                Hukuki Destek İhtiyacınız mı Var?
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                Emlak işlemlerinizde hukuki danışmanlık ve destek için bizimle iletişime geçin.
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
