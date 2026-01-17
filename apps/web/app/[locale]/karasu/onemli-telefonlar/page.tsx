import { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Phone, Building2, Shield, Heart, GraduationCap, Flame, Car, ArrowRight } from 'lucide-react';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Önemli Telefonlar | Acil Durum ve Hizmet Numaraları | Karasu Emlak',
    description: 'Karasu önemli telefon numaraları: Acil durum, hastane, itfaiye, polis, belediye ve diğer kamu hizmetleri telefon numaraları.',
    keywords: [
      'karasu önemli telefonlar',
      'karasu acil telefon',
      'karasu belediye telefon',
      'karasu hastane telefon',
      'karasu itfaiye telefon',
      'karasu polis telefon',
      'sakarya karasu telefon',
    ],
    alternates: {
      canonical: `${basePath}/karasu/onemli-telefonlar`,
      languages: {
        'tr': '/karasu/onemli-telefonlar',
        'en': '/en/karasu/onemli-telefonlar',
        'et': '/et/karasu/onemli-telefonlar',
        'ru': '/ru/karasu/onemli-telefonlar',
        'ar': '/ar/karasu/onemli-telefonlar',
      },
    },
    openGraph: {
      title: 'Karasu Önemli Telefonlar | Acil Durum ve Hizmet Numaraları',
      description: 'Karasu önemli telefon numaraları: Acil durum, hastane, itfaiye, polis, belediye ve diğer kamu hizmetleri.',
      url: `${siteConfig.url}${basePath}/karasu/onemli-telefonlar`,
      type: 'website',
    },
  };
}

const telefonFAQs = [
  {
    question: 'Karasu\'da acil durum numarası nedir?',
    answer: 'Karasu\'da acil durumlar için 112 Acil Çağrı Merkezi\'ni arayabilirsiniz. Bu numara itfaiye, ambulans ve polis hizmetlerini tek bir numaradan yönetmektedir.',
  },
  {
    question: 'Karasu Belediyesi telefon numarası nedir?',
    answer: 'Karasu Belediyesi iletişim bilgileri için resmi web sitesinden veya belediye binasından öğrenebilirsiniz. Genellikle (0264) ile başlayan numaralar kullanılmaktadır.',
  },
  {
    question: 'Karasu\'da nöbetçi eczane nasıl öğrenilir?',
    answer: 'Karasu\'da nöbetçi eczane bilgilerini Türk Eczacıları Birliği\'nin 444 0 332 numaralı hattından veya ilçe eczacılar odasından öğrenebilirsiniz.',
  },
];

export default async function OnemliTelefonlarPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: 'Önemli Telefonlar', href: `${basePath}/karasu/onemli-telefonlar` },
  ];

  const faqSchema = generateFAQSchema(telefonFAQs);

  const telefonKategorileri = [
    {
      id: 'acil',
      title: 'Acil Durum',
      icon: Shield,
      telefonlar: [
        { ad: '112 Acil Çağrı Merkezi', numara: '112', aciklama: 'İtfaiye, Ambulans, Polis' },
        { ad: 'Jandarma', numara: '156', aciklama: 'Jandarma İmdat' },
      ],
    },
    {
      id: 'saglik',
      title: 'Sağlık',
      icon: Heart,
      telefonlar: [
        { ad: 'Karasu Devlet Hastanesi', numara: '(0264) XXX XX XX', aciklama: 'Ana Santral' },
        { ad: 'Acil Servis', numara: '(0264) XXX XX XX', aciklama: '7/24 Hizmet' },
        { ad: 'Nöbetçi Eczane', numara: '444 0 332', aciklama: 'Türk Eczacıları Birliği' },
      ],
    },
    {
      id: 'belediye',
      title: 'Belediye ve Kamu',
      icon: Building2,
      telefonlar: [
        { ad: 'Karasu Belediyesi', numara: '(0264) XXX XX XX', aciklama: 'Ana Santral' },
        { ad: 'Zabıta', numara: '(0264) XXX XX XX', aciklama: 'Zabıta Müdürlüğü' },
      ],
    },
    {
      id: 'guvenlik',
      title: 'Güvenlik',
      icon: Shield,
      telefonlar: [
        { ad: 'Polis İmdat', numara: '155', aciklama: 'Acil Durum' },
        { ad: 'Karasu İlçe Emniyet Müdürlüğü', numara: '(0264) XXX XX XX', aciklama: 'Ana Santral' },
      ],
    },
    {
      id: 'itfaiye',
      title: 'İtfaiye',
      icon: Flame,
      telefonlar: [
        { ad: 'İtfaiye İmdat', numara: '110', aciklama: 'Acil Durum' },
        { ad: 'Karasu İtfaiye', numara: '(0264) XXX XX XX', aciklama: 'Ana Santral' },
      ],
    },
    {
      id: 'egitim',
      title: 'Eğitim',
      icon: GraduationCap,
      telefonlar: [
        { ad: 'İlçe Milli Eğitim Müdürlüğü', numara: '(0264) XXX XX XX', aciklama: 'Ana Santral' },
      ],
    },
    {
      id: 'ulasim',
      title: 'Ulaşım',
      icon: Car,
      telefonlar: [
        { ad: 'Otobüs Firmaları', numara: '(0264) XXX XX XX', aciklama: 'Yerel Ulaşım' },
        { ad: 'Taksi Durağı', numara: '(0264) XXX XX XX', aciklama: 'Merkez Taksi' },
      ],
    },
  ];

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <header className="mb-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Karasu Önemli Telefonlar
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl">
                Karasu'da acil durum, sağlık, belediye, güvenlik ve diğer önemli hizmetlerin telefon numaraları.
              </p>
            </ScrollReveal>
          </header>

          {/* Acil Durum Vurgusu */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-gradient-to-br from-red-50 via-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-red-900">
                      Acil Durum: 112
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800 animate-pulse">
                      ACİL
                    </span>
                  </div>
                  <p className="text-red-800 text-lg mb-4 leading-relaxed">
                    İtfaiye, ambulans ve polis hizmetleri için tek numara. 7/24 hizmet veren acil çağrı merkezi.
                  </p>
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-200 group"
                  >
                    <Phone className="h-5 w-5" />
                    <span>112'yi Ara</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Telefon Kategorileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {telefonKategorileri.map((kategori, index) => {
              const Icon = kategori.icon;
              const colorClasses = [
                'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400 bg-blue-500',
                'from-green-50 to-green-100 border-green-200 hover:border-green-400 bg-green-500',
                'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400 bg-purple-500',
                'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400 bg-orange-500',
                'from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400 bg-pink-500',
                'from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-400 bg-indigo-500',
                'from-teal-50 to-teal-100 border-teal-200 hover:border-teal-400 bg-teal-500',
              ];
              const colorClass = colorClasses[index % colorClasses.length];
              const [bgFrom, bgTo, borderColor, hoverBorder, iconBg] = colorClass.split(' ');
              
              return (
                <ScrollReveal key={kategori.id} direction="up" delay={100 + index * 50}>
                  <div className={`bg-gradient-to-br ${bgFrom} ${bgTo} rounded-2xl border-2 ${borderColor} ${hoverBorder} p-6 hover:shadow-xl transition-all duration-300 group`}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {kategori.title}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {kategori.telefonlar.map((tel, telIndex) => (
                        <a
                          key={telIndex}
                          href={`tel:${tel.numara.replace(/\s/g, '').replace(/[()]/g, '')}`}
                          className="group/item block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover/item:text-primary transition-colors">
                                {tel.ad}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                {tel.aciklama}
                              </p>
                              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                <Phone className="h-4 w-4" />
                                <span className="group-hover/item:underline">{tel.numara}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Önemli Notlar */}
          <ScrollReveal direction="up" delay={400}>
            <div className="mt-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                  <Shield className="h-6 w-6 text-white" />
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
                    Acil durumlar için öncelikle <strong>112 Acil Çağrı Merkezi</strong>'ni arayın.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Telefon numaraları zaman zaman değişebilir. Güncel bilgiler için <strong>resmi web sitelerini</strong> kontrol edin.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Belediye ve kamu kurumları genellikle <strong>mesai saatleri</strong> içinde hizmet vermektedir.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Acil sağlık durumları için <strong>112'yi arayarak</strong> ambulans talep edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
