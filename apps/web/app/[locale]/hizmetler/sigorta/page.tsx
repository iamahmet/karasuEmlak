import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Shield, CheckCircle, Home, AlertTriangle, FileText, Building2, Phone, Mail, Clock, Award, Target, BarChart3, Zap, Star, ChevronRight, Info, Users, TrendingUp } from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { PageIntro } from '@/components/content/PageIntro';
import { ContentSection } from '@/components/content/ContentSection';
import { FAQBlock } from '@/components/content/FAQBlock';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import InsuranceQuoteForm from '@/components/insurance/InsuranceQuoteForm';

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
    ? '/hizmetler/sigorta' 
    : `/${locale}/hizmetler/sigorta`;

  return {
    title: 'Sigorta Danışmanlığı | Gayrimenkul Sigortası | Karasu Emlak',
    description: 'Gayrimenkul sigortası için profesyonel danışmanlık hizmeti. DASK, konut sigortası, yangın sigortası ve kapsamlı sigorta çözümleri.',
    keywords: [
      'karasu emlak sigorta',
      'gayrimenkul sigortası',
      'konut sigortası karasu',
      'DASK sigortası',
      'yangın sigortası',
      'emlak sigorta danışmanlığı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/hizmetler/sigorta`,
        'en': `${siteConfig.url}/en/hizmetler/sigorta`,
        'et': `${siteConfig.url}/et/hizmetler/sigorta`,
        'ru': `${siteConfig.url}/ru/hizmetler/sigorta`,
        'ar': `${siteConfig.url}/ar/hizmetler/sigorta`,
      },
    },
    openGraph: {
      title: 'Sigorta Danışmanlığı | Karasu Emlak',
      description: 'Gayrimenkul sigortası için profesyonel danışmanlık hizmeti.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Sigorta Danışmanlığı',
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

const insuranceTypes = [
  {
    icon: Home,
    title: 'DASK (Zorunlu Deprem Sigortası)',
    description: 'Tüm konutlar için zorunlu deprem sigortası danışmanlığı ve poliçe yönetimi.',
    features: [
      'Tapu devri için zorunlu',
      'Deprem ve afet koruması',
      'Hızlı poliçe işlemleri',
      'Yenileme hatırlatıcıları',
      'Online poliçe yönetimi',
    ],
  },
  {
    icon: Building2,
    title: 'Konut Sigortası',
    description: 'Kapsamlı konut sigortası çözümleri ve özel poliçe seçenekleri.',
    features: [
      'Yangın ve patlama koruması',
      'Hırsızlık ve vandalizm',
      'Su baskını ve sel',
      'Fırtına ve dolu hasarı',
      'Kişisel eşya koruması',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Yangın Sigortası',
    description: 'Yangın ve doğal afet risklerine karşı koruma sigortası.',
    features: [
      'Yangın hasarı koruması',
      'Patlama riski kapsamı',
      'Yıldırım hasarı',
      'Duman ve is hasarı',
      'Acil müdahale desteği',
    ],
  },
  {
    icon: FileText,
    title: 'Kapsamlı Sigorta Paketleri',
    description: 'Tüm risklere karşı kapsamlı sigorta paketleri ve özel çözümler.',
    features: [
      'Tüm risklere karşı koruma',
      'Özel paket seçenekleri',
      'Ekonomik fiyat avantajı',
      'Tek poliçe ile kapsamlı koruma',
      'Özel çözümler',
    ],
  },
];

const benefits = [
  {
    icon: Award,
    title: 'Uzman Danışmanlar',
    description: 'Sigorta sektöründe deneyimli ve sertifikalı danışmanlarımız ile profesyonel hizmet.',
  },
  {
    icon: Target,
    title: 'En Uygun Prim Seçenekleri',
    description: 'Piyasadaki tüm sigorta şirketlerini karşılaştırarak size en uygun prim seçeneklerini sunuyoruz.',
  },
  {
    icon: Zap,
    title: 'Hızlı Poliçe Yönetimi',
    description: 'Online sistemimiz ile poliçe işlemlerinizi hızlı ve kolay bir şekilde yönetebilirsiniz.',
  },
  {
    icon: Clock,
    title: '7/24 Destek Hattı',
    description: 'İhtiyaç duyduğunuz her an yanınızdayız. Kesintisiz destek ve danışmanlık hizmeti.',
  },
  {
    icon: BarChart3,
    title: 'Kapsamlı Risk Analizi',
    description: 'Gayrimenkulünüzün risklerini detaylı analiz ederek en uygun sigorta çözümünü belirliyoruz.',
  },
  {
    icon: Shield,
    title: 'Özel Sigorta Çözümleri',
    description: 'Her müşterinin ihtiyacına özel sigorta paketleri ve çözümler sunuyoruz.',
  },
];

const stats = [
  { value: '500+', label: 'Mutlu Müşteri' },
  { value: '1000+', label: 'Aktif Poliçe' },
  { value: '15+', label: 'Yıl Deneyim' },
  { value: '%98', label: 'Müşteri Memnuniyeti' },
];

const processSteps = [
  {
    step: '1',
    title: 'İletişim ve İhtiyaç Analizi',
    description: 'Sigorta ihtiyacınızı belirliyoruz. Gayrimenkulünüzün özelliklerini ve risklerini analiz ediyoruz.',
  },
  {
    step: '2',
    title: 'Teklif Hazırlama',
    description: 'Piyasadaki tüm sigorta şirketlerini karşılaştırarak size en uygun teklifleri hazırlıyoruz.',
  },
  {
    step: '3',
    title: 'Poliçe Düzenleme',
    description: 'Seçtiğiniz sigorta paketi için poliçe düzenleme işlemlerini hızlı ve güvenli şekilde tamamlıyoruz.',
  },
  {
    step: '4',
    title: 'Sürekli Destek',
    description: 'Poliçe süresi boyunca yanınızdayız. Yenileme, değişiklik ve hasar süreçlerinde destek sağlıyoruz.',
  },
];

export default async function SigortaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hizmetler', href: `${basePath}/hizmetler` },
    { label: 'Sigorta', href: `${basePath}/hizmetler/sigorta` },
  ];

  const faqs = [
    {
      question: 'DASK sigortası zorunlu mu?',
      answer: 'Evet, DASK (Zorunlu Deprem Sigortası) tüm konutlar için zorunludur. Tapu devri sırasında DASK poliçesi olmadan işlem yapılamaz. DASK sigortası, deprem sonrası oluşabilecek maddi zararları karşılamak için devlet tarafından zorunlu kılınmıştır.',
    },
    {
      question: 'Hangi sigorta türlerini öneriyorsunuz?',
      answer: 'DASK zorunlu olmakla birlikte, konut sigortası, yangın sigortası ve kapsamlı sigorta paketleri de önerilmektedir. İhtiyacınıza göre en uygun sigorta çözümünü sunuyoruz. Gayrimenkulünüzün konumu, değeri ve risk faktörlerine göre özel sigorta paketleri hazırlayabiliriz.',
    },
    {
      question: 'Sigorta primleri nasıl belirlenir?',
      answer: 'Sigorta primleri, gayrimenkulün değeri, konumu, yapı özellikleri, bina yaşı, risk faktörleri ve sigorta kapsamı dikkate alınarak belirlenmektedir. En uygun prim seçenekleri için danışmanlık hizmeti sunuyoruz. Piyasadaki tüm sigorta şirketlerini karşılaştırarak size en uygun fiyatı buluyoruz.',
    },
    {
      question: 'Sigorta poliçesi ne kadar süre geçerlidir?',
      answer: 'Sigorta poliçeleri genellikle 1 yıl süreyle geçerlidir. Poliçe süresi dolmadan önce yenileme işlemlerini yapmanız gerekmektedir. DASK sigortası da yıllık olarak yenilenmelidir. Yenileme hatırlatıcılarımız ile poliçenizin süresinin dolmasını önleyebilirsiniz.',
    },
    {
      question: 'Hasar durumunda ne yapmalıyım?',
      answer: 'Hasar durumunda öncelikle sigorta şirketinizi veya bizimle iletişime geçmelisiniz. Hasar bildirimi yapıldıktan sonra, sigorta şirketi tarafından ekspertiz yapılır ve hasar tutarı belirlenir. Süreç boyunca size rehberlik ediyor ve hasar dosyanızın takibini yapıyoruz.',
    },
    {
      question: 'Sigorta poliçesi değişikliği yapabilir miyim?',
      answer: 'Evet, sigorta poliçenizde değişiklik yapabilirsiniz. Poliçe kapsamını genişletme, daraltma veya prim tutarını değiştirme gibi işlemler yapılabilir. Değişiklik işlemleri için bizimle iletişime geçebilirsiniz. Online sistemimiz üzerinden de bazı değişiklikleri yapabilirsiniz.',
    },
    {
      question: 'Birden fazla gayrimenkul için sigorta yaptırabilir miyim?',
      answer: 'Evet, birden fazla gayrimenkul için sigorta yaptırabilirsiniz. Çoklu gayrimenkul sigortaları için özel paket fiyatları ve avantajlar sunuyoruz. Tüm gayrimenkullerinizi tek bir poliçe altında toplayarak daha ekonomik çözümler sunabiliriz.',
    },
    {
      question: 'Sigorta danışmanlığı hizmeti ücretli mi?',
      answer: 'Hayır, sigorta danışmanlığı hizmetimiz tamamen ücretsizdir. Size en uygun sigorta çözümünü bulmak ve poliçe işlemlerinizi yönetmek için herhangi bir ücret talep etmiyoruz. Hizmetimiz, sigorta şirketleri ile olan anlaşmalarımız sayesinde ücretsizdir.',
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
                  <Shield className="w-4 h-4 text-[#006AFF]" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profesyonel Hizmet</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Sigorta Danışmanlığı
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Gayrimenkulünüzü korumak için profesyonel sigorta danışmanlığı. DASK, konut sigortası ve kapsamlı sigorta çözümleri ile güvenli emlak yatırımları. 15+ yıllık deneyim ve uzman ekibimiz ile yanınızdayız.
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

        {/* Insurance Types Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Shield className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Sigorta Türleri
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gayrimenkulünüz için ihtiyaç duyabileceğiniz sigorta türleri
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceTypes.map((insurance, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-[#006AFF] dark:hover:border-[#006AFF]/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center mb-4 border border-[#006AFF]/20 dark:border-[#006AFF]/30">
                    <insurance.icon className="h-6 w-6 text-[#006AFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#006AFF] transition-colors">
                    {insurance.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {insurance.description}
                  </p>
                  {insurance.features && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ul className="space-y-2">
                        {insurance.features.map((feature, idx) => (
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
                    Sigorta danışmanlığı hizmetimizin avantajları
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
                    Sigorta Süreci
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Sigorta danışmanlığı hizmetimiz nasıl çalışır?
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

        {/* Importance Section - Modern Design */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                  <Info className="w-6 h-6 text-[#006AFF]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Gayrimenkul Sigortasının Önemi
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Emlak yatırımlarınızı korumak için sigorta neden önemlidir?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 lg:p-10 border-2 border-gray-200 dark:border-gray-800">
              <div className="prose prose-gray max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                  Gayrimenkul sigortası, emlak yatırımlarınızı korumak için kritik öneme sahiptir. 
                  Deprem, yangın, sel gibi doğal afetler ve diğer risklere karşı sigorta ile koruma 
                  altına alabilirsiniz.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                  DASK (Zorunlu Deprem Sigortası) tüm konutlar için zorunlu olmakla birlikte, 
                  kapsamlı konut sigortası paketleri ile tüm risklere karşı koruma sağlayabilirsiniz.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-4">Sigorta Kapsamı</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Deprem ve doğal afetler',
                    'Yangın ve patlama',
                    'Hırsızlık ve vandalizm',
                    'Su baskını ve sel',
                    'Fırtına ve dolu hasarı',
                    'Kişisel eşya koruması',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#006AFF] flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form Section */}
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#006AFF]/10 dark:bg-[#006AFF]/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-[#006AFF]" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Ücretsiz Sigorta Teklifi
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Size en uygun sigorta çözümünü bulalım
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                    <p>Piyasadaki tüm sigorta şirketlerini karşılaştırıyoruz</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                    <p>En uygun prim seçeneklerini sunuyoruz</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                    <p>Hızlı ve kolay poliçe işlemleri</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                    <p>7/24 destek ve danışmanlık hizmeti</p>
                  </div>
                </div>
              </div>
              <InsuranceQuoteForm />
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
                Sigorta danışmanlığı hakkında merak ettikleriniz
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
                Gayrimenkulünüzü Koruyun
              </h2>
              <p className="text-xl mb-8 text-white/90 dark:text-white/80">
                En uygun sigorta çözümleri için profesyonel danışmanlık hizmetimizden yararlanın.
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
