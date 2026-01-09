"use client";

import { useState, useMemo } from 'react';
import { Listing } from '@/lib/supabase/queries';
import { ListingImage } from '@/components/images';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Building2,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@karasu/lib';

interface PremiumRelatedListingsProps {
  listings: Listing[];
  currentListing: Listing;
  basePath?: string;
  className?: string;
}

type SortOption = 'similar' | 'price-low' | 'price-high' | 'size-large' | 'size-small' | 'newest';
type FilterOption = 'all' | 'same-neighborhood' | 'same-price-range' | 'same-features';

export default function PremiumRelatedListings({
  listings,
  currentListing,
  basePath = '',
  className,
}: PremiumRelatedListingsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('similar');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showAll, setShowAll] = useState(false);

  // Filter listings
  const filteredListings = useMemo(() => {
    let filtered = listings.filter(listing => listing.id !== currentListing.id);

    // Apply filters
    if (filterBy === 'same-neighborhood') {
      filtered = filtered.filter(listing => 
        listing.location_neighborhood === currentListing.location_neighborhood
      );
    } else if (filterBy === 'same-price-range') {
      const priceRange = currentListing.price_amount ? currentListing.price_amount * 0.2 : 0;
      filtered = filtered.filter(listing => 
        listing.price_amount && 
        Math.abs(listing.price_amount - (currentListing.price_amount || 0)) <= priceRange
      );
    } else if (filterBy === 'same-features') {
      filtered = filtered.filter(listing => 
        listing.features.rooms === currentListing.features.rooms ||
        listing.features.bathrooms === currentListing.features.bathrooms ||
        listing.property_type === currentListing.property_type
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price_amount || 0) - (b.price_amount || 0);
        case 'price-high':
          return (b.price_amount || 0) - (a.price_amount || 0);
        case 'size-large':
          return (b.features.sizeM2 || 0) - (a.features.sizeM2 || 0);
        case 'size-small':
          return (a.features.sizeM2 || 0) - (b.features.sizeM2 || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'similar':
        default:
          // Similarity score: neighborhood (3), price (2), features (1)
          let scoreA = 0;
          let scoreB = 0;
          
          if (a.location_neighborhood === currentListing.location_neighborhood) scoreA += 3;
          if (b.location_neighborhood === currentListing.location_neighborhood) scoreB += 3;
          
          if (a.price_amount && currentListing.price_amount) {
            const diffA = Math.abs(a.price_amount - currentListing.price_amount) / currentListing.price_amount;
            const diffB = b.price_amount && currentListing.price_amount ? Math.abs(b.price_amount - currentListing.price_amount) / currentListing.price_amount : Infinity;
            if (diffA < 0.2) scoreA += 2;
            if (diffB < 0.2) scoreB += 2;
          }
          
          if (a.features.rooms === currentListing.features.rooms) scoreA += 1;
          if (b.features.rooms === currentListing.features.rooms) scoreB += 1;
          
          return scoreB - scoreA;
      }
    });

    return filtered;
  }, [listings, currentListing, sortBy, filterBy]);

  const displayedListings = showAll ? filteredListings : filteredListings.slice(0, 6);
  const hasMore = filteredListings.length > 6;

  // Calculate statistics
  const avgPrice = filteredListings.length > 0
    ? filteredListings.reduce((sum, l) => sum + (l.price_amount || 0), 0) / filteredListings.length
    : 0;
  
  const priceComparison = currentListing.price_amount && avgPrice
    ? ((currentListing.price_amount - avgPrice) / avgPrice * 100)
    : 0;

  if (filteredListings.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white", className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 mb-2">
                Benzer İlanlar
              </h2>
              <p className="text-base text-gray-600">
                {filteredListings.length} ilan bulundu • Size uygun seçenekler
              </p>
            </div>

            {/* Statistics */}
            {avgPrice > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="text-xs text-gray-600 font-semibold mb-1">Ortalama Fiyat</div>
                  <div className="text-lg font-bold text-gray-900">
                    ₺{new Intl.NumberFormat('tr-TR').format(Math.round(avgPrice))}
                  </div>
                </div>
                {priceComparison !== 0 && (
                  <div className="h-12 w-px bg-gray-200" />
                )}
                {priceComparison !== 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Fiyat Farkı</div>
                    <div className={cn(
                      "text-lg font-bold flex items-center gap-1",
                      priceComparison > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {priceComparison > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(priceComparison).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filtrele:</span>
            </div>
            {(['all', 'same-neighborhood', 'same-price-range', 'same-features'] as FilterOption[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  filterBy === filter
                    ? "bg-[#006AFF] text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#006AFF]"
                )}
              >
                {filter === 'all' && 'Tümü'}
                {filter === 'same-neighborhood' && 'Aynı Mahalle'}
                {filter === 'same-price-range' && 'Benzer Fiyat'}
                {filter === 'same-features' && 'Benzer Özellikler'}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sıralama seçeneği"
                title="İlanları sırala"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-200 hover:border-[#006AFF] transition-colors cursor-pointer outline-none"
              >
                <option value="similar">En Benzer</option>
                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                <option value="size-large">Alan: Büyükten Küçüğe</option>
                <option value="size-small">Alan: Küçükten Büyüğe</option>
                <option value="newest">En Yeni</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid - Expanded to Fill Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          {displayedListings.map((listing) => {
            const mainImage = listing.images?.[0];
            const priceDiff = currentListing.price_amount && listing.price_amount
              ? ((listing.price_amount - currentListing.price_amount) / currentListing.price_amount * 100)
              : null;

            return (
              <Link
                key={listing.id}
                href={`${basePath}/ilan/${listing.slug}`}
                className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#006AFF] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {mainImage ? (
                    <>
                      {mainImage.public_id ? (
                        <ListingImage
                          publicId={mainImage.public_id}
                          alt={mainImage.alt || listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : mainImage.url ? (
                        <img
                          src={mainImage.url}
                          alt={mainImage.alt || listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : null}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Görsel yok</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <span className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm",
                        listing.status === 'satilik'
                          ? 'bg-[#006AFF] text-white'
                          : 'bg-[#00A862] text-white'
                      )}>
                        {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                      </span>
                      {listing.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 w-fit">
                          <Star className="h-3 w-3 fill-current" />
                          Öne Çıkan
                        </span>
                      )}
                    </div>

                    {/* Price Comparison */}
                    {priceDiff !== null && Math.abs(priceDiff) > 5 && (
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1",
                        priceDiff > 0 ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white"
                      )}>
                        {priceDiff > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(priceDiff).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {/* Image Counter */}
                  {listing.images && listing.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                      {listing.images.length} görsel
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#006AFF] transition-colors text-base leading-tight">
                    {listing.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {listing.location_neighborhood}, {listing.location_district}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                    {listing.features.sizeM2 && (
                      <span className="flex items-center gap-1.5">
                        <Square className="w-3.5 h-3.5" />
                        <span className="font-semibold">{listing.features.sizeM2} m²</span>
                      </span>
                    )}
                    {listing.features.rooms && (
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5" />
                        <span className="font-semibold">{listing.features.rooms}+1</span>
                      </span>
                    )}
                    {listing.features.bathrooms && (
                      <span className="flex items-center gap-1.5">
                        <Bath className="w-3.5 h-3.5" />
                        <span className="font-semibold">{listing.features.bathrooms}</span>
                      </span>
                    )}
                    {listing.features.floor && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="font-semibold">{listing.features.floor}. Kat</span>
                      </span>
                    )}
                  </div>

                  {/* Additional Features */}
                  {(listing.features.parking || listing.features.elevator || listing.features.seaView) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {listing.features.parking && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                          Otopark
                        </span>
                      )}
                      {listing.features.elevator && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                          Asansör
                        </span>
                      )}
                      {listing.features.seaView && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                          Deniz Manzarası
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {listing.price_amount && (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-extrabold text-[#006AFF] mb-0.5">
                          ₺{new Intl.NumberFormat('tr-TR').format(listing.price_amount)}
                          {listing.status === 'kiralik' && (
                            <span className="text-sm text-gray-500 font-normal">/ay</span>
                          )}
                        </div>
                        {listing.features.sizeM2 && listing.price_amount && (
                          <div className="text-xs text-gray-500">
                            ₺{new Intl.NumberFormat('tr-TR').format(Math.round(listing.price_amount / listing.features.sizeM2))}/m²
                          </div>
                        )}
                      </div>
                      {listing.featured && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Show More / View All */}
        {hasMore && (
          <div className="text-center">
            {!showAll ? (
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                size="lg"
                className="border-2 border-[#006AFF] text-[#006AFF] hover:bg-[#006AFF] hover:text-white font-semibold"
              >
                {filteredListings.length - 6} İlan Daha Göster
              </Button>
            ) : (
              <Link href={`${basePath}/${currentListing.status}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#006AFF] text-[#006AFF] hover:bg-[#006AFF] hover:text-white font-semibold"
                >
                  Tüm {currentListing.status === 'satilik' ? 'Satılık' : 'Kiralık'} İlanları Gör
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* SEO: Related Listings Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Benzer İlanlar",
              "description": `${currentListing.title} ile benzer ${filteredListings.length} ilan`,
              "numberOfItems": filteredListings.length,
              "itemListElement": displayedListings.map((listing, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "RealEstateListing",
                  "name": listing.title,
                  "url": `${basePath}/ilan/${listing.slug}`,
                  "image": listing.images?.[0]?.url || listing.images?.[0]?.public_id,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": listing.location_neighborhood,
                    "addressRegion": listing.location_district,
                    "addressCountry": "TR",
                  },
                  "offers": {
                    "@type": "Offer",
                    "price": listing.price_amount,
                    "priceCurrency": "TRY",
                  },
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}

