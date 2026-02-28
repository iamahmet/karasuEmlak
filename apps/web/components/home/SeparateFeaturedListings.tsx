"use client";

import Link from "next/link";
import { MapPin, Square, Home, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { ListingImage } from "@/components/images";
import type { Listing } from "@/lib/supabase/queries/listings";
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';

import { cn } from "@karasu/lib";

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
        <article className="relative bg-white rounded-[40px] overflow-hidden border border-gray-100 hover:shadow-[0_40px_100px_rgba(0,106,255,0.08)] transition-all duration-700 hover:-translate-y-2 flex flex-col h-full">
          {/* Image Container */}
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
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              <div className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-lg">
                ÖNE ÇIKAN
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest shadow-lg",
                listing.status === 'satilik' ? "bg-blue-600/80" : "bg-emerald-600/80"
              )}>
                {listing.status === 'satilik' ? 'SATILIK' : 'KİRALIK'}
              </div>
            </div>

            {/* Photo Count */}
            {listing.images && listing.images.length > 0 && (
              <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                {listing.images.length} FOTOĞRAF
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col flex-grow">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors mb-4 line-clamp-2">
              {listing.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{listing.location_neighborhood}, {listing.location_district}</span>
            </div>

            {/* Features Row */}
            <div className="flex items-center gap-6 mb-8 pt-8 border-t border-gray-50">
              {features.rooms && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Home className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-gray-900">{features.rooms}</span>
                </div>
              )}
              {features.sizeM2 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Square className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-gray-900">{features.sizeM2} m²</span>
                </div>
              )}
            </div>

            <div className="mt-auto flex items-end justify-between">
              {listing.price_amount && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">BAŞLAYAN FİYAT</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                    </span>
                    {listing.status === 'kiralik' && (
                      <span className="text-xs font-bold text-gray-400">/ay</span>
                    )}
                  </div>
                </div>
              )}
              <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      <div className="space-y-16 py-12 lg:py-16">
        {/* Öne Çıkan Satılık İlanlar */}
        {satilikListings.length > 0 && (
          <section className="bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100/50 rounded-full">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ÖNE ÇIKAN SATILIK</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                      Lüks ve <span className="text-blue-600">Yatırım</span> Fırsatları
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                      Karasu emlak piyasasının en seçkin portföyü ile hayalinizdeki yaşama bir adım daha yaklaşın.
                    </p>
                  </div>

                  <Link
                    href={`${basePath}/satilik`}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-sm font-bold text-gray-900"
                  >
                    TÜMÜNÜ GÖR
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {satilikListings.slice(0, 3).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Öne Çıkan Kiralık İlanlar */}
        {kiralikListings.length > 0 && (
          <section className="bg-gray-50/50 relative overflow-hidden py-16 -mx-6 lg:-mx-8 lg:px-8 px-6">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
              <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[140px]"></div>
            </div>

            <div className="container mx-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ÖNE ÇIKAN KİRALIK</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                      Konforlu <span className="text-emerald-600">Kiralık</span> Yaşam
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                      Modern dairelerden denize sıfır yazlıklara kadar Karasu'nun her köşesinde kiralık emlak seçenekleri.
                    </p>
                  </div>

                  <Link
                    href={`${basePath}/kiralik`}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-sm font-bold text-gray-900"
                  >
                    İLANLARI İNCELE
                    <ArrowRight className="h-4 w-4 text-emerald-600" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {kiralikListings.slice(0, 3).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
