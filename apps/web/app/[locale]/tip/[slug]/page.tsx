import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { getPropertyTypes, getListings } from '@/lib/supabase/queries';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ListingsClient } from '@/app/[locale]/satilik/ListingsClient';
import { Home, Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@karasu/ui';

const propertyTypeLabels: Record<string, string> = {
  daire: 'Daire',
  villa: 'Villa',
  ev: 'Ev',
  yazlik: 'Yazlık',
  arsa: 'Arsa',
  isyeri: 'İşyeri',
  dukkan: 'Dükkan',
};

const propertyTypeDescriptions: Record<string, string> = {
  daire: 'Daire ilanları',
  villa: 'Villa ilanları',
  ev: 'Ev ilanları',
  yazlik: 'Yazlık ilanları',
  arsa: 'Arsa ilanları',
  isyeri: 'İşyeri ilanları',
  dukkan: 'Dükkan ilanları',
};

export async function generateStaticParams() {
  const propertyTypes = await getPropertyTypes();
  return propertyTypes.map((type) => ({
    slug: type.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const propertyTypes = await getPropertyTypes();
  const propertyType = propertyTypes.find((t) => t.toLowerCase() === slug);

  if (!propertyType) {
    return {
      title: 'Emlak Tipi Bulunamadı',
    };
  }

  const typeLabel = propertyTypeLabels[propertyType] || propertyType;
  const canonicalPath =
    locale === routing.defaultLocale ? `/tip/${slug}` : `/${locale}/tip/${slug}`;

  return {
    title: `${typeLabel} İlanları | Karasu Emlak`,
    description: `Karasu'da satılık ve kiralık ${typeLabel.toLowerCase()} ilanları. ${propertyTypeDescriptions[propertyType] || `${typeLabel} ilanları`} için en güncel fırsatları keşfedin.`,
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': `/tip/${slug}`,
        'en': `/en/tip/${slug}`,
        'et': `/et/tip/${slug}`,
        'ru': `/ru/tip/${slug}`,
        'ar': `/ar/tip/${slug}`,
      },
    },
    openGraph: {
      title: `${typeLabel} İlanları | Karasu Emlak`,
      description: `Karasu'da satılık ve kiralık ${typeLabel.toLowerCase()} ilanları`,
      url: `${siteConfig.url}${canonicalPath}`,
    },
  };
}

export default async function PropertyTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    neighborhood?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const { locale, slug } = await params;
  const paramsObj = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const propertyTypes = await getPropertyTypes();
  const propertyType = propertyTypes.find((t) => t.toLowerCase() === slug);

  if (!propertyType) {
    notFound();
  }

  const typeLabel = propertyTypeLabels[propertyType] || propertyType;

  const { page = '1', q, minPrice, maxPrice, minSize, maxSize, rooms, neighborhood, status, sort } = paramsObj;
  const currentPage = parseInt(page, 10) || 1;
  const limit = 18;
  const offset = (currentPage - 1) * limit;

  // Build filters
  const filters: any = {
    property_type: [propertyType],
  };

  if (status) {
    filters.status = status;
  }

  if (q) filters.query = q;
  if (minPrice) filters.min_price = Number(minPrice);
  if (maxPrice) filters.max_price = Number(maxPrice);
  if (minSize) filters.min_size = Number(minSize);
  if (maxSize) filters.max_size = Number(maxSize);
  if (rooms) filters.rooms = rooms.split(',').map(Number);
  if (neighborhood) filters.location_neighborhood = neighborhood.split(',');

  const sortParam = sort || 'created_at-desc';
  const [sortField, sortOrder] = sortParam.split('-');
  const sortConfig = {
    field: sortField as 'price_amount' | 'created_at' | 'updated_at',
    order: sortOrder as 'asc' | 'desc',
  };

  const { listings, total } = await getListings(filters, sortConfig, limit, offset);

  // Get stats for this property type
  const { listings: allTypeListings } = await getListings({
    property_type: [propertyType],
  });
  const satilikCount = allTypeListings.filter((l) => l.status === 'satilik').length;
  const kiralikCount = allTypeListings.filter((l) => l.status === 'kiralik').length;
  const neighborhoods = Array.from(new Set(allTypeListings.map((l) => l.location_neighborhood)));

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Emlak Tipleri', href: `${basePath}/satilik` },
          { label: typeLabel },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-4xl font-bold">{typeLabel} İlanları</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Karasu'da {total} adet {typeLabel.toLowerCase()} ilanı bulunmaktadır.
        </p>

        {/* Property Type Description */}
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">{typeLabel} Hakkında</h2>
          
          {/* Main Description */}
          <div className="space-y-4 mb-6">
            {typeLabel === 'Daire' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da daire seçenekleri geniş bir yelpazede sunulmaktadır. Denize yakın konumlar, modern yaşam alanları ve uygun fiyatlı seçeneklerle her bütçeye uygun daire bulabilirsiniz.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Daire Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Oda sayısı ve büyüklük ihtiyaçlarınıza uygun olmalı</li>
                    <li>Bina yaşı ve yapı kalitesi kontrol edilmeli</li>
                    <li>Asansör, otopark ve balkon gibi özellikler değerlendirilmeli</li>
                    <li>Denize mesafe ve manzara durumu göz önünde bulundurulmalı</li>
                    <li>Ulaşım imkanları ve çevresel faktörler incelenmeli</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'Villa' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da villa seçenekleri lüks yaşam arayanlar için ideal. Geniş bahçeler, özel havuzlar ve deniz manzaralı konumlar ile hayalinizdeki villayı bulabilirsiniz.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Villa Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Bahçe büyüklüğü ve kullanım potansiyeli</li>
                    <li>Özel havuz ve dış mekan tesisleri</li>
                    <li>Deniz manzarası ve konum avantajları</li>
                    <li>Güvenlik ve özel alan özellikleri</li>
                    <li>Bakım ve işletme maliyetleri</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'Ev' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da ev seçenekleri aileler için mükemmel. Bahçeli evler, geniş yaşam alanları ve sakin mahallelerde huzurlu bir yaşam sürebilirsiniz.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Ev Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Aile büyüklüğüne uygun oda ve yaşam alanları</li>
                    <li>Bahçe ve dış mekan kullanım imkanları</li>
                    <li>Mahalle güvenliği ve çevresel faktörler</li>
                    <li>Okul ve sağlık tesislerine yakınlık</li>
                    <li>Ulaşım ve altyapı durumu</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'Yazlık' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da yazlık ev seçenekleri yatırımcılar ve tatilciler için popüler. Denize yakın konumlar, yazlık kiralama potansiyeli ve yatırım değeri yüksek seçenekler mevcuttur.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Yazlık Ev Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Denize mesafe ve plaj erişimi</li>
                    <li>Yazlık kiralama potansiyeli ve gelir beklentisi</li>
                    <li>Bakım kolaylığı ve kış aylarında güvenlik</li>
                    <li>Çevresel faktörler ve turizm potansiyeli</li>
                    <li>Yatırım değeri ve gelecek projeler</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'Arsa' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da arsa seçenekleri yatırımcılar için fırsat sunuyor. Gelişmekte olan bölgelerde uygun fiyatlı arsalar ve yatırım potansiyeli yüksek seçenekler bulunmaktadır.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Arsa Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>İmar durumu ve yapılaşma izinleri</li>
                    <li>Altyapı durumu (su, elektrik, kanalizasyon)</li>
                    <li>Bölge planlaması ve gelecek projeler</li>
                    <li>Ulaşım imkanları ve merkeze mesafe</li>
                    <li>Yatırım potansiyeli ve değer artış beklentisi</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'İşyeri' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da işyeri seçenekleri ticaret yapmak isteyenler için ideal. Merkezi konumlar, yüksek trafikli caddeler ve ticari potansiyeli yüksek alanlar mevcuttur.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">İşyeri Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Konum ve müşteri trafiği potansiyeli</li>
                    <li>Kira bedeli ve işletme maliyetleri</li>
                    <li>Yasal izinler ve ticari kullanım şartları</li>
                    <li>Park yeri ve erişim kolaylığı</li>
                    <li>Rekabet analizi ve pazar potansiyeli</li>
                  </ul>
                </div>
              </>
            )}
            {typeLabel === 'Dükkan' && (
              <>
                <p className="text-muted-foreground">
                  Karasu'da dükkan seçenekleri küçük işletmeler için uygun. Cazip kira fiyatları, merkezi konumlar ve ticari potansiyeli yüksek alanlar bulunmaktadır.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Dükkan Seçerken Dikkat Edilmesi Gerekenler</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Müşteri trafiği ve görünürlük</li>
                    <li>Kira bedeli ve ek maliyetler</li>
                    <li>Vitrin ve iç mekan kullanım imkanları</li>
                    <li>Yasal izinler ve ticari kullanım şartları</li>
                    <li>Rekabet analizi ve pazar potansiyeli</li>
                  </ul>
                </div>
              </>
            )}
            {!['Daire', 'Villa', 'Ev', 'Yazlık', 'Arsa', 'İşyeri', 'Dükkan'].includes(typeLabel) && (
              <p className="text-muted-foreground">
                {typeLabel} ilanları için geniş bir seçenek yelpazesi sunulmaktadır. Karasu Emlak ile {typeLabel.toLowerCase()} ilanlarını keşfedin.
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t">
            <div>
              <span className="font-semibold">Ortalama Fiyat:</span>{' '}
              {satilikCount > 0 && kiralikCount > 0 ? 'Değişken' : 'İlanlara bakın'}
            </div>
            <div>
              <span className="font-semibold">Popülerlik:</span> Yüksek talep
            </div>
            <div>
              <span className="font-semibold">Yatırım Potansiyeli:</span> Pozitif
            </div>
            <div>
              <span className="font-semibold">Kiralama Potansiyeli:</span> Aktif
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{total}</div>
            <div className="text-sm text-muted-foreground">Toplam İlan</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{satilikCount}</div>
            <div className="text-sm text-muted-foreground">Satılık</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{kiralikCount}</div>
            <div className="text-sm text-muted-foreground">Kiralık</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{neighborhoods.length}</div>
            <div className="text-sm text-muted-foreground">Mahalle</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Link href={`${basePath}/tip/${slug}?status=satilik`}>
            <Button variant={status === 'satilik' ? 'default' : 'outline'}>
              <Home className="h-4 w-4 mr-2" />
              Satılık ({satilikCount})
            </Button>
          </Link>
          <Link href={`${basePath}/tip/${slug}?status=kiralik`}>
            <Button variant={status === 'kiralik' ? 'default' : 'outline'}>
              <Building2 className="h-4 w-4 mr-2" />
              Kiralık ({kiralikCount})
            </Button>
          </Link>
        </div>
      </header>

      {/* Listings */}
      <ListingsClient
        initialListings={listings}
        total={total}
        basePath={`${basePath}/tip/${slug}`}
        neighborhoods={neighborhoods}
        searchParams={paramsObj}
      />
    </div>
  );
}

