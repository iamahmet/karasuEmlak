import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageIntro } from '@/components/content';
import { FavoritesClient } from '@/components/favorites/FavoritesClient';
import { getListings } from '@/lib/supabase/queries';
import { Home, MapPin, ArrowRight, Search } from 'lucide-react';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


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
          { label: 'Ana Sayfa', href: basePath || '/' },
          { label: 'Favorilerim' },
        ]}
        className="mb-8"
      />

      <PageIntro
        title="Favorilerim"
        description="Beğendiğiniz ilanları buradan görüntüleyin ve karşılaştırın. Satılık ve kiralık emlak seçeneklerinizi tek yerden yönetin."
        className="mb-12"
      />

      <FavoritesClient allListings={listings} basePath={basePath} />

      {/* Internal Links */}
      <section className="mt-16 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-6">İlgili Sayfalar</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`${basePath}/satilik`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
            <Home className="h-6 w-6 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Satılık İlanlar</span>
              <p className="text-sm text-muted-foreground">Tüm satılık emlak ilanları</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
          <Link href={`${basePath}/kiralik`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
            <Home className="h-6 w-6 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Kiralık İlanlar</span>
              <p className="text-sm text-muted-foreground">Tüm kiralık emlak ilanları</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
          <Link href={`${basePath}/arama`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
            <Search className="h-6 w-6 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Arama</span>
              <p className="text-sm text-muted-foreground">Filtrelerle ilan arayın</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
          <Link href={`${basePath}/karsilastir`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
            <MapPin className="h-6 w-6 text-primary shrink-0" />
            <div>
              <span className="font-semibold">İlan Karşılaştırma</span>
              <p className="text-sm text-muted-foreground">İlanları karşılaştırın</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        </div>
      </section>
    </div>
  );
}

