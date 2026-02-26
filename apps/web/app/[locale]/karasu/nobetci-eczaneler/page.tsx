import { Metadata } from 'next';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Clock, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { PharmacyList } from '@/components/services/PharmacyList';
import { HealthArticlesSection } from '@/components/services/HealthArticlesSection';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const revalidate = 3600; // 1 hour
export const dynamicParams = true;



export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Nöbetçi Eczaneler | 7/24 Eczane Bilgileri | Sağlık Rehberi | Karasu Emlak',
    description: 'Karasu nöbetçi eczaneler, eczane telefon numaraları ve adresleri. 7/24 açık eczane bilgileri, acil ilaç ihtiyacı için iletişim ve sağlık rehberi....',
    keywords: [
      'karasu nöbetçi eczane',
      'karasu eczane telefon',
      'karasu eczane adresleri',
      'karasu 7/24 eczane',
      'karasu acil eczane',
      'sakarya karasu eczane',
      'karasu sağlık rehberi',
      'ilaç kullanımı',
      'nöbetçi eczane bilgileri',
      'acil ilaç temini',
      'reçeteli ilaçlar',
      'ilaç saklama koşulları',
      'sağlık bilgileri',
      'eczane rehberi',
    ],
    alternates: {
      canonical: `${basePath}/karasu/nobetci-eczaneler`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu/nobetci-eczaneler',
        'en': '/en/karasu/nobetci-eczaneler',
        'et': '/et/karasu/nobetci-eczaneler',
        'ru': '/ru/karasu/nobetci-eczaneler',
        'ar': '/ar/karasu/nobetci-eczaneler',
      }),
    },
    openGraph: {
      title: 'Karasu Nöbetçi Eczaneler | 7/24 Eczane Bilgileri | Sağlık Rehberi',
      description: 'Karasu nöbetçi eczaneler, eczane telefon numaraları ve adresleri. Acil ilaç ihtiyacı için 7/24 açık eczane bilgileri ve sağlık rehberi.',
      url: `${siteConfig.url}${basePath}/karasu/nobetci-eczaneler`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-pharmacy.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Nöbetçi Eczaneler',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Nöbetçi Eczaneler | 7/24 Eczane Bilgileri',
      description: 'Karasu nöbetçi eczaneler, telefon numaraları ve sağlık rehberi.',
    },
  };
}

const eczaneFAQs = [
  {
    question: 'Karasu\'da nöbetçi eczane nasıl öğrenilir?',
    answer: 'Karasu\'da nöbetçi eczane bilgilerini 7/24 Türk Eczacıları Birliği\'nin 444 0 332 numaralı hattından veya ilçe eczacılar odasından öğrenebilirsiniz. Ayrıca bazı eczanelerin kapılarında nöbetçi eczane listesi bulunmaktadır.',
  },
  {
    question: 'Karasu\'da nöbetçi eczane hangi saatlerde açık?',
    answer: 'Karasu\'da nöbetçi eczaneler 7/24 hizmet vermektedir. Hafta içi, hafta sonu ve resmi tatillerde de nöbetçi eczane bulunmaktadır.',
  },
  {
    question: 'Acil ilaç ihtiyacı için ne yapmalıyım?',
    answer: 'Acil ilaç ihtiyacınız için öncelikle nöbetçi eczaneyi arayarak ilacın mevcut olup olmadığını kontrol edin. Eğer ilaç bulunamazsa, en yakın hastane acil servisine başvurabilirsiniz.',
  },
];

export default async function NobetciEczanelerPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Nöbetçi Eczaneler', href: `${basePath}/karasu/nobetci-eczaneler` },
  ];

  const faqSchema = generateFAQSchema(eczaneFAQs);

  // Generate Article schemas for health articles (SEO boost)
  const healthArticleSchemas = [
    generateArticleSchema({
      headline: 'İlaç Kullanımında Dikkat Edilmesi Gerekenler',
      description: 'İlaç kullanırken dikkat edilmesi gereken önemli noktalar ve yan etkiler hakkında bilgiler.',
      datePublished: new Date().toISOString(),
    }),
    generateArticleSchema({
      headline: 'Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler',
      description: 'Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı ve dikkat edilmesi gerekenler.',
      datePublished: new Date().toISOString(),
    }),
    generateArticleSchema({
      headline: 'Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark',
      description: 'Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları ve güvenlik önlemleri.',
      datePublished: new Date().toISOString(),
    }),
    generateArticleSchema({
      headline: 'İlaç Saklama Koşulları ve Son Kullanma Tarihleri',
      description: 'İlaçların doğru saklama yöntemleri, son kullanma tarihlerinin önemi ve güvenli kullanım.',
      datePublished: new Date().toISOString(),
    }),
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      {healthArticleSchemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <header className="mb-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-10 mb-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    Karasu Nöbetçi Eczaneler
                  </h1>
                </div>
                <p className="text-base md:text-lg text-gray-700 max-w-3xl mb-6 leading-relaxed">
                  Karasu'da 7/24 hizmet veren nöbetçi eczaneler, telefon numaraları ve adresleri. Acil ilaç ihtiyacınız için güncel bilgiler. Sağlık rehberi, ilaç kullanımı ve eczane hizmetleri hakkında detaylı bilgiler.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">7/24</div>
                    <div className="text-xs md:text-sm text-gray-600">Hizmet</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">Güncel</div>
                    <div className="text-xs md:text-sm text-gray-600">Bilgiler</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">Hızlı</div>
                    <div className="text-xs md:text-sm text-gray-600">Erişim</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">444 0 332</div>
                    <div className="text-xs md:text-sm text-gray-600">Acil Hat</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </header>

          {/* Acil Durumlar İçin */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-gradient-to-br from-red-50 via-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-900 mb-3 flex items-center gap-2">
                    Acil İlaç İhtiyacı İçin
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 animate-pulse">
                      ACİL
                    </span>
                  </h2>
                  <p className="text-red-800 mb-4 text-base leading-relaxed">
                    Acil ilaç ihtiyacınız için nöbetçi eczane bilgilerini öğrenmek için:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:4440332"
                      className="group flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                          Türk Eczacıları Birliği
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors">
                          444 0 332 (7/24)
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </a>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Karasu Eczacılar Odası
                        </div>
                        <div className="text-sm text-gray-600">
                          (0264) XXX XX XX
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Nöbetçi Eczane Bilgileri */}
          <ScrollReveal direction="up" delay={200}>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Nöbetçi Eczane Nasıl Öğrenilir?
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-700 transition-colors">
                    Telefon ile Öğrenme
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Türk Eczacıları Birliği'nin <strong className="text-blue-700">444 0 332</strong> numaralı hattını arayarak güncel nöbetçi eczane bilgilerini öğrenebilirsiniz. Bu hat <strong>7/24</strong> hizmet vermektedir.
                  </p>
                </div>

                <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-700 transition-colors">
                    Eczane Kapılarında
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Karasu'daki eczanelerin kapılarında genellikle nöbetçi eczane listesi bulunmaktadır. Bu listeler <strong className="text-green-700">günlük olarak</strong> güncellenmektedir.
                  </p>
                </div>

                <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-purple-700 transition-colors">
                    Nöbetçi Eczane Saatleri
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Nöbetçi eczaneler <strong className="text-purple-700">7/24</strong> hizmet vermektedir. Hafta içi, hafta sonu ve resmi tatillerde de nöbetçi eczane bulunmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Nöbetçi Eczane Listesi */}
          <ScrollReveal direction="up" delay={300}>
            <PharmacyList city="Sakarya" district="Karasu" className="mb-8" />
          </ScrollReveal>

          {/* Sağlık Yazıları Bölümü */}
          <ScrollReveal direction="up" delay={400}>
            <HealthArticlesSection basePath={basePath} className="mb-8" />
          </ScrollReveal>

          {/* Sağlık İçerik Bölümü - SEO İçin */}
          <ScrollReveal direction="up" delay={500}>
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl p-8 md:p-10 mb-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Sağlık ve İlaç Kullanımı Hakkında Bilgiler
                </h2>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      İlaç Kullanımında Dikkat Edilmesi Gerekenler
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      İlaç kullanırken mutlaka doktor veya eczacı tavsiyesine uymalısınız. Reçeteli ilaçları sadece reçetede belirtilen dozda ve sürede kullanmalı, reçetesiz ilaçları da dikkatli kullanmalısınız. İlaçların yan etkileri hakkında bilgi sahibi olmak ve ilaç etkileşimlerine dikkat etmek önemlidir.
                    </p>
                    <Link
                      href={`${basePath}/blog/ilac-kullaniminda-dikkat-edilmesi-gerekenler`}
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
                    >
                      Devamını oku <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Acil Durumlarda İlaç Temini
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden yararlanabilirsiniz. Karasu'da 7/24 hizmet veren nöbetçi eczaneler, acil ilaç ihtiyaçlarınız için hazırdır. İlacın mevcut olup olmadığını önceden telefon ile kontrol etmeniz önerilir. Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurmalısınız.
                    </p>
                    <Link
                      href={`${basePath}/blog/acil-durumlarda-ilac-temini-ve-nobetci-eczaneler`}
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
                    >
                      Devamını oku <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      İlaç Saklama ve Son Kullanma Tarihleri
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      İlaçların doğru saklanması, etkinliklerini korumak için çok önemlidir. İlaçları serin, kuru ve ışıktan uzak yerlerde saklamalısınız. Son kullanma tarihi geçmiş ilaçları kesinlikle kullanmamalı ve eczaneye teslim etmelisiniz. İlaçların çocukların ulaşamayacağı yerlerde saklanması güvenlik açısından kritiktir.
                    </p>
                    <Link
                      href={`${basePath}/blog/ilac-saklama-kosullari-ve-son-kullanim-tarihleri`}
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
                    >
                      Devamını oku <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Reçeteli ve Reçetesiz İlaçlar
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Reçeteli ilaçlar, doktor kontrolünde kullanılması gereken ilaçlardır ve sadece reçete ile temin edilebilir. Reçetesiz ilaçlar ise eczanelerden doğrudan alınabilir ancak yine de eczacı danışmanlığı almak önemlidir. Her iki ilaç türünde de doğru kullanım ve dozaj bilgisi hayati önem taşır.
                    </p>
                    <Link
                      href={`${basePath}/blog/receteli-ve-recetesiz-ilaclar-arasindaki-fark`}
                      className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm"
                    >
                      Devamını oku <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Önemli Notlar */}
          <ScrollReveal direction="up" delay={600}>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Önemli Notlar
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Nöbetçi eczane bilgileri <strong>günlük olarak</strong> değişmektedir.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Acil durumlarda önce <strong>telefon ile arayarak</strong> ilacın mevcut olup olmadığını kontrol edin.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Reçeteli ilaçlar için mutlaka <strong>reçetenizi yanınızda</strong> bulundurun.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Nöbetçi eczaneler normal eczanelerden farklı olarak <strong>7/24 hizmet</strong> vermektedir.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* SEO İçerik Bölümü - Detaylı Bilgiler */}
          <ScrollReveal direction="up" delay={700}>
            <div className="mt-8 prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Karasu Nöbetçi Eczaneler Hakkında Detaylı Bilgiler
                </h2>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Nöbetçi Eczane Sistemi Nasıl Çalışır?
                    </h3>
                    <p className="mb-4">
                      Karasu'da nöbetçi eczane sistemi, Türk Eczacıları Birliği ve Sakarya Eczacılar Odası tarafından organize edilmektedir. Her gün farklı eczaneler nöbetçi olarak görevlendirilir ve 7/24 hizmet verirler. Bu sistem sayesinde acil ilaç ihtiyacı olan vatandaşlar her zaman bir eczaneye ulaşabilir.
                    </p>
                    <p>
                      Nöbetçi eczane listesi günlük olarak güncellenir ve eczanelerin kapılarında, eczacılar odası web sitesinde ve 444 0 332 numaralı hattan öğrenilebilir. Karasu'da bulunan tüm eczaneler bu sisteme dahildir ve dönüşümlü olarak nöbetçi görevi yaparlar.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Acil İlaç İhtiyacı Durumunda Ne Yapmalı?
                    </h3>
                    <p className="mb-4">
                      Acil ilaç ihtiyacı durumunda öncelikle nöbetçi eczaneyi telefon ile arayarak ilacın mevcut olup olmadığını kontrol etmelisiniz. Reçeteli ilaçlar için mutlaka reçetenizi yanınızda bulundurmalısınız. Eğer ilaç bulunamazsa, en yakın hastane acil servisine başvurabilir veya 112 acil servisi numarasını arayabilirsiniz.
                    </p>
                    <p>
                      Karasu'da nöbetçi eczaneler, hafta içi, hafta sonu ve resmi tatillerde de hizmet vermektedir. Özellikle gece saatlerinde ve tatil günlerinde acil ilaç ihtiyacı olan vatandaşlar için bu sistem hayati önem taşımaktadır.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      İlaç Kullanımında Dikkat Edilmesi Gerekenler
                    </h3>
                    <p className="mb-4">
                      İlaç kullanırken mutlaka doktor veya eczacı tavsiyesine uymalısınız. Reçeteli ilaçları sadece reçetede belirtilen dozda ve sürede kullanmalı, reçetesiz ilaçları da dikkatli kullanmalısınız. İlaçların yan etkileri hakkında bilgi sahibi olmak ve ilaç etkileşimlerine dikkat etmek önemlidir.
                    </p>
                    <p>
                      İlaçları doğru saklama koşullarında muhafaza etmek, son kullanma tarihlerini kontrol etmek ve çocukların ulaşamayacağı yerlerde saklamak güvenlik açısından kritiktir. Karasu'daki eczaneler, ilaç kullanımı hakkında danışmanlık hizmeti de vermektedir.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Karasu Eczaneleri ve Hizmetleri
                    </h3>
                    <p className="mb-4">
                      Karasu'da bulunan eczaneler, sadece ilaç satışı yapmakla kalmayıp, sağlık danışmanlığı, ilaç kullanımı hakkında bilgilendirme ve reçete okuma hizmetleri de sunmaktadır. Eczaneler, ilaçların doğru kullanımı, yan etkileri ve ilaç etkileşimleri konusunda vatandaşlara yardımcı olmaktadır.
                    </p>
                    <p>
                      Nöbetçi eczaneler, normal eczanelerden farklı olarak 7/24 hizmet vermektedir. Bu sayede acil ilaç ihtiyacı olan vatandaşlar her zaman bir eczaneye ulaşabilir. Karasu'da nöbetçi eczane bilgileri günlük olarak güncellenir ve vatandaşlara en güncel bilgiler sunulur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
