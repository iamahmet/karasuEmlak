import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Award } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/hakkimizda/referanslar' 
    : `/${locale}/hakkimizda/referanslar`;

  return {
    title: 'Referanslar | Karasu Emlak',
    description: 'Karasu Emlak referansları ve başarı hikayeleri.',
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hakkımızda', href: `${basePath}/hakkimizda` },
    { label: 'Referanslar', href: `${basePath}/hakkimizda/referanslar` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumbs items={breadcrumbs} />
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006AFF]/10 mb-6">
              <Award className="h-8 w-8 text-[#006AFF]" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Referanslar
            </h1>
            <p className="text-xl text-gray-600">
              Müşterilerimizin başarı hikayeleri ve referansları.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Referanslar yakında eklenecek.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
