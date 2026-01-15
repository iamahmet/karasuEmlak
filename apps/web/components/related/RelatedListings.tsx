'use client';

import { Listing } from '@/lib/supabase/queries';
import { ListingImage } from '@/components/images';
import Link from 'next/link';
import { MapPin, Bed, Square } from 'lucide-react';

interface RelatedListingsProps {
  listings: Listing[];
  currentListingId?: string;
  title?: string;
  limit?: number;
  basePath?: string;
}

export default function RelatedListings({
  listings,
  currentListingId,
  title = 'Benzer İlanlar',
  limit = 4,
  basePath = '',
}: RelatedListingsProps) {
  // Filter out current listing and limit results
  const filteredListings = listings
    .filter(listing => listing.id !== currentListingId)
    .slice(0, limit);

  if (filteredListings.length === 0) {
    return null;
  }

  return (
    <section className="py-8 container mx-auto px-4">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600">Size uygun diğer seçenekler</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredListings.map((listing) => {
          const mainImage = listing.images?.[0];
          return (
            <Link
              key={listing.id}
              href={`${basePath}/ilan/${listing.slug}`}
              className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#006AFF] hover:shadow-lg transition-all duration-200"
            >
              <div className="relative h-40 bg-muted">
                {mainImage ? (
                  <ListingImage
                    publicId={mainImage.public_id || mainImage.url}
                    alt={mainImage.alt || listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Görsel yok</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    listing.status === 'satilik'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}>
                    {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#006AFF] transition-colors text-sm">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">
                    {listing.location_neighborhood}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {listing.features.sizeM2 && (
                    <span className="flex items-center gap-1">
                      <Square className="w-3.5 h-3.5" />
                      {listing.features.sizeM2} m²
                    </span>
                  )}
                  {listing.features.rooms && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      {listing.features.rooms} Oda
                    </span>
                  )}
                </div>
                {listing.price_amount && (
                  <p className="text-lg font-extrabold text-[#006AFF]">
                    ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                    {listing.status === 'kiralik' && <span className="text-sm text-gray-500 font-normal">/ay</span>}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

