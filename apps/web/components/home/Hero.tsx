"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, Sparkles, ArrowRight, MapPin, Square, ChevronLeft, ChevronRight, Clock, Search as SearchIcon, SlidersHorizontal, User, Heart, BookOpen } from "lucide-react";
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

  // Removed URL sync for currentSlide to prevent infinite update loops in Next.js App Router

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
      setCurrentSlide((prev) => (prev + 1) % displayListings.length);
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


  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    if (!reduceMotion && isTabVisible && isInView && !isHovered && displayListings.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayListings.length);
        setProgress(0);
      }, 5000);
    }
  }, [reduceMotion, isTabVisible, isInView, isHovered, displayListings.length]);

  const handlePrev = useCallback(() => {
    const prev = currentSlide === 0 ? displayListings.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    setProgress(0);
    resetAutoPlay();
    trackHomepageEvent.carouselInteraction('prev');
  }, [currentSlide, displayListings.length, resetAutoPlay]);

  const handleNext = useCallback(() => {
    const next = (currentSlide + 1) % displayListings.length;
    setCurrentSlide(next);
    setProgress(0);
    resetAutoPlay();
    trackHomepageEvent.carouselInteraction('next');
  }, [currentSlide, displayListings.length, resetAutoPlay]);

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
      className="relative bg-white overflow-hidden"
      aria-label="Ana hero bölümü"
    >
      {/* Immersive Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Animated Mesh-style Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(0,106,255,0.08)_0,transparent_70%)] rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(0,168,98,0.05)_0,transparent_70%)] rounded-full blur-[100px] animate-pulse duration-[15s]"></div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-12 sm:py-20 lg:py-28">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN: Hero Content (6 cols) */}
            <div className="lg:col-span-6 space-y-10 lg:pr-4">

              <div className="space-y-6">
                {/* Modern Floating Badge */}
                <div className={cn(
                  "inline-flex items-center gap-2.5 px-4 py-2 bg-white/40 dark:bg-white/5 border border-blue-100/30 rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,106,255,0.05)] transition-all duration-1000 ease-out",
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                )}>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                        <User className="h-2.5 w-2.5 text-blue-600" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[13px] font-bold text-blue-600/90 tracking-tight">
                    <span className="text-blue-700">{activeViewers}+</span> Karasu'da Ev Arıyor
                  </span>
                </div>

                {/* Typography with variable weights and tracking */}
                <div className={cn(
                  "space-y-6 transition-all duration-1000 ease-out delay-100",
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                  <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-bold text-gray-900 leading-[1.05] tracking-[-0.04em]">
                    Karasu'da
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                      Yaşamı Keşfet
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-gray-500 font-medium leading-relaxed max-w-xl tracking-tight">
                    Türkiye'nin parlayan yıldızı Karasu'da hayalinizdeki portföyü <span className="text-gray-900 border-b-2 border-blue-600/20">en güncel</span> ilanlarla hemen bulun.
                  </p>
                </div>
              </div>

              {/* Integrated Search Widget */}
              <div className={cn(
                "max-w-2xl transition-all duration-1000 ease-out delay-300",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] md:rounded-full p-1.5 shadow-[0_32px_64px_-16px_rgba(0,106,255,0.12)]">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center">

                    {/* Status Toggle - Compact Pill */}
                    <div className="flex p-1 bg-gray-100/50 rounded-[24px] md:rounded-full md:w-36 flex-shrink-0">
                      {['satilik', 'kiralik'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setSearchStatus(status as any)}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-[20px] md:rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                            searchStatus === status
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-800"
                          )}
                        >
                          {status === 'satilik' ? 'Satılık' : 'Kiralık'}
                        </button>
                      ))}
                    </div>

                    {/* Vertical Divider - Desktop Only */}
                    <div className="hidden md:block w-px h-8 bg-gray-100 mx-1"></div>

                    {/* Location Input Group - Minimalist */}
                    <div className="flex-1 px-4 relative">
                      <NeighborhoodAutocomplete
                        value={searchLocation}
                        onChange={setSearchLocation}
                        neighborhoods={neighborhoods}
                        hideSuggestions={true}
                        className="bg-transparent"
                        inputClassName="border-none focus:ring-0 py-2 bg-transparent"
                      />
                    </div>

                    {/* Search Button - Integrated */}
                    <button
                      onClick={handleSearch}
                      className="group bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] md:rounded-full px-6 py-3.5 md:py-3 md:min-w-[160px] flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                    >
                      <span className="font-bold text-sm tracking-tight">Fırsatları Gör</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Advanced Links */}
                <div className="flex items-center gap-6 mt-6 px-4">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-2 transition-all"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    DETAYLI ARAMA
                  </button>
                  <Link href={`${basePath}/blog`} className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-2 transition-all">
                    <BookOpen className="h-3.5 w-3.5" />
                    YATIRIM REHBERİ
                  </Link>
                </div>
              </div>

              {/* Statistics Strip */}
              <div className={cn(
                "flex items-center gap-8 py-4 transition-all duration-1000 ease-out delay-500",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Showcase (6 cols) */}
            <div className={cn(
              "lg:col-span-6 relative transition-all duration-1000 ease-out delay-200",
              isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            )}>
              {/* Glass Card for Showcase */}
              <div
                className="relative group perspective-1000"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Background Shadow Glow */}
                <div className="absolute inset-x-10 -bottom-10 h-20 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

                {/* Main Showcase Container */}
                <div className="relative bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100/10 shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden">
                  {/* Current Active Listing Info Overlay */}
                  <div className="absolute top-8 left-8 right-8 z-30 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-2">
                      <div className="px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700">Yeni İlan</span>
                      </div>
                    </div>

                    <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg pointer-events-auto hover:bg-white transition-all hover:scale-110 active:scale-90">
                      <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Carousel Content */}
                  <div
                    ref={sliderRef}
                    className="flex transition-transform duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {displayListings.map((listing, index) => (
                      <div key={listing.id} className="w-full flex-shrink-0 relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[5/6]">
                        {/* Image Layer */}
                        <div className="absolute inset-0">
                          <img
                            src={listing.images?.[0]?.url || getOptimizedCloudinaryUrl(listing.images?.[0]?.public_id!, { width: 1000, height: 1200 }) || getPropertyPlaceholder(listing.property_type, listing.status)}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          {/* Rich Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/10 to-transparent"></div>
                        </div>

                        {/* Text Reveal Layer */}
                        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 pointer-events-none">
                          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                              {formatLocation(listing.location_neighborhood, listing.location_district)}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                              {listing.title}
                            </h2>
                            <div className="flex items-center gap-6">
                              <div className="flex items-baseline gap-1 text-white">
                                <span className="text-xl sm:text-2xl font-bold">₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}</span>
                                <span className="text-xs font-medium text-white/60">
                                  {listing.status === 'kiralik' ? '/ay' : ''}
                                </span>
                              </div>
                              <Link
                                href={`${basePath}/ilan/${listing.slug}`}
                                className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-white/10 transition-all hover:px-8"
                              >
                                İncele
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progressive Controls */}
                  <div className="absolute bottom-10 left-10 flex items-center gap-4 z-40">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Index Indicator */}
                    <div className="text-white/40 text-[10px] font-bold tracking-[0.3em] ml-2">
                      <span className="text-white">{String(currentSlide + 1).padStart(2, '0')}</span> / {String(displayListings.length).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Status Bar for Slider */}
                {!reduceMotion && displayListings.length > 1 && (
                  <div className="mt-8 flex justify-center gap-3">
                    {displayListings.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleSlideClick(i)}
                        className="relative h-1 bg-gray-100 rounded-full overflow-hidden transition-all duration-500"
                        style={{ width: currentSlide === i ? '40px' : '12px' }}
                      >
                        {currentSlide === i && (
                          <div
                            className="absolute inset-0 bg-blue-600 transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              transition: isHovered ? 'none' : 'width 0.1s linear'
                            }}
                          ></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
