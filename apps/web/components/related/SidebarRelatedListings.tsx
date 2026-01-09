"use client";

import { Listing } from '@/lib/supabase/queries';
import { ListingImage } from '@/components/images';
import Link from 'next/link';
import { 
  MapPin, 
  Bed, 
  Square,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@karasu/lib';

interface SidebarRelatedListingsProps {
  listings: Listing[];
  currentListingId: string;
  basePath?: string;
  limit?: number;
  className?: string;
}

export function SidebarRelatedListings({
  listings,
  currentListingId,
  basePath = '',
  limit = 3,
  className,
}: SidebarRelatedListingsProps) {
  // Filter out current listing and limit results
  const filteredListings = listings
    .filter(listing => listing.id !== currentListingId)
    .slice(0, limit);

  if (filteredListings.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md", className)}>
      <div className="mb-5">
        <h3 className="text-lg md:text-xl font-display font-extrabold text-gray-900 mb-1">
          Benzer İlanlar
        </h3>
        <p className="text-xs text-gray-600">
          Size uygun diğer seçenekler
        </p>
      </div>

      <div className="space-y-4">
        {filteredListings.map((listing) => {
          const mainImage = listing.images?.[0];
          return (
            <Link
              key={listing.id}
              href={`${basePath}/ilan/${listing.slug}`}
              className="group flex gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#006AFF] hover:bg-blue-50/50 transition-all duration-200"
            >
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {mainImage ? (
                  <>
                    {mainImage.public_id ? (
                      <ListingImage
                        publicId={mainImage.public_id}
                        alt={mainImage.alt || listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="96px"
                      />
                    ) : mainImage.url ? (
                      <img
                        src={mainImage.url}
                        alt={mainImage.alt || listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : null}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-1 right-1">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm",
                    listing.status === 'satilik'
                      ? 'bg-[#006AFF] text-white'
                      : 'bg-[#00A862] text-white'
                  )}>
                    {listing.status === 'satilik' ? 'Sat' : 'Kir'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#006AFF] transition-colors text-sm leading-tight">
                  {listing.title}
                </h4>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.location_neighborhood}</span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  {listing.features.sizeM2 && (
                    <span className="flex items-center gap-0.5">
                      <Square className="w-3 h-3" />
                      {listing.features.sizeM2} m²
                    </span>
                  )}
                  {listing.features.rooms && (
                    <span className="flex items-center gap-0.5">
                      <Bed className="w-3 h-3" />
                      {listing.features.rooms} Oda
                    </span>
                  )}
                </div>

                {/* Price */}
                {listing.price_amount && (
                  <div className="text-base font-extrabold text-[#006AFF]">
                    ₺{new Intl.NumberFormat('tr-TR').format(listing.price_amount)}
                    {listing.status === 'kiralik' && (
                      <span className="text-xs text-gray-500 font-normal">/ay</span>
                    )}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#006AFF] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <Link
          href={`${basePath}/${filteredListings[0]?.status || 'satilik'}`}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-[#006AFF] hover:text-[#0052CC] transition-colors"
        >
          Tümünü Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default SidebarRelatedListings;

