import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteConfig } from '@karasu-emlak/config';
import Link from 'next/link';

import { routing } from '@/i18n/routing';
import { getListings } from '@/lib/supabase/queries/listings';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageIntro, FAQBlock } from '@/components/content';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { Search, ArrowRight, Home, MapPin } from 'lucide-react';
import { AramaClient } from './AramaClient';
import { TrustSignalsBar } from '@/components/trust/TrustSignalsBar';
import { withTimeout } from '@/lib/utils/timeout';
import { getQAEntries } from '@/lib/supabase/queries/qa';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
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
      languages: pruneHreflangLanguages({
        'tr': '/arama',
        'en': '/en/arama',
        'et': '/et/arama',
        'ru': '/ru/arama',
        'ar': '/ar/arama',
      }),
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

  // FAQ for search page
  const qaEntries = await withTimeout(getQAEntries('karasu', 'medium'), 2000, []);
  const faqs = (qaEntries || [])
    .filter(qa => /arama|filtre|ilan|bul/.test(qa.question.toLowerCase()))
    .slice(0, 4)
    .map(qa => ({ question: qa.question, answer: qa.answer }));
  const fallbackFaqs = [
    { question: 'Karasu emlak ilanlarında nasıl arama yapabilirim?', answer: 'Arama kutusuna anahtar kelime (mahalle, oda sayısı, fiyat vb.) yazarak veya filtreleri kullanarak satılık ve kiralık ilanları daraltabilirsiniz. İlan tipi, emlak türü ve mahalle seçenekleri ile daha hassas sonuçlar elde edebilirsiniz.' },
    { question: 'Arama sonuçlarını nasıl filtreleyebilirim?', answer: 'Satılık/kiralık, emlak türü (daire, villa, yazlık), mahalle ve fiyat aralığı filtrelerini kullanarak sonuçları daraltabilirsiniz. Filtreler sayfanın üst kısmında yer alır.' },
    { question: 'Beğendiğim ilanları nasıl kaydedebilirim?', answer: 'İlan kartındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz. Favorilerim sayfasından kaydettiğiniz ilanları görüntüleyip karşılaştırabilirsiniz.' },
    { question: 'Karasu\'da en çok hangi bölgelerde ilan var?', answer: 'Karasu merkez, sahile yakın mahalleler (Yalı, Liman, Cumhuriyet) ve Aziziye bölgesinde yoğun ilan bulunmaktadır. Karasu mahalleler sayfamızdan bölge detaylarına ulaşabilirsiniz.' },
  ];
  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;
  const faqSchema = displayFaqs.length > 0 ? generateFAQSchema(displayFaqs) : null;

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: basePath || '/' },
            { label: 'Arama' },
          ]}
          className="mb-6"
        />

        <PageIntro
          title={query ? `"${query}" için Arama Sonuçları` : 'Arama'}
          description={query ? `${total} sonuç bulundu. Karasu'da satılık ve kiralık emlak ilanlarında arama yapın.` : 'Karasu emlak ilanlarında arama yapın. Satılık ve kiralık gayrimenkul seçeneklerini filtreleyerek bulun.'}
          className="mb-8"
        />

        <div className="mb-8">
          <TrustSignalsBar variant="full" />
        </div>

        <Suspense fallback={<div className="text-center py-12 animate-pulse">Yükleniyor...</div>}>
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

        {displayFaqs.length > 0 && (
          <FAQBlock
            faqs={displayFaqs}
            title="Arama Hakkında Sık Sorulan Sorular"
            className="mt-16"
          />
        )}

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
            <Link href={`${basePath}/karasu`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
              <MapPin className="h-6 w-6 text-primary shrink-0" />
              <div>
                <span className="font-semibold">Karasu Rehberi</span>
                <p className="text-sm text-muted-foreground">Bölge ve mahalle bilgileri</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Link>
            <Link href={`${basePath}/karasu-mahalleler`} className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors">
              <MapPin className="h-6 w-6 text-primary shrink-0" />
              <div>
                <span className="font-semibold">Mahalleler</span>
                <p className="text-sm text-muted-foreground">Karasu mahalle profilleri</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

