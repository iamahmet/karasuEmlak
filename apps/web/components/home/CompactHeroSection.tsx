"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Home, Sparkles, ArrowRight, MapPin, Square, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

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

  // Take first 6 listings for slider
  const displayListings = featuredListings.slice(0, 6);

  // Auto-play slider
  useEffect(() => {
    if (displayListings.length <= 1) return;
    
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayListings.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [displayListings.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayListings.length - 1 : prev - 1));
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayListings.length);
      }, 5000);
    }
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displayListings.length);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayListings.length);
      }, 5000);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-blue-50/20 to-white overflow-hidden border-b border-gray-100">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-4 sm:py-6 md:py-8">
          {/* Two Column Layout: Hero + Listings Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left Column: Hero Content + Search */}
            <div className="order-2 lg:order-1">
              {/* Compact Hero Content */}
              <div className="text-center lg:text-left mb-4 sm:mb-6">
                {/* Badge */}
                <div className="inline-block mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-100 rounded-full backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#006AFF] stroke-[1.5]" />
                    <span className="text-xs font-semibold text-[#006AFF] tracking-[-0.01em]">
                      Karasu'nun En Güvenilir Emlak Platformu
                    </span>
                  </div>
                </div>

                {/* Main Heading - More Compact */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-2 md:mb-3">
                  Hayalinizdeki Evi
                  <br />
                  <span className="text-[#006AFF]">Karasu'da Bulun</span>
                </h1>

                {/* Subtitle - Shorter */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 md:mb-4 max-w-xl mx-auto lg:mx-0">
                  <span className="font-semibold text-gray-900">500+ aktif ilan</span> arasından size en uygun seçeneği keşfedin
                </p>

                {/* Compact Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded-lg">
                        <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#006AFF] stroke-[1.5]" />
                      </div>
                      <div className="text-left">
                        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none">
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

              {/* Compact Search Card - No Toggle (AdvancedSearchPanel has its own) */}
              <div className="mb-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-lg p-4 sm:p-5">
                  {/* Advanced Search Panel - No duplicate toggle */}
                  <div className="relative z-20">
                    <AdvancedSearchPanel basePath={basePath} />
                  </div>

                  {/* Quick Links - Compact */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2.5 justify-center lg:justify-start">
                      <TrendingUp className="h-3.5 w-3.5 text-gray-500 stroke-[1.5]" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Popüler Aramalar
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
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

              {/* Trust Indicators - Compact */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Ücretsiz Danışmanlık</span>
                </div>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="font-medium">500+ Aktif İlan</span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="font-medium">7/24 WhatsApp Destek</span>
              </div>
            </div>

            {/* Right Column: Listings Slider */}
            {displayListings.length > 0 && (
              <div className="order-1 lg:order-2">
                <div className="relative">
                  {/* Slider Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Öne Çıkan İlanlar
                      </h2>
                    </div>
                    {displayListings.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrev}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-[#006AFF] transition-colors"
                          aria-label="Önceki ilan"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-[#006AFF] transition-colors"
                          aria-label="Sonraki ilan"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Slider Container */}
                  <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-lg">
                    <div
                      ref={sliderRef}
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {displayListings.map((listing, index) => {
                        const mainImage = listing.images?.[0];
                        const imageAlt = mainImage?.alt || `${listing.title} - ${formatLocation(listing.location_neighborhood, listing.location_district)}`;
                        const listingUrl = `${basePath}/ilan/${listing.slug}`;
                        const formattedLocation = formatLocation(listing.location_neighborhood, listing.location_district);

                        return (
                          <div
                            key={listing.id}
                            className="w-full flex-shrink-0"
                            style={{ minWidth: '100%' }}
                          >
                            <Link
                              href={listingUrl}
                              className="block group"
                            >
                              {/* Image */}
                              <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
                                {mainImage?.public_id || mainImage?.url ? (
                                  mainImage.url ? (
                                    <img
                                      src={mainImage.url}
                                      alt={imageAlt}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      loading={index === 0 ? "eager" : "lazy"}
                                    />
                                  ) : (
                                    <CardImage
                                      publicId={mainImage.public_id!}
                                      alt={imageAlt}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      sizes="(max-width: 1024px) 100vw, 50vw"
                                      priority={index === 0}
                                      fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 600, 400)}
                                    />
                                  )
                                ) : (
                                  <img
                                    src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 600, 400)}
                                    alt={imageAlt}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading={index === 0 ? "eager" : "lazy"}
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
                              <div className="p-4">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#006AFF] transition-colors leading-snug">
                                  {listing.title}
                                </h3>
                                
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="line-clamp-1">{formattedLocation}</span>
                                </p>

                                {/* Features */}
                                {listing.features && (
                                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
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
                                    <p className="text-xl sm:text-2xl font-bold text-[#006AFF]">
                                      ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                                    </p>
                                    {listing.status === 'kiralik' && (
                                      <span className="text-xs text-gray-500 font-medium">/ay</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                    {/* Slider Dots */}
                    {displayListings.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                        {displayListings.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentSlide
                                ? 'w-6 bg-[#006AFF]'
                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* View All Link */}
                    <div className="absolute top-2 right-2 z-10">
                      <Link
                        href={`${basePath}/satilik`}
                        className="text-xs font-semibold text-[#006AFF] hover:text-blue-700 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 hover:border-[#006AFF] transition-colors"
                      >
                        Tümünü Gör
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
