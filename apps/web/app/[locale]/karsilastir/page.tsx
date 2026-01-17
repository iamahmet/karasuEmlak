import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { EnhancedComparisonTable } from '@/components/comparison/EnhancedComparisonTable';
import { ComparisonBar } from '@/components/comparison/ComparisonBar';
import { getListings } from '@/lib/supabase/queries';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karsilastir' : `/${locale}/karsilastir`;
  
  return {
    title: 'İlan Karşılaştırma | Emlak Karşılaştırma Aracı | Karasu Emlak',
    description: 'Beğendiğiniz emlak ilanlarını yan yana karşılaştırın. Fiyat, özellikler ve konum karşılaştırması ile en uygun seçeneği bulun.',
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false, // Comparison pages are personal, don't index
      follow: true,
    },
    openGraph: {
      title: 'İlan Karşılaştırma | Emlak Karşılaştırma Aracı | Karasu Emlak',
      description: 'Beğendiğiniz emlak ilanlarını yan yana karşılaştırın. Fiyat, özellikler ve konum karşılaştırması.',
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  // Get all listings for comparison
  const { listings } = await getListings({}, undefined, 1000, 0);

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: 'İlan Karşılaştırma' },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">İlan Karşılaştırma</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Beğendiğiniz ilanları yan yana karşılaştırın ve en uygun seçeneği bulun. 
            Fiyat, özellikler ve konum karşılaştırması ile bilinçli karar verin.
          </p>
        </section>

        {/* Enhanced Comparison Table */}
        <section className="mb-12">
          <EnhancedComparisonTable allListings={listings} basePath={basePath} />
        </section>

        {/* Info Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Nasıl Kullanılır?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">İlanları Seçin</h3>
              <p className="text-sm text-muted-foreground">
                İlan kartlarındaki karşılaştırma butonuna tıklayarak ilanları ekleyin (maksimum 4 ilan)
              </p>
            </div>
            <div className="border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Karşılaştırın</h3>
              <p className="text-sm text-muted-foreground">
                Fiyat, özellikler, konum ve diğer detayları yan yana görüntüleyin
              </p>
            </div>
            <div className="border rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Karar Verin</h3>
              <p className="text-sm text-muted-foreground">
                Karşılaştırma sonuçlarına göre en uygun seçeneği belirleyin
              </p>
            </div>
          </div>
        </section>
      </div>
      <ComparisonBar basePath={basePath} />
    </>
  );
}

