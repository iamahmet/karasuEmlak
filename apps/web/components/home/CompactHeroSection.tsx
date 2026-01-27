"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Home, Key, Sparkles, ArrowRight, MapPin, Square } from "lucide-react";
import { AdvancedSearchPanel } from "@/components/search/AdvancedSearchPanel";
import { CardImage } from "@/components/images";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ComparisonButton } from "@/components/comparison/ComparisonButton";
import type { Listing } from "@/lib/supabase/queries";
import { formatLocation } from "@/lib/utils/format-neighborhood";
import { getPropertyPlaceholder } from "@/lib/utils/placeholder-images";

interface CompactHeroSectionProps {
  basePath?: string;
  featuredListings?: Listing[];
}

export function CompactHeroSection({ basePath = "", featuredListings = [] }: CompactHeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'satilik' | 'kiralik'>('satilik');

  const stats = [
    { value: "500+", label: "Aktif İlan", icon: Home },
    { value: "1000+", label: "Mutlu Müşteri", icon: Sparkles },
    { value: "15", label: "Yıllık Tecrübe", icon: TrendingUp },
  ];

  const quickLinks = [
    { label: "Denize Sıfır", href: `${basePath}/satilik?deniz_manzarasi=true`, badge: "Popüler" },
    { label: "Yeni İlanlar", href: `${basePath}/satilik?sort=newest`, badge: "Yeni" },
    { label: "Fırsat Fiyatlar", href: `${basePath}/satilik?sort=price_asc`, badge: "Fırsat" },
    { label: "Lüks Villalar", href: `${basePath}/satilik?tip=villa`, badge: "Premium" },
  ];

  // Take first 4 listings
  const displayListings = featuredListings.slice(0, 4);

  return (
    <section className="relative bg-gradient-to-b from-white via-blue-50/20 to-white overflow-hidden border-b border-gray-100">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-6 sm:py-8 md:py-10">
          {/* Compact Hero Content */}
          <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
            {/* Badge */}
            <div className="inline-block mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-100 rounded-full backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#006AFF] stroke-[1.5]" />
                <span className="text-xs font-semibold text-[#006AFF] tracking-[-0.01em]">
                  Karasu'nun En Güvenilir Emlak Platformu
                </span>
              </div>
            </div>

            {/* Main Heading - More Compact */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-3 md:mb-4">
              Hayalinizdeki Evi
              <br />
              <span className="text-[#006AFF]">Karasu'da Bulun</span>
            </h1>

            {/* Subtitle - Shorter */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4 md:mb-6 max-w-xl mx-auto">
              <span className="font-semibold text-gray-900">500+ aktif ilan</span> arasından size en uygun seçeneği keşfedin
            </p>

            {/* Compact Stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#006AFF] stroke-[1.5]" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Search Card */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-lg p-4 sm:p-5 md:p-6">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 mb-4 p-1 bg-gray-100 rounded-lg w-full sm:w-fit mx-auto">
                <button
                  onClick={() => setActiveTab('satilik')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'satilik'
                      ? 'bg-white text-[#006AFF] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-3.5 w-3.5 inline-block mr-1.5 stroke-[1.5]" />
                  Satılık
                </button>
                <button
                  onClick={() => setActiveTab('kiralik')}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'kiralik'
                      ? 'bg-white text-[#006AFF] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Key className="h-3.5 w-3.5 inline-block mr-1.5 stroke-[1.5]" />
                  Kiralık
                </button>
              </div>

              {/* Advanced Search Panel */}
              <div className="relative z-20">
                <AdvancedSearchPanel basePath={basePath} />
              </div>

              {/* Quick Links - Compact */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2.5 justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-gray-500 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Popüler Aramalar
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group relative px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#006AFF] rounded-lg text-xs font-medium text-gray-700 hover:text-[#006AFF] transition-all duration-200 hover:scale-105"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-[#006AFF] text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Listings - Compact Grid */}
          {displayListings.length > 0 && (
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Öne Çıkan İlanlar
                  </h2>
                </div>
                <Link
                  href={`${basePath}/satilik`}
                  className="text-sm font-semibold text-[#006AFF] hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  Tümünü Gör
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Listings Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayListings.map((listing, index) => {
                  const mainImage = listing.images?.[0];
                  const imageAlt = mainImage?.alt || `${listing.title} - ${formatLocation(listing.location_neighborhood, listing.location_district)}`;
                  const listingUrl = `${basePath}/ilan/${listing.slug}`;
                  const formattedLocation = formatLocation(listing.location_neighborhood, listing.location_district);

                  return (
                    <Link
                      key={listing.id}
                      href={listingUrl}
                      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative h-40 sm:h-44 bg-gray-100 overflow-hidden">
                        {mainImage?.public_id || mainImage?.url ? (
                          mainImage.url ? (
                            <img
                              src={mainImage.url}
                              alt={imageAlt}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading={index < 2 ? "eager" : "lazy"}
                            />
                          ) : (
                            <CardImage
                              publicId={mainImage.public_id!}
                              alt={imageAlt}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              priority={index < 2}
                              fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 400, 300)}
                            />
                          )
                        ) : (
                          <img
                            src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 400, 300)}
                            alt={imageAlt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading={index < 2 ? "eager" : "lazy"}
                          />
                        )}
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                          <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
                          <ComparisonButton listingId={listing.id} variant="card" />
                        </div>
                        
                        <div className="absolute top-2 left-2 bg-[#006AFF] text-white px-2 py-0.5 rounded text-[10px] font-semibold shadow-md z-10">
                          {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                        </div>
                        
                        {listing.featured && (
                          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold shadow-md z-10">
                            ⭐ Öne Çıkan
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#006AFF] transition-colors leading-snug">
                          {listing.title}
                        </h3>
                        
                        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-1">{formattedLocation}</span>
                        </p>

                        {/* Features */}
                        {listing.features && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                            {(listing.features as any).sizeM2 && (
                              <span className="flex items-center gap-1">
                                <Square className="h-3 w-3 text-gray-400" />
                                <span>{(listing.features as any).sizeM2} m²</span>
                              </span>
                            )}
                            {(listing.features as any).rooms && (
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3 text-gray-400" />
                                <span>{(listing.features as any).rooms} Oda</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        {listing.price_amount && (
                          <div className="flex items-baseline gap-1 pt-2 border-t border-gray-100">
                            <p className="text-lg sm:text-xl font-bold text-[#006AFF]">
                              ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                            </p>
                            {listing.status === 'kiralik' && (
                              <span className="text-xs text-gray-500 font-medium">/ay</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust Indicators - Compact */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-600 px-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="font-medium">Ücretsiz Danışmanlık</span>
            </div>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="font-medium">500+ Aktif İlan</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="font-medium">7/24 WhatsApp Destek</span>
            <span className="text-gray-300 hidden md:inline">•</span>
            <span className="font-medium">15 Yıllık Tecrübe</span>
          </div>
        </div>
      </div>
    </section>
  );
}
