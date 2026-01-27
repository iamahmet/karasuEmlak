import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Info, CheckCircle, Users, FileText, TrendingUp, Home, Key, Phone, Mail, Clock, Shield, Award, Target, BarChart3, Handshake, Star, ArrowRight, ChevronRight, Calendar, MapPin, Briefcase, Lightbulb, Zap } from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { PageIntro } from '@/components/content/PageIntro';
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
    ? '/hizmetler/danismanlik' 
    : `/${locale}/hizmetler/danismanlik`;

  return {
    title: 'Emlak Danışmanlığı | Profesyonel Emlak Danışmanlık Hizmeti | Karasu Emlak',
    description: 'Profesyonel emlak danışmanlık hizmeti. Alım-satım, kiralama ve yatırım süreçlerinde yanınızdayız. Deneyimli ekibimiz ile güvenli emlak işlemleri.',
    keywords: [
      'karasu emlak danışmanlığı',
      'emlak danışmanı karasu',
      'emlak alım satım danışmanlığı',
      'emlak kiralama danışmanlığı',
      'emlak yatırım danışmanlığı',
      'karasu emlak danışman',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/hizmetler/danismanlik`,
        'en': `${siteConfig.url}/en/hizmetler/danismanlik`,
        'et': `${siteConfig.url}/et/hizmetler/danismanlik`,
        'ru': `${siteConfig.url}/ru/hizmetler/danismanlik`,
        'ar': `${siteConfig.url}/ar/hizmetler/danismanlik`,
      },
    },
    openGraph: {
      title: 'Emlak Danışmanlığı | Karasu Emlak',
      description: 'Profesyonel emlak danışmanlık hizmeti. Alım-satım, kiralama ve yatırım süreçlerinde yanınızdayız.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Danışmanlığı',
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
    icon: Home,
    title: 'Alım-Satım Danışmanlığı',
    description: 'Emlak alım-satım sürecinde profesyonel rehberlik. Fiyat değerlendirmesi, piyasa analizi ve işlem süreçleri. Deneyimli ekibimiz ile güvenli ve hızlı işlem garantisi.',
    features: ['Fiyat değerlendirmesi', 'Piyasa analizi', 'İşlem süreçleri', 'Belge takibi', 'Müzakere desteği'],
  },
  {
    icon: Key,
    title: 'Kiralama Danışmanlığı',
    description: 'Ev kiralama sürecinde uzman desteği. Kira değerlendirmesi, sözleşme hazırlama ve kiracı bulma. Hem ev sahipleri hem de kiracılar için kapsamlı hizmet.',
    features: ['Kira değerlendirmesi', 'Sözleşme hazırlama', 'Kiracı bulma', 'Kiracı değerlendirmesi', 'Süreç takibi'],
  },
  {
    icon: TrendingUp,
    title: 'Yatırım Danışmanlığı',
    description: 'Emlak yatırımı için stratejik danışmanlık. Yatırım fırsatları, risk analizi ve getiri değerlendirmesi. Uzun vadeli yatırım stratejileri ile değer kazandıran çözümler.',
    features: ['Yatırım fırsatları', 'Risk analizi', 'Getiri değerlendirmesi', 'Portföy yönetimi', 'Piyasa tahminleri'],
  },
  {
    icon: FileText,
    title: 'Fiyat Değerlendirmesi',
    description: 'Gayrimenkulünüzün gerçek piyasa değerini belirleme. Detaylı analiz ve raporlama ile doğru fiyatlandırma.',
    features: ['Piyasa analizi', 'Karşılaştırmalı değerleme', 'Detaylı rapor', 'Güncel fiyat bilgisi', 'Uzman görüşü'],
  },
  {
    icon: BarChart3,
    title: 'Piyasa Analizi',
    description: 'Bölgesel ve genel piyasa trendlerini analiz ederek yatırım kararlarınızı destekliyoruz.',
    features: ['Piyasa trendleri', 'Bölgesel analiz', 'Fiyat tahminleri', 'Yatırım potansiyeli', 'Rekabet analizi'],
  },
  {
    icon: Briefcase,
    title: 'Finansman Danışmanlığı',
    description: 'Emlak finansmanı konusunda uzman desteği. Kredi başvuruları, finansman seçenekleri ve ödeme planları.',
    features: ['Kredi danışmanlığı', 'Finansman seçenekleri', 'Ödeme planları', 'Başvuru desteği', 'Onay süreçleri'],
  },
];

const benefits = [
  {
    icon: Award,
    title: '10+ Yıllık Deneyim',
    description: 'Sektörde 10 yılı aşkın deneyimli ekibimiz ile güvenilir hizmet.',
  },
  {
    icon: MapPin,
    title: 'Bölge Uzmanlığı',
    description: 'Karasu ve çevresini yakından tanıyan yerel danışmanlar.',
  },
  {
    icon: Shield,
    title: 'Şeffaf ve Güvenilir',
    description: 'Tüm süreçlerde şeffaflık ve güvenilirlik önceliğimizdir.',
  },
  {
    icon: Clock,
    title: '7/24 Destek',
    description: 'İhtiyaç duyduğunuz her an yanınızdayız. Kesintisiz destek.',
  },
  {
    icon: BarChart3,
    title: 'Kapsamlı Piyasa Bilgisi',
    description: 'Güncel piyasa verileri ve detaylı analizler ile doğru kararlar.',
  },
  {
    icon: Target,
    title: 'Kişiye Özel Çözümler',
    description: 'Her müşterinin ihtiyacına özel çözümler ve stratejiler.',
  },
];

export default async function DanismanlikPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hizmetler', href: `${basePath}/hizmetler` },
    { label: 'Danışmanlık', href: `${basePath}/hizmetler/danismanlik` },
  ];

  const faqs = [
    {
      question: 'Emlak danışmanlığı hizmeti ne kadar sürer?',
      answer: 'Danışmanlık hizmeti süresi, ihtiyacınıza göre değişmektedir. Tek seferlik danışmanlık veya sürekli danışmanlık hizmeti seçenekleri sunulmaktadır. İlk görüşmede ihtiyacınızı belirleyip size uygun süreyi planlıyoruz. Genellikle tek seferlik danışmanlık 1-2 saat, sürekli danışmanlık ise aylık veya yıllık paketler halinde sunulmaktadır.',
    },
    {
      question: 'Danışmanlık ücreti nasıl belirlenir?',
      answer: 'Danışmanlık ücreti, hizmet kapsamı ve süresine göre belirlenmektedir. Şeffaf fiyatlandırma politikamız ile önceden belirlenen ücretler hakkında detaylı bilgi alabilirsiniz. İlk görüşmede ücretsiz değerlendirme yapıyoruz ve size özel fiyat teklifi sunuyoruz. Sabit ücret veya başarı bazlı ücretlendirme seçenekleri mevcuttur.',
    },
    {
      question: 'Hangi konularda danışmanlık alabilirim?',
      answer: 'Alım-satım, kiralama, yatırım, fiyat değerlendirmesi, piyasa analizi, hukuki süreçler ve finansman konularında danışmanlık hizmeti sunmaktayız. Ayrıca emlak portföy yönetimi, vergi planlaması ve yatırım stratejileri konularında da destek sağlıyoruz. Özel ihtiyaçlarınız için özel danışmanlık paketleri hazırlayabiliriz.',
    },
    {
      question: 'Danışmanlık hizmeti online alınabilir mi?',
      answer: 'Evet, online danışmanlık hizmeti de sunmaktayız. Video görüşme, telefon veya e-posta üzerinden danışmanlık alabilirsiniz. Özellikle ilk değerlendirme ve genel bilgilendirme için online danışmanlık idealdir. Detaylı analiz gerektiren durumlarda yüz yüze görüşme önerilir.',
    },
    {
      question: 'Danışmanlık sonrası destek alabilir miyim?',
      answer: 'Evet, danışmanlık hizmeti sonrası da destek alabilirsiniz. Sürekli danışmanlık paketlerimiz ile süreç boyunca yanınızdayız. Ayrıca tek seferlik danışmanlık sonrası da takip görüşmeleri ve ek destek hizmetleri sunmaktayız. Müşterilerimiz için özel destek hatlarımız mevcuttur.',
    },
    {
      question: 'Danışmanlık hizmeti hangi bölgelerde sunuluyor?',
      answer: 'Öncelikli olarak Karasu ve çevresinde hizmet vermekteyiz. Ancak Sakarya genelinde ve İstanbul\'a yakın bölgelerde de danışmanlık hizmeti sunmaktayız. Online danışmanlık ile Türkiye genelinde hizmet verebiliyoruz. Bölge dışı hizmetler için özel fiyatlandırma yapılmaktadır.',
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
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesyonel Hizmet</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Emlak Danışmanlığı
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Emlak işlemlerinizde profesyonel danışmanlık hizmeti. Alım-satım, kiralama ve yatırım süreçlerinde deneyimli ekibimiz ile yanınızdayız. 10+ yıllık deneyim ve bölge uzmanlığımız ile güvenilir çözümler sunuyoruz.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">10+ Yıl Deneyim</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güvenilir Hizmet</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">7/24 Destek</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
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

        {/* Services Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Danışmanlık Hizmetlerimiz
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak işlemlerinizde ihtiyaç duyabileceğiniz tüm danışmanlık hizmetleri
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border border-primary/20 dark:border-primary/30">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
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
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
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
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Neden Bizi Seçmelisiniz?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak danışmanlığı hizmetimizin avantajları
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/20 dark:border-primary/30">
                      <benefit.icon className="h-6 w-6 text-primary" />
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
                    Danışmanlık Süreci
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak danışmanlığı hizmetimiz nasıl çalışır?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 text-lg">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">İletişim</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">İhtiyacınızı bizimle paylaşın. Ücretsiz ilk görüşme ile başlıyoruz.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 text-lg">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Değerlendirme</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Durumunuzu detaylı analiz ediyoruz. Piyasa araştırması yapıyoruz.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 text-lg">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Çözüm</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Size özel çözüm ve strateji sunuyoruz. Detaylı rapor hazırlıyoruz.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4 text-lg">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Takip</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Süreç boyunca yanınızdayız. Düzenli güncellemeler ve destek.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Sık Sorulan Sorular
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Emlak danışmanlığı hakkında merak ettikleriniz
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 transition-all duration-200 hover:shadow-md">
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
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Telefon</h3>
                <a href="tel:+905325933854" className="text-primary hover:text-primary-dark dark:hover:text-primary-light font-medium">
                  +90 546 639 54 61
                </a>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">E-posta</h3>
                <a href="mailto:info@karasuemlak.net" className="text-primary hover:text-primary-dark dark:hover:text-primary-light font-medium text-sm">
                  info@karasuemlak.net
                </a>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 dark:border-primary/30">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Çalışma Saatleri</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pazartesi - Pazar: 09:00 - 20:00</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Modern Design */}
        <section className="py-20 bg-primary dark:bg-primary-dark text-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                Profesyonel Danışmanlık İster misiniz?
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                Emlak işlemlerinizde deneyimli ekibimiz ile yanınızdayız. Hemen iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100 px-8 py-6 text-lg">
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
