import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { 
  Handshake, 
  Users, 
  TrendingUp, 
  Award, 
  Gift,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  Target
} from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateServiceSchema } from '@/lib/seo/local-seo-schemas';
import Link from 'next/link';
import { Button } from '@karasu/ui';

export const dynamic = 'force-dynamic';
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
    ? '/is-ortagi-programi' 
    : `/${locale}/is-ortagi-programi`;

  return {
    title: 'İş Ortağı Programı | Karasu Emlak | Referans Programı',
    description: 'Karasu Emlak İş Ortağı Programı. Müşteri getirerek komisyon kazanın. Referans programı ile ek gelir elde edin. Güvenilir iş ortağı olun.',
    keywords: [
      'karasu emlak iş ortağı',
      'emlak referans programı',
      'karasu emlak komisyon',
      'emlak iş ortağı programı',
      'referans komisyonu',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/is-ortagi-programi`,
        'en': `${siteConfig.url}/en/is-ortagi-programi`,
      },
    },
    openGraph: {
      title: 'İş Ortağı Programı | Karasu Emlak',
      description: 'Karasu Emlak İş Ortağı Programı ile ek gelir elde edin.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const benefits = [
  {
    icon: DollarSign,
    title: 'Yüksek Komisyon',
    description: 'Her başarılı işlemde %2-5 arası komisyon kazanın. İşlem tutarına göre değişken komisyon oranları.',
  },
  {
    icon: Gift,
    title: 'Hediyeler ve Ödüller',
    description: 'Belirli sayıda referans sonrası özel hediyeler ve bonus ödemeleri. Aylık performans ödülleri.',
  },
  {
    icon: Users,
    title: 'Özel Destek',
    description: 'İş ortağı ekibimizden özel destek ve eğitim. Pazarlama materyalleri ve tanıtım desteği.',
  },
  {
    icon: TrendingUp,
    title: 'Büyüme Fırsatları',
    description: 'Başarılı iş ortakları için özel fırsatlar ve işbirliği imkanları. Uzun vadeli kazanç potansiyeli.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Başvuru Yapın',
    description: 'İş ortağı programına başvurun. Kısa bir form doldurarak başvurunuzu tamamlayın.',
  },
  {
    number: '2',
    title: 'Onay Alın',
    description: 'Başvurunuz değerlendirilir ve onaylandıktan sonra iş ortağı ekibimize katılırsınız.',
  },
  {
    number: '3',
    title: 'Referans Gönderin',
    description: 'Müşteri referanslarınızı gönderin. Her referans için özel takip kodu alırsınız.',
  },
  {
    number: '4',
    title: 'Komisyon Kazanın',
    description: 'Başarılı işlemler sonrası komisyonunuzu kazanın. Ödemeler düzenli olarak yapılır.',
  },
];

export default async function PartnerProgramPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'İş Ortağı Programı', href: `${basePath}/is-ortagi-programi` },
  ];

  // Generate schema
  const serviceSchema = generateServiceSchema({
    name: 'İş Ortağı Programı',
    description: 'Karasu Emlak İş Ortağı Programı - Referans programı ile ek gelir elde edin',
    provider: {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });

  return (
    <>
      <StructuredData data={serviceSchema} />
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006AFF]/10 mb-6">
                <Handshake className="h-8 w-8 text-[#006AFF]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">
                İş Ortağı Programı
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Karasu Emlak ile iş ortağı olun, müşteri getirerek komisyon kazanın. Referans programımız ile ek gelir elde edin.
              </p>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-[#006AFF] mb-2">%2-5</div>
                  <div className="text-sm text-gray-600">Komisyon Oranı</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                  <div className="text-sm text-gray-600">Aktif İş Ortağı</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold text-orange-600 mb-2">₺500K+</div>
                  <div className="text-sm text-gray-600">Ödenen Komisyon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Program Avantajları
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  İş ortağı programımızın size sağladığı avantajlar
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-[#006AFF]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Nasıl Çalışır?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  İş ortağı programına katılım süreci
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border-2 border-gray-200 p-6 relative"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#006AFF] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                  Komisyon Yapısı
                </h2>
                <p className="text-lg text-gray-600">
                  İşlem tutarına göre değişken komisyon oranları
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Satılık İşlemler</div>
                      <div className="text-sm text-gray-600">Daire, Villa, Ev</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#006AFF]">%3-5</div>
                      <div className="text-xs text-gray-600">İşlem Tutarına Göre</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Kiralama İşlemleri</div>
                      <div className="text-sm text-gray-600">Aylık Kira</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">%2-3</div>
                      <div className="text-xs text-gray-600">Aylık Kira Tutarına Göre</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Yatırım Danışmanlığı</div>
                      <div className="text-sm text-gray-600">Danışmanlık Hizmetleri</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">%5-10</div>
                      <div className="text-xs text-gray-600">Hizmet Tutarına Göre</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-[#006AFF]/10 rounded-xl border border-[#006AFF]/20">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-[#006AFF] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Ödeme Garantisi</h4>
                      <p className="text-sm text-gray-700">
                        Komisyonlarınız işlem tamamlandıktan sonra 7 iş günü içinde ödenir. 
                        Tüm ödemeler şeffaf ve takip edilebilir sistem üzerinden yapılır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#006AFF] to-blue-700">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                İş Ortağımız Olun
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Karasu Emlak İş Ortağı Programı'na katılın ve ek gelir elde edin. 
                Başvurunuzu hemen yapın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim?subject=is-ortagi-basvuru`}>
                    Başvuru Yapın
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/hakkimizda`}>
                    Daha Fazla Bilgi
                    <ArrowRight className="h-5 w-5 ml-2" />
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
