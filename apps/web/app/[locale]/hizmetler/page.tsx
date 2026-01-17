import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Scale, Info, Shield, ArrowRight } from 'lucide-react';

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
    ? '/hizmetler' 
    : `/${locale}/hizmetler`;

  return {
    title: 'Hizmetlerimiz | Karasu Emlak',
    description: 'Profesyonel emlak hizmetleri: Değerleme, danışmanlık, hukuki destek ve sigorta danışmanlığı. Güvenilir çözümler için bize ulaşın.',
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

const services = [
  {
    title: 'Emlak Değerleme',
    description: 'Gayrimenkulünüzün gerçek piyasa değerini öğrenin.',
    href: '/hizmetler/emlak-degerleme',
    icon: Scale,
  },
  {
    title: 'Danışmanlık',
    description: 'Emlak alım-satım sürecinde profesyonel danışmanlık.',
    href: '/hizmetler/danismanlik',
    icon: Info,
  },
  {
    title: 'Hukuki Destek',
    description: 'Emlak işlemlerinde hukuki destek ve danışmanlık.',
    href: '/hizmetler/hukuki-destek',
    icon: Scale,
  },
  {
    title: 'Sigorta Danışmanlığı',
    description: 'Gayrimenkul sigortası için profesyonel danışmanlık.',
    href: '/hizmetler/sigorta',
    icon: Shield,
  },
];

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hizmetler', href: `${basePath}/hizmetler` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumbs items={breadcrumbs} />
      
      <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Hizmetlerimiz
            </h1>
            <p className="text-xl text-gray-600">
              Profesyonel emlak hizmetleri ile yanınızdayız.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {services.map((service) => (
              <Link
                key={service.href}
                href={`${basePath}${service.href}`}
                className="p-6 rounded-xl border border-gray-200 hover:border-[#006AFF] hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 flex items-center justify-center group-hover:bg-[#006AFF] transition-colors">
                    <service.icon className="h-6 w-6 text-[#006AFF] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#006AFF] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center text-[#006AFF] font-medium">
                      Detaylar
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
