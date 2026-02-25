import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Briefcase } from 'lucide-react';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { getPublishedStaticPage } from '@/lib/content/static-pages';

const CAREER_PAGE_SLUGS = ['hakkimizda/kariyer', 'hakkimizda-kariyer', 'kariyer'];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const staticPage = await getPublishedStaticPage({
    locale,
    slugCandidates: CAREER_PAGE_SLUGS,
    fallbackLocale: routing.defaultLocale,
  });
  const canonicalPath = locale === routing.defaultLocale 
    ? '/hakkimizda/kariyer' 
    : `/${locale}/hakkimizda/kariyer`;

  return {
    title: staticPage?.meta_title || staticPage?.title || 'Kariyer | Karasu Emlak',
    description: staticPage?.meta_description || 'Karasu Emlak\'ta kariyer fırsatları. Ekibimize katılın.',
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
  const staticPage = await getPublishedStaticPage({
    locale,
    slugCandidates: CAREER_PAGE_SLUGS,
    fallbackLocale: routing.defaultLocale,
  });

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
              {staticPage?.title || 'Kariyer'}
            </h1>
            <p className="text-xl text-gray-600">
              {staticPage?.meta_description || 'Ekibimize katılın ve kariyerinizi geliştirin.'}
            </p>
          </div>
          {staticPage?.content ? (
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <ContentRenderer
                content={staticPage.content}
                prose
                proseSize="base"
                processImages
                imageTitle={staticPage.title || 'Kariyer'}
                className="max-w-none"
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
              <p className="text-gray-700 font-medium mb-2">Kariyer içeriği henüz yayınlanmadı</p>
              <p className="text-sm text-gray-500">
                Admin panelindeki Statik Sayfalar bölümünden <code>hakkimizda/kariyer</code> slug&apos;ı ile içerik ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
