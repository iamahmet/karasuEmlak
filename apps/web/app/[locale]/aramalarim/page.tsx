import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SavedSearchesClient } from '@/components/searches/SavedSearchesClient';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/aramalarim' : `/${locale}/aramalarim`;
  
  return {
    title: 'Kayıtlı Aramalarım | Karasu Emlak',
    description: 'Kayıtlı arama kriterlerinizi buradan yönetin. Yeni ilanlar bulunduğunda size bildirim gönderilir.',
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false, // Personal page, don't index
      follow: true,
    },
    openGraph: {
      title: 'Kayıtlı Aramalarım | Karasu Emlak',
      description: 'Kayıtlı arama kriterlerinizi yönetin',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function SavedSearchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { label: 'Kayıtlı Aramalarım' },
        ]}
        className="mb-8"
      />

      {/* Page Header */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Kayıtlı Aramalarım</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Kayıtlı arama kriterlerinizi buradan yönetin. Yeni ilanlar bulunduğunda size bildirim gönderilir.
        </p>
      </section>

      {/* Saved Searches Content */}
      <SavedSearchesClient basePath={basePath} />
    </div>
  );
}
