import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getPropertyTypes, getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ListingsClient } from '@/app/[locale]/kiralik/ListingsClient';
import { Home, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';


import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
const propertyTypeLabels: Record<string, string> = {
  daire: 'Daire',
  villa: 'Villa',
  ev: 'Ev',
  yazlik: 'Yazlık',
  arsa: 'Arsa',
  isyeri: 'İşyeri',
  dukkan: 'Dükkan',
};

export async function generateStaticParams() {
  const propertyTypes = await getPropertyTypes();
  return propertyTypes.map((type) => ({
    tip: type.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tip: string }>;
}): Promise<Metadata> {
  const { locale, tip } = await params;
  const propertyTypes = await getPropertyTypes();
  const propertyType = propertyTypes.find((t) => t.toLowerCase() === tip);

  if (!propertyType) {
    return {
      title: 'Emlak Tipi Bulunamadı',
    };
  }

  const typeLabel = propertyTypeLabels[propertyType] || propertyType;
  const canonicalPath = locale === routing.defaultLocale ? `/kiralik/${tip}` : `/${locale}/kiralik/${tip}`;

  return {
    title: `Kiralık ${typeLabel} İlanları | Karasu Emlak`,
    description: `Karasu'da kiralık ${typeLabel.toLowerCase()} ilanları. Denize sıfır konumlarda kiralık ${typeLabel.toLowerCase()} seçenekleri. En güncel fırsatları keşfedin.`,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': `/kiralik/${tip}`,
        'en': `/en/kiralik/${tip}`,
        'et': `/et/kiralik/${tip}`,
        'ru': `/ru/kiralik/${tip}`,
        'ar': `/ar/kiralik/${tip}`,
      }),
    },
    openGraph: {
      title: `Kiralık ${typeLabel} İlanları | Karasu Emlak`,
      description: `Karasu'da kiralık ${typeLabel.toLowerCase()} ilanları`,
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function KiralikTipPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tip: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    neighborhood?: string;
    sort?: string;
  }>;
}) {
  const { locale, tip } = await params;
  const paramsObj = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const propertyTypes = await getPropertyTypes();
  const propertyType = propertyTypes.find((t) => t.toLowerCase() === tip);

  if (!propertyType) {
    notFound();
  }

  const typeLabel = propertyTypeLabels[propertyType] || propertyType;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Kiralık İlanlar', href: `${basePath}/kiralik` },
    { label: `Kiralık ${typeLabel}`, href: `${basePath}/kiralik/${tip}` },
  ];

  // Fetch listings with type filter
  const page = parseInt(paramsObj.page || '1', 10);
  const limit = 18;
  const offset = (page - 1) * limit;

  const filters: any = {
    property_type: [propertyType],
    status: 'kiralik',
  };

  if (paramsObj.q) filters.query = paramsObj.q;
  if (paramsObj.minPrice) filters.min_price = parseInt(paramsObj.minPrice, 10);
  if (paramsObj.maxPrice) filters.max_price = parseInt(paramsObj.maxPrice, 10);
  if (paramsObj.minSize) filters.min_size = parseInt(paramsObj.minSize, 10);
  if (paramsObj.maxSize) filters.max_size = parseInt(paramsObj.maxSize, 10);
  if (paramsObj.rooms) filters.rooms = paramsObj.rooms.split(',').map(Number);
  if (paramsObj.neighborhood) filters.location_neighborhood = paramsObj.neighborhood.split(',');

  const sortParam = paramsObj.sort || 'created_at-desc';
  const [sortField, sortOrder] = sortParam.split('-');
  const sortConfig = {
    field: sortField as 'price_amount' | 'created_at' | 'updated_at',
    order: sortOrder as 'asc' | 'desc',
  };

  const { listings, total } = await getListings(filters, sortConfig, limit, offset);
  const neighborhoods = await getNeighborhoods();

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kiralık {typeLabel} İlanları
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Karasu ve çevresinde kiralık {typeLabel.toLowerCase()} ilanları. Denize sıfır konumlarda en güncel fırsatları keşfedin.
            </p>
          </header>

          <ListingsClient
            initialListings={listings}
            total={total}
            basePath={basePath}
            neighborhoods={neighborhoods || []}
            searchParams={{
              ...paramsObj,
              propertyType: propertyType,
            }}
          />
        </div>
      </div>
    </>
  );
}
