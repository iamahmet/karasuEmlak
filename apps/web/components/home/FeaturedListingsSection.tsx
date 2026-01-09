"use client";

import Link from "next/link";
import { MapPin, Square, Home, ExternalLink } from "lucide-react";
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { Button } from "@karasu/ui";
import { ListingImage, ExternalImage } from "@/components/images";
import type { Listing } from "@/lib/supabase/queries/listings";
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';

interface FeaturedListingsSectionProps {
  listings: Listing[];
  basePath?: string;
}

export function FeaturedListingsSection({ listings, basePath = "" }: FeaturedListingsSectionProps) {
  if (listings.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Henüz ilan bulunmuyor
            </h3>
            <p className="text-gray-500 mb-6">
              Yakında yeni ilanlar eklenecek
            </p>
            <Button asChild>
              <Link href={`${basePath}/ilan-ekle`}>
                İlk İlanı Siz Ekleyin
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Öne Çıkan İlanlar</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Sizin İçin Seçtiklerimiz
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'da en popüler satılık ve kiralık gayrimenkul seçenekleri. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları.
            </p>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {listings.map((listing) => {
              const mainImage = listing.images?.[0];
              const features = listing.features || {};
              
              // Fallback image URL for listings
              const fallbackImageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
              
              return (
                <Link 
                  key={listing.id} 
                  href={`${basePath}/ilan/${listing.slug}`}
                  className="group block"
                >
                  <article className="relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2">
                    {/* Image Container */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {mainImage?.public_id || mainImage?.url ? (
                        mainImage.url ? (
                          <img
                            src={mainImage.url}
                            alt={mainImage.alt || listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        ) : (
                          <ListingImage
                            publicId={mainImage.public_id!}
                            alt={mainImage.alt || listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fallback={fallbackImageUrl}
                          />
                        )
                      ) : (
                        <img
                          src={fallbackImageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`px-3 py-1.5 rounded-lg text-[13px] font-bold text-white shadow-lg ${
                          listing.status === 'satilik' 
                            ? 'bg-[#006AFF]' 
                            : 'bg-[#00A862]'
                        }`}>
                          {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                        </div>
                      </div>
                      
                      {/* Featured Badge */}
                      {listing.featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-[13px] font-bold shadow-lg">
                            ⭐ Öne Çıkan
                          </div>
                        </div>
                      )}
                      
                      {/* Image Count */}
                      {listing.images && listing.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-white/95 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-semibold shadow-md">
                          📸 {listing.images.length} Fotoğraf
                        </div>
                      )}

                      {/* Favorite Button */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <FavoriteButton 
                          listingId={listing.id} 
                          listingTitle={listing.title}
                          variant="card"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 leading-[1.3] tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                        {listing.title}
                      </h3>
                      
                      {/* Location */}
                      <p className="text-[15px] text-gray-600 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 stroke-[1.5]" />
                        <span className="font-medium">{listing.location_neighborhood}, {listing.location_district}</span>
                      </p>
                      
                      {/* Features */}
                      {(features.sizeM2 || features.rooms || features.bathrooms) && (
                        <div className="flex items-center gap-4 text-[14px] text-gray-600 mb-5 pb-4 border-b border-gray-200">
                          {features.sizeM2 && (
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Square className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                              {features.sizeM2} m²
                            </span>
                          )}
                          {features.rooms && (
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Home className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                              {features.rooms} Oda
                            </span>
                          )}
                          {features.bathrooms && (
                            <span className="font-semibold">
                              {features.bathrooms} Banyo
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Price */}
                      {listing.price_amount && (
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#006AFF] tracking-tight">
                              ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                            </span>
                            {listing.status === 'kiralik' && (
                              <span className="text-[15px] text-gray-500 font-medium ml-1">
                                /ay
                              </span>
                            )}
                          </div>
                          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-[#006AFF] transition-colors duration-200" />
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button 
              size="lg"
              className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-8 py-6 text-[15px] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/satilik`}>
                Tüm İlanları Görüntüle
                <ExternalLink className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
