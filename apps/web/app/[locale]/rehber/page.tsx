import { Button } from '@karasu/ui';

import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import type { Metadata } from 'next';
import { BookOpen, FileText, HelpCircle, Info, CheckCircle, ArrowRight, Calculator, TrendingUp } from 'lucide-react';
import { GuidePageHero } from '@/components/guides/GuidePageHero';
import dynamicImport from 'next/dynamic';

const TrustSignalsBar = dynamicImport(() => import('@/components/trust/TrustSignalsBar').then(mod => ({ default: mod.TrustSignalsBar })), {
  loading: () => null,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehber' : `/${locale}/rehber`;
  
  return {
    title: 'Emlak Rehberi | Kapsamlı Emlak Bilgileri ve Uzman Tavsiyeleri | Karasu Emlak',
    description: 'Emlak alım-satım, kiralama ve yatırım rehberleri. Kapsamlı bilgiler, uzman tavsiyeleri ve pratik ipuçları ile emlak işlemlerinizi kolaylaştırın.',
    keywords: [
      'emlak rehberi',
      'emlak alım satım rehberi',
      'emlak kiralama rehberi',
      'emlak yatırım rehberi',
      'gayrimenkul rehberi',
      'emlak danışmanlığı',
      'karasu emlak rehberi',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/rehber',
        'en': '/en/rehber',
        'et': '/et/rehber',
        'ru': '/ru/rehber',
        'ar': '/ar/rehber',
      },
    },
    openGraph: {
      title: 'Emlak Rehberi | Kapsamlı Emlak Bilgileri ve Uzman Tavsiyeleri',
      description: 'Emlak alım-satım, kiralama ve yatırım rehberleri. Kapsamlı bilgiler ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Since localePrefix is "as-needed", we don't need /tr prefix for default locale
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const guideCategories = [
    {
      id: 1,
      title: "Emlak Alım-Satım Rehberi",
      description: "Emlak alım-satım sürecinde bilmeniz gerekenler",
      icon: FileText,
      href: `${basePath}/rehber/emlak-alim-satim`,
    },
    {
      id: 2,
      title: "Kiralama Rehberi",
      description: "Ev kiralama sürecinde dikkat edilmesi gerekenler",
      icon: BookOpen,
      href: `${basePath}/rehber/kiralama`,
    },
    {
      id: 3,
      title: "Yatırım Rehberi",
      description: "Emlak yatırımı yaparken bilmeniz gerekenler",
      icon: Info,
      href: `${basePath}/rehber/yatirim`,
    },
    {
      id: 4,
      title: "Sık Sorulan Sorular",
      description: "Emlak ile ilgili sık sorulan sorular ve cevapları",
      icon: HelpCircle,
      href: `${basePath}/sss`,
    },
  ];

  const detailedGuides = [
    {
      id: 1,
      title: "Ev Nasıl Alınır?",
      description: "Ev alma sürecinde bilmeniz gereken her şey",
      href: `${basePath}/rehberler/ev-nasil-alinir`,
      category: "Alım-Satım",
    },
    {
      id: 2,
      title: "Ev Nasıl Satılır?",
      description: "Evinizi satmak için adım adım rehber",
      href: `${basePath}/rehberler/ev-nasil-satilir`,
      category: "Alım-Satım",
    },
    {
      id: 3,
      title: "Ev Nasıl Kiralanır?",
      description: "Ev kiralama sürecinde dikkat edilmesi gerekenler",
      href: `${basePath}/rehberler/ev-nasil-kiralanir`,
      category: "Kiralama",
    },
    {
      id: 4,
      title: "Konut Kredisi Nasıl Alınır?",
      description: "Kredi başvuru süreci ve gerekli belgeler",
      href: `${basePath}/rehberler/kredi-nasil-alinir`,
      category: "Finans",
    },
    {
      id: 5,
      title: "Tapu İşlemleri",
      description: "Tapu devir süreci ve masraflar",
      href: `${basePath}/rehberler/tapu-islemleri`,
      category: "Yasal",
    },
    {
      id: 6,
      title: "Ekspertiz Süreci",
      description: "Emlak değerleme ve ekspertiz",
      href: `${basePath}/rehberler/ekspertiz-sureci`,
      category: "Yasal",
    },
    {
      id: 7,
      title: "Emlak Vergisi",
      description: "Emlak vergisi hesaplama ve ödeme",
      href: `${basePath}/rehberler/emlak-vergisi`,
      category: "Yasal",
    },
    {
      id: 8,
      title: "Yatırım Yapma",
      description: "Emlak yatırım stratejileri ve risk analizi",
      href: `${basePath}/rehberler/yatirim-yapma`,
      category: "Yatırım",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <GuidePageHero basePath={basePath} />

      {/* Trust Signals Bar */}
      <div className="border-b border-gray-200">
        <TrustSignalsBar variant="compact" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Emlak Rehberi</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
              Emlak alım-satım, kiralama ve yatırım süreçlerinde bilmeniz gereken tüm bilgiler. Uzman ekibimiz tarafından hazırlanmış kapsamlı rehberler.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Kapsamlı Rehberler</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Uzman İpuçları</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Yasal Süreçler</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {guideCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} href={category.href}>
                <div className="group border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-xl transition-all h-full bg-white">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                    {category.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                    <span>Detaylı Bilgi</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Detailed Guides */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Detaylı Rehberler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {detailedGuides.map((guide) => (
              <Link key={guide.id} href={guide.href}>
                <div className="group border border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-lg transition-all bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Hesaplayıcılar ve Araçlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`${basePath}/kredi-hesaplayici`}>
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Kredi Hesaplayıcı</h3>
                </div>
                <p className="text-sm text-gray-600">Konut kredisi ödeme planınızı hesaplayın</p>
              </div>
            </Link>
            <Link href={`${basePath}/yatirim-hesaplayici`}>
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Yatırım Hesaplayıcı</h3>
                </div>
                <p className="text-sm text-gray-600">Kira getirisi ve ROI hesaplayın</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12 mb-12 border border-gray-200">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Hızlı İpuçları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Emlak Alırken</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tapu durumunu mutlaka kontrol edin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Yapı ruhsatı ve iskan durumunu sorgulayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Çevresel faktörleri değerlendirin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Uzman bir emlak danışmanından destek alın</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Kiralarken</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Kira sözleşmesini detaylı inceleyin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Depozito ve kira artış oranlarını öğrenin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Emlak sahibinin kimliğini doğrulayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Emlakın durumunu fotoğraflayın</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Yatırım Yaparken</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Bölge potansiyelini araştırın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Uzun vadeli değer artışını değerlendirin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Kira getirisi potansiyelini hesaplayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Yasal düzenlemeleri takip edin</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Yardıma mı ihtiyacınız var?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Uzman ekibimiz emlak alım-satım, kiralama ve yatırım süreçlerinde size rehberlik etmeye hazır. Tüm sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${basePath}/iletisim`}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                İletişime Geç
              </Button>
            </Link>
            <Link href={`${basePath}/satilik`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                İlanları İncele
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
