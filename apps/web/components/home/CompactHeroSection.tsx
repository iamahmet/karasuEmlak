"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Home, Sparkles, ArrowRight, MapPin, Square, ChevronLeft, ChevronRight, Clock, MessageCircle, Phone, Search as SearchIcon } from "lucide-react";
import { AdvancedSearchPanel } from "@/components/search/AdvancedSearchPanel";
import { CardImage } from "@/components/images";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ComparisonButton } from "@/components/comparison/ComparisonButton";
import { trackHomepageEvent } from "@/lib/analytics/events";
import { trackCTAClick, trackInternalLink } from "@/lib/analytics/link-tracking";
import type { Listing } from "@/lib/supabase/queries";
import { formatLocation } from "@/lib/utils/format-neighborhood";
import { getPropertyPlaceholder } from "@/lib/utils/placeholder-images";

interface CompactHeroSectionProps {
  basePath?: string;
  recentListings?: Listing[];
  neighborhoods?: string[];
}

export function CompactHeroSection({ basePath = "", recentListings = [], neighborhoods = [] }: CompactHeroSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeViewers, setActiveViewers] = useState(Math.floor(Math.random() * 15) + 10);

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

  // URL state sync - restore slide from URL if exists
  useEffect(() => {
    const slideParam = searchParams.get('slide');
    if (slideParam && !isNaN(Number(slideParam))) {
      const slideIndex = Math.min(Number(slideParam), displayListings.length - 1);
      setCurrentSlide(slideIndex);
    }
  }, [searchParams, displayListings.length]);

  // Progress bar for auto-play
  useEffect(() => {
    if (displayListings.length <= 1 || isHovered) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = 50; // Update every 50ms
    const totalTime = 5000; // 5 seconds
    const increment = 100 / (totalTime / interval);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [currentSlide, displayListings.length, isHovered]);

  // Auto-play slider (pause on hover)
  useEffect(() => {
    if (displayListings.length <= 1 || isHovered) return;
    
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % displayListings.length;
        // Update URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.set('slide', next.toString());
        window.history.replaceState({}, '', url.toString());
        return next;
      });
      setProgress(0);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [displayListings.length, isHovered]);

  // Update active viewers (simulate real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveViewers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(30, prev + change));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = useCallback(() => {
    const prev = currentSlide === 0 ? displayListings.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    setProgress(0);
    resetAutoPlay();
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('slide', prev.toString());
    window.history.replaceState({}, '', url.toString());
    
    // Analytics
    trackHomepageEvent.carouselInteraction('prev');
  }, [currentSlide, displayListings.length]);

  const handleNext = useCallback(() => {
    const next = (currentSlide + 1) % displayListings.length;
    setCurrentSlide(next);
    setProgress(0);
    resetAutoPlay();
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('slide', next.toString());
    window.history.replaceState({}, '', url.toString());
    
    // Analytics
    trackHomepageEvent.carouselInteraction('next');
  }, [currentSlide, displayListings.length]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    setProgress(0);
    if (!isHovered && displayListings.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % displayListings.length;
          const url = new URL(window.location.href);
          url.searchParams.set('slide', next.toString());
          window.history.replaceState({}, '', url.toString());
          return next;
        });
        setProgress(0);
      }, 5000);
    }
  };

  // Touch swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && displayListings.length > 1) {
      handleNext();
    }
    if (isRightSwipe && displayListings.length > 1) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayListings.length <= 1) return;
      
      // Only handle if slider is in viewport
      const slider = sliderRef.current;
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, displayListings.length]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    resetAutoPlay();
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('slide', index.toString());
    window.history.replaceState({}, '', url.toString());
    
    // Analytics
    trackHomepageEvent.carouselInteraction('indicator');
  };

  const handleListingClick = (listingId: string, position: number) => {
    trackHomepageEvent.listingCardClick(listingId, position);
    trackInternalLink(`${basePath}/ilan/${recentListings[position]?.slug}`, recentListings[position]?.title || '', 'Listings', position);
  };

  const handleCTAClick = (type: 'whatsapp' | 'phone' | 'search') => {
    trackCTAClick(
      type === 'whatsapp' ? 'WhatsApp İletişim' : type === 'phone' ? 'Telefon' : 'Hemen Ara',
      'primary',
      type === 'whatsapp' ? 'whatsapp://send?phone=905551234567' : type === 'phone' ? 'tel:+905551234567' : `${basePath}/satilik`,
      'hero'
    );
    trackHomepageEvent.ctaClick(type === 'whatsapp' ? 'whatsapp' : 'phone');
  };

  return (
    <section 
      className="relative bg-white overflow-hidden border-b border-gray-200"
      aria-label="Ana hero bölümü"
    >
      {/* Minimal Background */}
      <div className="absolute inset-0 bg-gray-50/50" aria-hidden="true"></div>

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
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                    <span className="text-xs font-semibold text-blue-600">
                      Karasu'nun En Güvenilir Emlak Platformu
                    </span>
                  </div>
                </div>

                {/* Main Heading */}
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
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm"
                      role="group"
                      aria-label={`${stat.value} ${stat.label}`}
                    >
                      <div className="p-1.5 bg-blue-50 rounded-lg" aria-hidden="true">
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

              {/* Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCTAClick('search')}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  aria-label="Hemen ara - Tüm ilanları görüntüle"
                >
                  <SearchIcon className="h-5 w-5" />
                  Hemen Ara
                </button>
                <button
                  onClick={() => handleCTAClick('whatsapp')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  aria-label="WhatsApp ile iletişime geç"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleCTAClick('phone')}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  aria-label="Telefon ile ara"
                >
                  <Phone className="h-5 w-5" />
                  Ara
                </button>
              </div>

              {/* Social Proof - Live Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-blue-50/50 px-4 py-2.5 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="font-semibold text-gray-900">
                    <span className="text-blue-600">{activeViewers}</span> kişi şu anda arıyor
                  </span>
                </div>
              </div>

              {/* Search Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
                <AdvancedSearchPanel basePath={basePath} neighborhoods={neighborhoods} />

                {/* Quick Links */}
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                    <TrendingUp className="h-4 w-4 text-gray-500" aria-hidden="true" />
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
                        onClick={() => {
                          trackHomepageEvent.neighborhoodClick(link.label);
                          trackInternalLink(link.href, link.label, 'Quick Links');
                        }}
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
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" aria-hidden="true"></div>
                  <span className="font-medium">Ücretsiz Danışmanlık</span>
                </div>
                <span className="text-gray-300" aria-hidden="true">•</span>
                <span className="font-medium">500+ Aktif İlan</span>
                <span className="text-gray-300" aria-hidden="true">•</span>
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
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  role="region"
                  aria-label="Son eklenen ilanlar slider"
                >
                  {/* Slider Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Son Eklenen İlanlar
                      </h2>
                    </div>
                    {displayListings.length > 1 && (
                      <div className="flex items-center gap-2" role="group" aria-label="Slider kontrolleri">
                        <button
                          onClick={handlePrev}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Önceki ilan"
                          type="button"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-700" aria-hidden="true" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Sonraki ilan"
                          type="button"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-700" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Slider Container */}
                  <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
                    {/* Progress Bar */}
                    {displayListings.length > 1 && !isHovered && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-20" aria-hidden="true">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-50 ease-linear"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}

                    <div
                      ref={sliderRef}
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      role="group"
                      aria-label={`İlan ${currentSlide + 1} / ${displayListings.length}`}
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
                            role="group"
                            aria-label={`İlan ${index + 1}: ${listing.title}`}
                          >
                            <Link
                              href={listingUrl}
                              className="block group"
                              onClick={() => handleListingClick(listing.id, index)}
                              aria-label={`${listing.title} - ${formattedLocation} - ${listing.price_amount ? `₺${new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}` : 'Fiyat bilgisi yok'}`}
                            >
                              {/* Image with WebP optimization */}
                              <div className="relative h-56 sm:h-64 bg-gray-100 overflow-hidden">
                                {mainImage?.public_id || mainImage?.url ? (
                                  mainImage.url ? (
                                    <picture>
                                      <source srcSet={mainImage.url.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp" />
                                      <img
                                        src={mainImage.url}
                                        alt={imageAlt}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                      />
                                    </picture>
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
                                    decoding="async"
                                  />
                                )}
                                
                                {/* Badges */}
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-10" role="group" aria-label="İlan aksiyonları">
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
                                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                                  <span className="line-clamp-1">{formattedLocation}</span>
                                </p>

                                {/* Features */}
                                {listing.features && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3" role="list" aria-label="İlan özellikleri">
                                    {(listing.features as any).sizeM2 && (
                                      <span className="flex items-center gap-1.5" role="listitem">
                                        <Square className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                        <span>{(listing.features as any).sizeM2} m²</span>
                                      </span>
                                    )}
                                    {(listing.features as any).rooms && (
                                      <span className="flex items-center gap-1.5" role="listitem">
                                        <Home className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
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
                      <div 
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
                        role="tablist"
                        aria-label="Slider sayfa göstergeleri"
                      >
                        {displayListings.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlideClick(index)}
                            className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              index === currentSlide
                                ? 'w-6 bg-blue-600'
                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Slide ${index + 1}`}
                            aria-selected={index === currentSlide ? "true" : "false"}
                            role="tab"
                            type="button"
                          />
                        ))}
                      </div>
                    )}

                    {/* View All Link */}
                    <div className="absolute top-3 right-3 z-10">
                      <Link
                        href={`${basePath}/satilik`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => {
                          trackInternalLink(`${basePath}/satilik`, 'Tümünü Gör', 'Navigation');
                          trackHomepageEvent.heroSearchClick();
                        }}
                        aria-label="Tüm ilanları görüntüle"
                      >
                        Tümünü Gör
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
