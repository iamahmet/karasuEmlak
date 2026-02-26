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
        className="group block h-full"
      >
        <article className="relative bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-[0_32px_80px_rgba(0,106,255,0.08)] transition-all duration-500 h-full flex flex-col">
          {/* Image Container with richer overlays */}
          <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
            {mainImage?.public_id || mainImage?.url ? (
              mainImage.url ? (
                <img
                  src={mainImage.url}
                  alt={imageAlt}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <ListingImage
                  publicId={mainImage.public_id!}
                  alt={imageAlt}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fallback={fallbackImageUrl}
                />
              )
            ) : (
              <img
                src={fallbackImageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="lazy"
              />
            )}

            {/* Premium Badges */}
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
              <div className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold text-white uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg ${listing.status === 'satilik'
                ? 'bg-blue-600/80'
                : 'bg-emerald-600/80'
                }`}>
                {listing.status === 'satilik' ? 'SATILIK' : 'KİRALIK'}
              </div>
            </div>

            {/* Photo Counter Bubble */}
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-5 right-5 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest border border-white/10">
                {listing.images.length} GÖRSEL
              </div>
            )}
          </div>

          {/* Premium Content Body */}
          <div className="p-8 flex flex-col flex-1">
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                {listing.title}
              </h3>

              <div className="flex items-center gap-2 text-gray-400 font-medium text-[13px]">
                <MapPin className="h-4 w-4 text-blue-500/60" />
                <span>{formatLocation(listing.location_neighborhood, listing.location_district)}</span>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-gray-50 text-gray-700">
                {features.sizeM2 && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Alan</span>
                    <span className="text-[15px] font-bold">{features.sizeM2} m²</span>
                  </div>
                )}
                {features.rooms && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Oda</span>
                    <span className="text-[15px] font-bold">{features.rooms}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              {listing.price_amount && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Fiyat</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                      ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                    </span>
                    {listing.status === 'kiralik' && (
                      <span className="text-xs font-medium text-gray-400 lowercase">/ay</span>
                    )}
                  </div>
                </div>
              )}

              <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  if (recentListings.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100/50 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest">YENİ FIRSATLAR</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-[-0.03em] leading-tight">
                Son Eklenen İlanlar
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                Karasu'da piyasaya yeni çıkan, güncel ve kaçırılmaması gereken en taze portföylerimiz.
              </p>
            </div>
            <Link
              href={`${basePath}/satilik`}
              className="inline-flex items-center gap-2 group text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              TÜMÜNÜ GÖRÜNTÜLE
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>

          {/* Listings Grid - Premium 3-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {recentListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
