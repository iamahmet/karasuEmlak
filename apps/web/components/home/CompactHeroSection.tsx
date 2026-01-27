"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Home, Sparkles, ArrowRight, MapPin, Square, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { AdvancedSearchPanel } from "@/components/search/AdvancedSearchPanel";
import { CardImage } from "@/components/images";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ComparisonButton } from "@/components/comparison/ComparisonButton";
import type { Listing } from "@/lib/supabase/queries";
import { formatLocation } from "@/lib/utils/format-neighborhood";
import { getPropertyPlaceholder } from "@/lib/utils/placeholder-images";

interface CompactHeroSectionProps {
  basePath?: string;
  recentListings?: Listing[];
}

export function CompactHeroSection({ basePath = "", recentListings = [] }: CompactHeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // Take first 6 recent listings for slider
  const displayListings = recentListings.slice(0, 6);

  // Auto-play slider (pause on hover)
  useEffect(() => {
    if (displayListings.length <= 1 || isHovered) return;
    
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayListings.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [displayListings.length, isHovered]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayListings.length - 1 : prev - 1));
    resetAutoPlay();
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displayListings.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (!isHovered && displayListings.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayListings.length);
      }, 5000);
    }
  };

  return (
    <section className="relative bg-white overflow-hidden border-b border-gray-200">
      {/* Minimal Background - No Gradients */}
      <div className="absolute inset-0 bg-gray-50/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-8 sm:py-10 md:py-12">
          {/* Single Hero Section - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Hero Content + Search */}
            <div className="space-y-6">
              {/* Hero Content */}
              <div className="text-center lg:text-left space-y-4">
                {/* Badge */}
                <div className="inline-block">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600">
                      Karasu'nun En Güvenilir Emlak Platformu
                    </span>
                  </div>
                </div>

                {/* Main Heading - No Gradients */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Hayalinizdeki Evi
                  <br />
                  <span className="text-blue-600">Karasu'da Bulun</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  <span className="font-semibold text-gray-900">500+ aktif ilan</span>
                  {" "}arasından size en uygun seçeneği keşfedin
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-1.5 bg-blue-50 rounded-lg">
                        <stat.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold text-gray-900 leading-none">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
                <AdvancedSearchPanel basePath={basePath} />

                {/* Quick Links */}
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Popüler Aramalar
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {link.label}
                        {link.badge && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Ücretsiz Danışmanlık</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="font-medium">500+ Aktif İlan</span>
                <span className="text-gray-300">•</span>
                <span className="font-medium">7/24 WhatsApp Destek</span>
              </div>
            </div>

            {/* Right Column: Recent Listings Slider */}
            {displayListings.length > 0 && (
              <div>
                <div 
                  className="relative"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {/* Slider Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Son Eklenen İlanlar
                      </h2>
                    </div>
                    {displayListings.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrev}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Önceki ilan"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Sonraki ilan"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Slider Container */}
                  <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
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
                              <div className="relative h-56 sm:h-64 bg-gray-100 overflow-hidden">
                                {mainImage?.public_id || mainImage?.url ? (
                                  mainImage.url ? (
                                    <img
                                      src={mainImage.url}
                                      alt={imageAlt}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      loading={index === 0 ? "eager" : "lazy"}
                                    />
                                  ) : (
                                    <CardImage
                                      publicId={mainImage.public_id!}
                                      alt={imageAlt}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      sizes="(max-width: 1024px) 100vw, 50vw"
                                      priority={index === 0}
                                      fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 600, 400)}
                                    />
                                  )
                                ) : (
                                  <img
                                    src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 600, 400)}
                                    alt={imageAlt}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading={index === 0 ? "eager" : "lazy"}
                                  />
                                )}
                                
                                {/* Badges */}
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                  <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
                                  <ComparisonButton listingId={listing.id} variant="card" />
                                </div>
                                
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-md z-10">
                                  {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-4 bg-white">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {listing.title}
                                </h3>
                                
                                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="line-clamp-1">{formattedLocation}</span>
                                </p>

                                {/* Features */}
                                {listing.features && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    {(listing.features as any).sizeM2 && (
                                      <span className="flex items-center gap-1.5">
                                        <Square className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{(listing.features as any).sizeM2} m²</span>
                                      </span>
                                    )}
                                    {(listing.features as any).rooms && (
                                      <span className="flex items-center gap-1.5">
                                        <Home className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{(listing.features as any).rooms} Oda</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Price */}
                                {listing.price_amount && (
                                  <div className="flex items-baseline gap-1.5 pt-3 border-t border-gray-100">
                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                      ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                                    </p>
                                    {listing.status === 'kiralik' && (
                                      <span className="text-sm text-gray-500 font-medium">/ay</span>
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
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                        {displayListings.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentSlide(index);
                              resetAutoPlay();
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentSlide
                                ? 'w-6 bg-blue-600'
                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* View All Link */}
                    <div className="absolute top-3 right-3 z-10">
                      <Link
                        href={`${basePath}/satilik`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        Tümünü Gör
                        <ArrowRight className="h-3.5 w-3.5" />
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
