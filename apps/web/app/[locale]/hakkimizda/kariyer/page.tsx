import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Briefcase } from 'lucide-react';

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
    ? '/hakkimizda/kariyer' 
    : `/${locale}/hakkimizda/kariyer`;

  return {
    title: 'Kariyer | Karasu Emlak',
    description: 'Karasu Emlak\'ta kariyer fırsatları. Ekibimize katılın.',
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hakkımızda', href: `${basePath}/hakkimizda` },
    { label: 'Kariyer', href: `${basePath}/hakkimizda/kariyer` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumbs items={breadcrumbs} />
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006AFF]/10 mb-6">
              <Briefcase className="h-8 w-8 text-[#006AFF]" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Kariyer
            </h1>
            <p className="text-xl text-gray-600">
              Ekibimize katılın ve kariyerinizi geliştirin.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Kariyer fırsatları yakında eklenecek.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
