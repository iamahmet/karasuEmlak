import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FavoritesClient } from '@/components/favorites/FavoritesClient';
import { getListings } from '@/lib/supabase/queries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/favorilerim' : `/${locale}/favorilerim`;
  
  return {
    title: 'Favorilerim | Karasu Emlak',
    description: 'Favorilerinize eklediğiniz satılık ve kiralık gayrimenkul ilanları. Karasu emlak seçeneklerinizi buradan görüntüleyin.',
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false, // Favoriler sayfası kişisel olduğu için indexlenmez
      follow: true,
    },
    openGraph: {
      title: 'Favorilerim | Karasu Emlak',
      description: 'Favorilerinize eklediğiniz emlak ilanları',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  // Get all listings for favorites client
  const { listings } = await getListings({}, undefined, 1000, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { label: 'Favorilerim' },
        ]}
        className="mb-8"
      />

      {/* Page Header */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Favorilerim</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Beğendiğiniz ilanları buradan görüntüleyin ve karşılaştırın
        </p>
      </section>

      {/* Favorites Content */}
      <FavoritesClient allListings={listings} basePath={basePath} />
    </div>
  );
}

