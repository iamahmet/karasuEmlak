"use client";

import Link from "next/link";
import { MapPin, Square, Home, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { ListingImage } from "@/components/images";
import type { Listing } from "@/lib/supabase/queries/listings";
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';
import { formatLocation } from '@/lib/utils/format-neighborhood';

interface RecentListingsSectionProps {
  recentListings: Listing[];
  basePath?: string;
}

export function RecentListingsSection({ 
  recentListings = [],
  basePath = "" 
}: RecentListingsSectionProps) {
  const ListingCard = ({ listing }: { listing: Listing }) => {
    const mainImage = listing.images?.[0];
    const fallbackImageUrl = getPropertyPlaceholder(
      listing.property_type,
      listing.status,
      listing.location_neighborhood,
      800,
      600
    );
    const features = listing.features || {};
    
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
        rooms: features.rooms,
        sizeM2: features.sizeM2,
        seaView: features.seaView,
        furnished: features.furnished,
      },
      price: listing.price_amount,
    }, listing.title);

    return (
      <Link 
        href={`${basePath}/ilan/${listing.slug}`}
        className="group block"
      >
        <article className="relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative h-64 md:h-72 bg-gray-100 overflow-hidden">
            {mainImage?.public_id || mainImage?.url ? (
              mainImage.url ? (
                <img
                  src={mainImage.url}
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              ) : (
                <ListingImage
                  publicId={mainImage.public_id!}
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fallback={fallbackImageUrl}
                />
              )
            ) : (
              <img
                src={fallbackImageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className={`px-4 py-2 rounded-lg text-sm md:text-base font-bold text-white shadow-lg ${
                listing.status === 'satilik' 
                  ? 'bg-[#006AFF]' 
                  : 'bg-[#00A862]'
              }`}>
                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
              </div>
            </div>
            
            {/* Image Count */}
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-white/95 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
                {listing.images.length} Fotoğraf
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl md:text-2xl font-semibold mb-3 line-clamp-2 text-gray-900 leading-snug tracking-tight group-hover:text-[#006AFF] transition-colors">
              {listing.title}
            </h3>
            
            <p className="text-base md:text-lg text-gray-600 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400 stroke-[1.5]" />
              <span>{formatLocation(listing.location_neighborhood, listing.location_district)}</span>
            </p>
            
            {(features.sizeM2 || features.rooms || features.bathrooms) && (
              <div className="flex items-center gap-5 text-sm md:text-base text-gray-600 mb-5 pb-4 border-b border-gray-100">
                {features.sizeM2 && (
                  <span className="flex items-center gap-2 font-medium">
                    <Square className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                    {features.sizeM2} m²
                  </span>
                )}
                {features.rooms && (
                  <span className="flex items-center gap-2 font-medium">
                    <Home className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                    {features.rooms} Oda
                  </span>
                )}
                {features.bathrooms && (
                  <span className="font-medium">{features.bathrooms} Banyo</span>
                )}
              </div>
            )}
            
            {listing.price_amount && (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-bold text-[#006AFF] tracking-tight">
                  ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                </span>
                {listing.status === 'kiralik' && (
                  <span className="text-base md:text-lg text-gray-500 font-medium">/ay</span>
                )}
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  };

  if (recentListings.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full mb-4">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Yeni</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold mb-3 text-gray-900 leading-tight">
              Son Eklenen İlanlar
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl leading-relaxed">
              Karasu'da en yeni eklenen gayrimenkul ilanları. Güncel fırsatları kaçırmayın.
            </p>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
            {recentListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 text-[15px] font-semibold tracking-[-0.011em] rounded-lg transition-all duration-200"
              asChild
            >
              <Link href={`${basePath}/satilik`}>
                Tüm İlanları Görüntüle
                <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
