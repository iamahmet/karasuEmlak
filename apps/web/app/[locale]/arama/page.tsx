import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteConfig } from '@karasu-emlak/config';

import { routing } from '@/i18n/routing';
import { getListings } from '@/lib/supabase/queries/listings';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Search } from 'lucide-react';
import { AramaClient } from './AramaClient';
import { TrustSignalsBar } from '@/components/trust/TrustSignalsBar';
import { withTimeout } from '@/lib/utils/timeout';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    propertyType?: string;
    neighborhood?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const title = query 
    ? `Arama Sonuçları: ${query} | Karasu Emlak` 
    : 'Arama | Karasu Emlak';
  
  const description = query
    ? `"${query}" için arama sonuçları. Karasu'da satılık ve kiralık gayrimenkul ilanları.`
    : 'Karasu emlak ilanlarında arama yapın. Satılık ve kiralık gayrimenkul seçenekleri.';

  return {
    title,
    description,
    keywords: [
      'karasu emlak arama',
      'karasu satılık ev arama',
      'karasu kiralık daire arama',
      'karasu gayrimenkul arama',
    ],
    alternates: {
      canonical: `${basePath}/arama`,
      languages: {
        'tr': '/arama',
        'en': '/en/arama',
        'et': '/et/arama',
        'ru': '/ru/arama',
        'ar': '/ar/arama',
      },
    },
    robots: {
      index: !query, // Index base page, noindex when query params exist
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${basePath}/arama${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      type: 'website',
    },
  };
}

export default async function AramaPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const query = resolvedSearchParams.q || '';
  const type = resolvedSearchParams.type || '';
  const propertyType = resolvedSearchParams.propertyType || '';
  const neighborhood = resolvedSearchParams.neighborhood || '';
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  // Fetch all listings with search filters (with timeout)
  const listingsResult = await withTimeout(
    getListings(
      {
        query,
        status: type as 'satilik' | 'kiralik' | undefined,
        property_type: propertyType ? [propertyType] : undefined,
        location_neighborhood: neighborhood ? [neighborhood] : undefined,
      },
      { field: 'created_at', order: 'desc' },
      50, // Get more results for search
      (page - 1) * 50
    ),
    3000,
    { listings: [], total: 0 }
  );

  const { listings = [], total = 0 } = listingsResult || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Arama' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {query ? `"${query}" için Arama Sonuçları` : 'Arama'}
            </h1>
            {query && (
              <p className="text-muted-foreground mt-2">
                {total} sonuç bulundu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trust Signals Bar */}
      <div className="mb-8">
        <TrustSignalsBar variant="full" />
      </div>

      {/* Search Client Component */}
      <Suspense fallback={<div className="text-center py-12">Yükleniyor...</div>}>
        <AramaClient
          initialListings={listings}
          total={total}
          initialQuery={query}
          initialType={type}
          initialProperty={propertyType}
          initialMahalle={neighborhood}
          basePath={basePath}
        />
      </Suspense>
    </div>
  );
}

