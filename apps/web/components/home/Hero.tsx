"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Sparkles, ArrowRight, MapPin, Square, ChevronLeft, ChevronRight, Clock, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Card, CardContent } from "@karasu/ui";
import { NeighborhoodAutocomplete } from "@/components/search/NeighborhoodAutocomplete";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary/optimization";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ComparisonButton } from "@/components/comparison/ComparisonButton";
import { trackHomepageEvent } from "@/lib/analytics/events";
import { trackCTAClick, trackInternalLink } from "@/lib/analytics/link-tracking";
import type { Listing } from "@/lib/supabase/queries";
import { formatLocation } from "@/lib/utils/format-neighborhood";
import { getPropertyPlaceholder } from "@/lib/utils/placeholder-images";
import { cn } from "@karasu/lib";

interface HeroProps {
  basePath?: string;
  recentListings?: Listing[];
  neighborhoods?: string[];
}

export function Hero({ basePath = "", recentListings = [], neighborhoods = [] }: HeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchStatus, setSearchStatus] = useState<'satilik' | 'kiralik'>('satilik');
  const [searchLocation, setSearchLocation] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeViewers, setActiveViewers] = useState(18);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isInView, setIsInView] = useState(true);
  
  // Fade-in animation on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Respect prefers-reduced-motion and pause animation-heavy work.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    // Safari < 14 uses addListener/removeListener
     
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', apply);
     
    else mq.addListener(apply);
    return () => {
       
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', apply);
       
      else mq.removeListener(apply);
    };
  }, []);

  // Pause timers when tab is hidden.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => setIsTabVisible(document.visibilityState === 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Only run autoplay/progress when the hero is in the viewport.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = sliderRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(!!entry?.isIntersecting);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stats = [
    { value: "500+", label: "Aktif İlan", icon: Home },
    { value: "1000+", label: "Mutlu Müşteri", icon: Sparkles },
    { value: "15", label: "Yıllık Tecrübe", icon: Clock },
  ];

  const displayListings = recentListings.slice(0, 6);

  // URL state sync
  useEffect(() => {
    const slideParam = searchParams.get('slide');
    if (slideParam && !isNaN(Number(slideParam))) {
      const slideIndex = Math.min(Number(slideParam), displayListings.length - 1);
      setCurrentSlide(slideIndex);
    }
  }, [searchParams, displayListings.length]);

  // Progress bar
  useEffect(() => {
    if (reduceMotion || !isTabVisible || !isInView || displayListings.length <= 1 || isHovered) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = 50;
    const totalTime = 5000;
    const increment = 100 / (totalTime / interval);

    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + increment));
    }, interval);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentSlide, displayListings.length, isHovered]);

  // Auto-play slider
  useEffect(() => {
    if (reduceMotion || !isTabVisible || !isInView || displayListings.length <= 1 || isHovered) return;
    
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

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [displayListings.length, isHovered, reduceMotion, isTabVisible, isInView]);

  // Active viewers simulation
  useEffect(() => {
    setActiveViewers(Math.floor(Math.random() * 15) + 10);
    const interval = setInterval(() => {
      setActiveViewers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(30, prev + change));
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateURL = useCallback((index: number) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('slide', index.toString());
    window.history.replaceState({}, '', url.toString());
  }, []);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    if (!reduceMotion && isTabVisible && isInView && !isHovered && displayListings.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % displayListings.length;
          updateURL(next);
          return next;
        });
        setProgress(0);
      }, 5000);
    }
  }, [reduceMotion, isTabVisible, isInView, isHovered, displayListings.length, updateURL]);

  const handlePrev = useCallback(() => {
    const prev = currentSlide === 0 ? displayListings.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    setProgress(0);
    resetAutoPlay();
    updateURL(prev);
    trackHomepageEvent.carouselInteraction('prev');
  }, [currentSlide, displayListings.length, resetAutoPlay, updateURL]);

  const handleNext = useCallback(() => {
    const next = (currentSlide + 1) % displayListings.length;
    setCurrentSlide(next);
    setProgress(0);
    resetAutoPlay();
    updateURL(next);
    trackHomepageEvent.carouselInteraction('next');
  }, [currentSlide, displayListings.length, resetAutoPlay, updateURL]);

  // Touch swipe
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
    if (distance > minSwipeDistance && displayListings.length > 1) handleNext();
    if (distance < -minSwipeDistance && displayListings.length > 1) handlePrev();
  };

  // Keyboard navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (displayListings.length <= 1) return;
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
    updateURL(index);
    trackHomepageEvent.carouselInteraction('indicator');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('neighborhood', searchLocation);
    params.set('status', searchStatus);
    const url = `${basePath}/${searchStatus}${params.toString() ? `?${params.toString()}` : ''}`;
    trackHomepageEvent.heroSearchClick();
    trackCTAClick('İlan Ara', 'primary', url, 'hero');
    router.push(url);
  };

  return (
    <section 
      className="relative bg-white overflow-hidden border-b border-gray-100"
      aria-label="Ana hero bölümü"
    >
      {/* Subtle Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Faint radial gradient blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Premium Spacing: 56-72px top, 40-56px bottom */}
        <div className="py-14 sm:py-16 md:py-20">
          {/* 12-Column Grid: Left 5 cols, Right 7 cols on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Hero Content + Search (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Badge */}
              <div className="inline-block">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50/90 to-blue-50/70 border border-blue-100/80 rounded-full backdrop-blur-sm shadow-sm",
                  "transition-all duration-700 ease-out",
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                )}>
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" aria-hidden="true" />
                  <span className="text-xs font-semibold text-blue-600 tracking-tight">
                    Karasu'nun En Güvenilir Emlak Platformu
                  </span>
                </div>
              </div>

              {/* Premium H1 Typography */}
              <div className={cn(
                "space-y-4 transition-all duration-700 ease-out delay-100",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <h1 className="text-[34px] sm:text-[40px] md:text-[56px] lg:text-[64px] font-bold text-gray-900 leading-[1.1] tracking-[-0.02em]">
                  Hayalinizdeki Evi
                  <br />
                  <span className="relative inline-block">
                    <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      Karasu'da
                    </span>
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600/30 via-blue-600/50 to-blue-600/30 -translate-y-1 rounded-full"></span>
                  </span>
                  {" "}Bulun
                </h1>

                {/* Subheadline: 16-18px, max 2 lines */}
                <p className="text-base sm:text-[17px] md:text-[18px] text-gray-600 leading-relaxed max-w-lg">
                  500+ aktif ilan arasından size en uygun seçeneği keşfedin
                </p>
              </div>

              {/* Trust Strip: Single Row (replaces 3 big cards) */}
              <div className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-3 text-sm transition-all duration-700 ease-out delay-200",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 group cursor-default"
                  >
                    <div className="p-1.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <stat.icon className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stat.value}</span>
                      <span className="text-gray-600 ml-1">{stat.label}</span>
                    </div>
                    {index < stats.length - 1 && (
                      <span className="text-gray-300 mx-2 hidden sm:inline" aria-hidden="true">•</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Premium Search Widget */}
              <Card className={cn(
                "border-gray-200/80 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm",
                "transition-all duration-700 ease-out delay-300",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                "hover:shadow-2xl hover:border-blue-200/50"
              )}>
                <CardContent className="p-6 space-y-4">
                  {/* Segmented Control: Satılık / Kiralık */}
                  <div className="flex items-center gap-2 p-1 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <button
                      onClick={() => setSearchStatus('satilik')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-out",
                        searchStatus === 'satilik'
                          ? "bg-white text-blue-600 shadow-md scale-[1.02]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      )}
                      aria-label="Satılık ilanlar"
                    >
                      <Home className="h-4 w-4 inline-block mr-2" />
                      Satılık
                    </button>
                    <button
                      onClick={() => setSearchStatus('kiralik')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-out",
                        searchStatus === 'kiralik'
                          ? "bg-white text-blue-600 shadow-md scale-[1.02]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      )}
                      aria-label="Kiralık ilanlar"
                    >
                      <Home className="h-4 w-4 inline-block mr-2" />
                      Kiralık
                    </button>
                  </div>

                  {/* Location Input with Autocomplete */}
                  <div>
                    <NeighborhoodAutocomplete
                      value={searchLocation}
                      onChange={setSearchLocation}
                      neighborhoods={neighborhoods}
                    />
                  </div>

                  {/* Quick Price Filters (Compact) */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min Fiyat"
                      className="text-sm"
                      onChange={(e) => {
                        // Price filter logic can be added here
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Max Fiyat"
                      className="text-sm"
                      onChange={(e) => {
                        // Price filter logic can be added here
                      }}
                    />
                  </div>

                  {/* Primary CTA Button */}
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <SearchIcon className="h-5 w-5 mr-2" />
                    İlan Ara
                  </Button>

                  {/* Secondary Action: Advanced Filters */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="w-full text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors"
                    aria-label="Detaylı filtreler"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Detaylı Filtre
                  </button>
                </CardContent>
              </Card>

              {/* Social Proof: Live Stats */}
              <div className={cn(
                "flex items-center gap-2 text-sm text-gray-600 bg-gradient-to-r from-blue-50/80 to-blue-50/50 px-4 py-2.5 rounded-lg border border-blue-100/80 shadow-sm",
                "transition-all duration-700 ease-out delay-400",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" aria-hidden="true"></div>
                </div>
                <span className="font-semibold text-gray-900">
                  <span className="text-blue-600 font-bold">{activeViewers}</span> kişi şu anda arıyor
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Latest Listings Showcase (7 cols) */}
            {displayListings.length > 0 && (
              <div className="lg:col-span-7">
                <div
                  className="relative"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  role="region"
                  aria-label="Son eklenen ilanlar"
                >
                  {/* Header with View All Link */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Son Eklenen İlanlar
                      </h2>
                    </div>
                    <Link
                      href={`${basePath}/satilik`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      onClick={() => {
                        trackInternalLink(`${basePath}/satilik`, 'Tümünü Gör', 'Navigation');
                        trackHomepageEvent.heroSearchClick();
                      }}
                    >
                      Tümünü Gör
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Premium Showcase Card */}
                  <Card className={cn(
                    "border-gray-200/80 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm",
                    "transition-all duration-700 ease-out delay-300",
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                    "hover:shadow-2xl hover:border-blue-200/50"
                  )}>
                    {/* Progress Bar */}
                    {displayListings.length > 1 && !isHovered && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-20" aria-hidden="true">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-50 ease-linear"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}

                    <div className="relative">
                      {/* Carousel Container */}
                      <div
                        ref={sliderRef}
                        className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
                                className="block group transition-transform duration-300 hover:scale-[1.01]"
                                onClick={() => {
                                  trackHomepageEvent.listingCardClick(listing.id, index);
                                  trackInternalLink(listingUrl, listing.title || '', 'Listings', index);
                                }}
                                aria-label={`${listing.title} - ${formattedLocation}`}
                              >
                                {/* Image with Aspect Ratio */}
                                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                  {(() => {
                                    const placeholderUrl = getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600);
                                    
                                    // Priority: url > public_id > placeholder
                                    if (mainImage?.url) {
                                      return (
                                        <img
                                          src={mainImage.url}
                                          alt={imageAlt}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          loading={index === 0 ? "eager" : "lazy"}
                                          decoding="async"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = placeholderUrl;
                                          }}
                                        />
                                      );
                                    }
                                    
                                    if (mainImage?.public_id) {
                                      try {
                                        // Generate optimized Cloudinary URL
                                        const imageUrl = getOptimizedCloudinaryUrl(mainImage.public_id, {
                                          width: 800,
                                          height: 600,
                                          quality: 'auto',
                                          format: 'auto',
                                        });
                                        
                                        if (!imageUrl || imageUrl.trim() === '') {
                                          throw new Error('Invalid image URL');
                                        }
                                        
                                        // Use standard img tag for reliability
                                        return (
                                          <img
                                            src={imageUrl}
                                            alt={imageAlt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = placeholderUrl;
                                            }}
                                          />
                                        );
                                      } catch (error) {
                                        // Fallback to placeholder if URL generation fails
                                        return (
                                          <img
                                            src={placeholderUrl}
                                            alt={imageAlt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                          />
                                        );
                                      }
                                    }
                                    
                                    // Fallback placeholder
                                    return (
                                      <img
                                        src={placeholderUrl}
                                        alt={imageAlt}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                      />
                                    );
                                  })()}
                                  
                                  {/* Badges */}
                                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                    <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
                                    <ComparisonButton listingId={listing.id} variant="card" />
                                  </div>
                                  
                                  {/* Status Badge */}
                                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/20">
                                    {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                                  </div>
                                </div>

                                {/* Content */}
                                <CardContent className="p-6 space-y-3 bg-gradient-to-b from-white to-gray-50/50">
                                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                                    {listing.title}
                                  </h3>
                                  
                                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                                    <span className="line-clamp-1">{formattedLocation}</span>
                                  </p>

                                  {/* Features */}
                                  {listing.features && (
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      {(listing.features as any).sizeM2 && (
                                        <span className="flex items-center gap-1.5">
                                          <Square className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                          <span>{(listing.features as any).sizeM2} m²</span>
                                        </span>
                                      )}
                                      {(listing.features as any).rooms && (
                                        <span className="flex items-center gap-1.5">
                                          <Home className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                          <span>{(listing.features as any).rooms} Oda</span>
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Price */}
                                  {listing.price_amount && (
                                    <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                                        ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                                      </p>
                                      {listing.status === 'kiralik' && (
                                        <span className="text-sm text-gray-500 font-medium">/ay</span>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Link>
                            </div>
                          );
                        })}
                      </div>

                      {/* Minimal Carousel Controls */}
                      {displayListings.length > 1 && (
                        <>
                          <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/80 hover:border-blue-600 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20 group"
                            aria-label="Önceki ilan"
                            type="button"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                          </button>
                          <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/80 hover:border-blue-600 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20 group"
                            aria-label="Sonraki ilan"
                            type="button"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                          </button>

                          {/* Minimal Dots Indicator */}
                          <div 
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
                            role="tablist"
                            aria-label="Slider sayfa göstergeleri"
                          >
                            {displayListings.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => handleSlideClick(index)}
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                  index === currentSlide
                                    ? 'w-8 bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm'
                                    : 'w-1.5 bg-gray-300 hover:bg-gray-400 hover:w-2'
                                )}
                                aria-label={`Slide ${index + 1}`}
                                aria-selected={index === currentSlide ? "true" : "false"}
                                role="tab"
                                type="button"
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
