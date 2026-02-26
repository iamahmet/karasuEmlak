import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ListingsClient } from '@/app/[locale]/satilik/ListingsClient';
import { MapPin, Home, Building2, Waves, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema } from '@/lib/seo/structured-data';


import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
const mahalleLabels: Record<string, { name: string; description: string }> = {
  merkez: {
    name: 'Karasu Merkez',
    description: 'Karasu\'nun kalbi, merkez mahallesi. Tüm hizmetlere yakın, canlı bir yaşam alanı.',
  },
  sahil: {
    name: 'Karasu Sahil',
    description: 'Denize sıfır konumda, muhteşem manzaralı sahil mahallesi. Yazlık ve sürekli yaşam için ideal.',
  },
  yali: {
    name: 'Karasu Yalı',
    description: 'Denize sıfır, lüks konutların bulunduğu prestijli mahalle. En iyi manzaralar burada.',
  },
  aziziye: {
    name: 'Karasu Aziziye',
    description: 'Sakin ve huzurlu bir mahalle. Aileler için ideal, güvenli bir yaşam alanı.',
  },
  cumhuriyet: {
    name: 'Karasu Cumhuriyet',
    description: 'Merkeze yakın, ulaşımı kolay mahalle. Modern konutlar ve sosyal alanlar.',
  },
  ataturk: {
    name: 'Karasu Atatürk',
    description: 'Atatürk Mahallesi, Karasu\'nun önemli mahallelerinden biri. Konforlu yaşam alanları.',
  },
  bota: {
    name: 'Karasu Bota',
    description: 'Denize yakın, sakin bir mahalle. Doğa ile iç içe yaşam.',
  },
  liman: {
    name: 'Karasu Liman',
    description: 'Liman bölgesi, denizcilik kültürünün yaşandığı mahalle. Özel bir atmosfer.',
  },
  camlik: {
    name: 'Karasu Çamlık',
    description: 'Çam ağaçları arasında, doğal güzelliklerle çevrili mahalle. Huzurlu yaşam.',
  },
  kurtulus: {
    name: 'Karasu Kurtuluş',
    description: 'Kurtuluş Mahallesi, Karasu\'nun köklü mahallelerinden biri. Geleneksel ve modern yaşam.',
  },
};

export async function generateStaticParams() {
  return Object.keys(mahalleLabels).map((mahalle) => ({
    mahalle,
  }));
}

export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mahalle: string }>;
}): Promise<Metadata> {
  const { locale, mahalle } = await params;
  const mahalleInfo = mahalleLabels[mahalle];

  if (!mahalleInfo) {
    return {
      title: 'Mahalle Bulunamadı',
    };
  }

  const canonicalPath = locale === routing.defaultLocale ? `/karasu/${mahalle}` : `/${locale}/karasu/${mahalle}`;

  return {
    title: `${mahalleInfo.name} | Karasu Emlak | Satılık ve Kiralık İlanlar`,
    description: `${mahalleInfo.description} ${mahalleInfo.name} mahallesinde satılık ve kiralık emlak ilanları. Denize sıfır konumlarda en güncel fırsatları keşfedin.`,
    keywords: [
      `${mahalleInfo.name.toLowerCase()} satılık`,
      `${mahalleInfo.name.toLowerCase()} kiralık`,
      `karasu ${mahalle} mahalle`,
      `karasu ${mahalle} emlak`,
      `karasu ${mahalle} daire`,
      `karasu ${mahalle} villa`,
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': `/karasu/${mahalle}`,
        'en': `/en/karasu/${mahalle}`,
        'et': `/et/karasu/${mahalle}`,
        'ru': `/ru/karasu/${mahalle}`,
        'ar': `/ar/karasu/${mahalle}`,
      }),
    },
    openGraph: {
      title: `${mahalleInfo.name} | Karasu Emlak`,
      description: `${mahalleInfo.description}`,
    },
  };
}

export default async function KarasuMahallePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mahalle: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  const { locale, mahalle } = await params;
  const paramsObj = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const mahalleInfo = mahalleLabels[mahalle];

  if (!mahalleInfo) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Karasu', href: `${basePath}/karasu` },
    { label: mahalleInfo.name, href: `${basePath}/karasu/${mahalle}` },
  ];

  // Fetch listings for this neighborhood
  const page = parseInt(paramsObj.page || '1', 10);
  const limit = 18;
  const offset = (page - 1) * limit;

  const filters: any = {
    location_neighborhood: [mahalleInfo.name],
  };

  if (paramsObj.status) {
    filters.status = paramsObj.status;
  }

  if (paramsObj.q) filters.query = paramsObj.q;
  if (paramsObj.minPrice) filters.min_price = parseInt(paramsObj.minPrice, 10);
  if (paramsObj.maxPrice) filters.max_price = parseInt(paramsObj.maxPrice, 10);
  if (paramsObj.minSize) filters.min_size = parseInt(paramsObj.minSize, 10);
  if (paramsObj.maxSize) filters.max_size = parseInt(paramsObj.maxSize, 10);
  if (paramsObj.rooms) filters.rooms = paramsObj.rooms.split(',').map(Number);

  const sortParam = paramsObj.sort || 'created_at-desc';
  const [sortField, sortOrder] = sortParam.split('-');
  const sortConfig = {
    field: sortField as 'price_amount' | 'created_at' | 'updated_at',
    order: sortOrder as 'asc' | 'desc',
  };

  const { listings, total } = await getListings(filters, sortConfig, limit, offset);
  const neighborhoods = await getNeighborhoods();

  const articleSchema = generateArticleSchema({
    headline: `${mahalleInfo.name} | Karasu Emlak`,
    description: `${mahalleInfo.description} ${mahalleInfo.name} mahallesinde satılık ve kiralık emlak ilanları.`,
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
    image: [`${siteConfig.url}/og-image.jpg`],
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {mahalleInfo.name}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl">
              {mahalleInfo.description}
            </p>
          </header>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href={`${basePath}/karasu/${mahalle}?status=satilik`}>
              <Button variant={paramsObj.status === 'satilik' ? 'default' : 'outline'}>
                <Home className="h-4 w-4 mr-2" />
                Satılık İlanlar
              </Button>
            </Link>
            <Link href={`${basePath}/karasu/${mahalle}?status=kiralik`}>
              <Button variant={paramsObj.status === 'kiralik' ? 'default' : 'outline'}>
                <Building2 className="h-4 w-4 mr-2" />
                Kiralık İlanlar
              </Button>
            </Link>
            <Link href={`${basePath}/karasu`}>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Tüm Karasu
              </Button>
            </Link>
          </div>

          <ListingsClient
            initialListings={listings}
            total={total}
            basePath={basePath}
            neighborhoods={neighborhoods || []}
            searchParams={{
              ...paramsObj,
              neighborhood: mahalleInfo.name,
            }}
          />
        </div>
      </div>
    </>
  );
}
