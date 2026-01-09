"use client";

import Link from "next/link";
import { MapPin, Square, Home, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { ListingImage } from "@/components/images";
import type { Listing } from "@/lib/supabase/queries/listings";
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';

interface SeparateFeaturedListingsProps {
  satilikListings: Listing[];
  kiralikListings: Listing[];
  basePath?: string;
}

export function SeparateFeaturedListings({ 
  satilikListings, 
  kiralikListings, 
  basePath = "" 
}: SeparateFeaturedListingsProps) {
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
        <article className="relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
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
            <div className="absolute top-3 left-3 z-10">
              <div className={`px-3 py-1.5 rounded-lg text-[13px] font-bold text-white shadow-lg ${
                listing.status === 'satilik' 
                  ? 'bg-[#006AFF]' 
                  : 'bg-[#00A862]'
              }`}>
                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
              </div>
            </div>
            
            {/* Image Count */}
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-white/95 text-gray-700 px-2.5 py-1 rounded-lg text-[12px] font-semibold shadow-md">
                {listing.images.length} Fotoğraf
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 leading-[1.47] tracking-[-0.022em] group-hover:text-[#006AFF] transition-colors">
              {listing.title}
            </h3>
            
            <p className="text-[15px] text-gray-600 mb-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 stroke-[1.5]" />
              <span>{listing.location_neighborhood}, {listing.location_district}</span>
            </p>
            
            {(features.sizeM2 || features.rooms || features.bathrooms) && (
              <div className="flex items-center gap-4 text-[13px] text-gray-600 mb-4 pb-3 border-b border-gray-100">
                {features.sizeM2 && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Square className="h-3.5 w-3.5 text-gray-400 stroke-[1.5]" />
                    {features.sizeM2} m²
                  </span>
                )}
                {features.rooms && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Home className="h-3.5 w-3.5 text-gray-400 stroke-[1.5]" />
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
                <span className="text-2xl font-bold text-[#006AFF] tracking-tight">
                  ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                </span>
                {listing.status === 'kiralik' && (
                  <span className="text-[15px] text-gray-500 font-medium">/ay</span>
                )}
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      {/* Öne Çıkan Satılık İlanlar */}
      {satilikListings.length > 0 && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#006AFF] uppercase tracking-wider">Popüler</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold mb-3 text-gray-900 leading-tight">
                  Öne Çıkan Satılık İlanlar
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl leading-relaxed">
                  Karasu'da en popüler satılık gayrimenkul seçenekleri. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları.
                </p>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-10">
                {satilikListings.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-6 py-3 text-[15px] font-semibold tracking-[-0.011em] shadow-sm hover:shadow-md rounded-lg transition-all duration-200"
                  asChild
                >
                  <Link href={`${basePath}/satilik`}>
                    Tüm Satılık İlanlar
                    <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Öne Çıkan Kiralık İlanlar */}
      {kiralikListings.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full mb-4">
                  <span className="text-xs font-bold text-[#00A862] uppercase tracking-wider">Popüler</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold mb-3 text-gray-900 leading-tight">
                  Öne Çıkan Kiralık İlanlar
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl leading-relaxed">
                  Karasu'da en popüler kiralık gayrimenkul seçenekleri. Hemen taşınmaya hazır, modern ve konforlu yaşam alanları.
                </p>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-10">
                {kiralikListings.slice(0, 3).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white px-6 py-3 text-[15px] font-semibold tracking-[-0.011em] rounded-lg transition-all duration-200"
                  asChild
                >
                  <Link href={`${basePath}/kiralik`}>
                    Tüm Kiralık İlanlar
                    <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
