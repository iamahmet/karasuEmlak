"use client";

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { MapPin, Square, Home } from 'lucide-react';
import { CardImage } from '@/components/images';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import type { Listing } from '@/lib/supabase/queries';
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';
import { trackInternalLink } from '@/lib/analytics/link-tracking';
import { formatNeighborhoodName, formatLocation } from '@/lib/utils/format-neighborhood';

interface ListingCardProps {
  listing: Listing;
  viewMode?: 'grid' | 'list';
  basePath: string;
  priority?: boolean; // For LCP optimization - prioritize first few images
}

function ListingCardComponent({ listing, viewMode = 'grid', basePath, priority = false }: ListingCardProps) {
  const mainImage = listing.images?.[0];
  
  // Generate SEO-friendly alt text
  const imageAlt = mainImage?.alt || generatePropertyImageAlt({
    propertyType: listing.property_type as any,
    status: listing.status,
    location: {
      neighborhood: listing.location_neighborhood,
      district: listing.location_district,
      city: 'Karasu',
    },
    features: {
      rooms: listing.features?.rooms,
      sizeM2: listing.features?.sizeM2,
      seaView: listing.features?.seaView,
      furnished: listing.features?.furnished,
    },
    price: listing.price_amount,
  }, listing.title);

  const listingUrl = `${basePath}/ilan/${listing.slug}`;
  const formattedLocation = formatLocation(listing.location_neighborhood, listing.location_district);
  const ariaLabel = `${listing.title} - ${formattedLocation}${listing.price_amount ? ` - ₺${new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}` : ''}`;

  const handleLinkClick = () => {
    trackInternalLink(listingUrl, listing.title, 'Listings', undefined);
  };

  if (viewMode === 'list') {
    return (
      <Link 
        href={listingUrl}
        aria-label={ariaLabel}
        onClick={handleLinkClick}
        prefetch={true}
      >
        <article className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row" role="article">
          <div className="w-full md:w-64 h-48 md:h-auto bg-muted relative flex-shrink-0 overflow-hidden">
            {mainImage?.public_id || mainImage?.url ? (
              mainImage.url ? (
                <img
                  src={mainImage.url}
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <CardImage
                  publicId={mainImage.public_id!}
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 256px"
                  priority={priority}
                  fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                />
              )
            ) : (
              <img
                src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                alt={imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
              <ComparisonButton listingId={listing.id} variant="card" />
              <div className="bg-primary text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-md">
                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
              </div>
            </div>
            {listing.featured && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-md z-10">
                ⭐ Öne Çıkan
              </div>
            )}
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-semibold mb-3 text-xl leading-snug text-gray-900 dark:text-gray-50 group-hover:text-primary transition-colors line-clamp-2">
              {listing.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <span>{formatLocation(listing.location_neighborhood, listing.location_district)}</span>
            </p>
            {listing.features && (listing.features as any).sizeM2 && (
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Square className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span>{(listing.features as any).sizeM2} m²</span>
                </span>
                {(listing.features as any).rooms && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Home className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{(listing.features as any).rooms} Oda</span>
                  </span>
                )}
                {(listing.features as any).bathrooms && (
                  <span className="font-medium">{(listing.features as any).bathrooms} Banyo</span>
                )}
              </div>
            )}
            {listing.description_short && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                {listing.description_short}
              </p>
            )}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              {listing.price_amount && (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-primary">
                    ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                  </p>
                  {listing.status === 'kiralik' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1">/ay</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <ComparisonButton listingId={listing.id} variant="card" />
                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Detay
                </Button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid view
  return (
    <Link 
      href={listingUrl}
      aria-label={ariaLabel}
      onClick={handleLinkClick}
      prefetch={true}
    >
      <article className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-900" role="article">
        <div className="h-48 bg-muted relative">
          {mainImage ? (
            <CardImage
              publicId={mainImage.public_id || mainImage.url}
              alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Görsel yok</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
            <ComparisonButton listingId={listing.id} variant="card" />
            <div className="bg-primary text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-md">
              {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
            </div>
          </div>
          {listing.featured && (
            <div 
              className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-md z-10"
              aria-label="Öne çıkan ilan"
            >
              ⭐ Öne Çıkan
            </div>
          )}
          {listing.images && listing.images.length > 1 && (
            <div 
              className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              aria-label={`${listing.images.length} fotoğraf`}
            >
              {listing.images.length} Fotoğraf
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold mb-3 text-lg leading-snug text-gray-900 dark:text-gray-50 group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span>{formatLocation(listing.location_neighborhood, listing.location_district)}</span>
          </p>
          {listing.features && (listing.features as any).sizeM2 && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Square className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{(listing.features as any).sizeM2} m²</span>
              </span>
              {(listing.features as any).rooms && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Home className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span>{(listing.features as any).rooms} Oda</span>
                </span>
              )}
              {(listing.features as any).bathrooms && (
                <span className="font-medium">{(listing.features as any).bathrooms} Banyo</span>
              )}
            </div>
          )}
          {listing.price_amount && (
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-primary">
                ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
              </p>
              {listing.status === 'kiralik' && (
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">/ay</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// Memoize component to prevent unnecessary re-renders
export const ListingCard = memo(ListingCardComponent, (prevProps, nextProps) => {
  // Only re-render if listing data or props actually change
  return (
    prevProps.listing.id === nextProps.listing.id &&
    prevProps.listing.updated_at === nextProps.listing.updated_at &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.basePath === nextProps.basePath
  );
});

ListingCard.displayName = 'ListingCard';
