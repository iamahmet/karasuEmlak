"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@karasu/ui';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, Pause, MapPin, Shield, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@karasu/ui';
import { GalleryImage, OptimizedImage, ThumbnailImage } from '@/components/images';
import { cn } from '@karasu/lib';
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import ShareButtons from '@/components/share/ShareButtons';

interface ImageItem {
  public_id?: string;
  url?: string;
  alt?: string;
  order?: number;
}

interface HeroOverlayData {
  title: string;
  location: {
    neighborhood: string;
    district: string;
    city: string;
  };
  price: number;
  status: 'satilik' | 'kiralik';
  featured?: boolean;
  verified?: boolean;
  hasDocuments?: boolean;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
}

interface ListingImageSliderProps {
  images: ImageItem[];
  title: string;
  initialIndex?: number;
  className?: string;
  propertyType?: string;
  status?: 'satilik' | 'kiralik';
  neighborhood?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  heroOverlay?: HeroOverlayData;
}

export function ListingImageSlider({ 
  images, 
  title, 
  initialIndex = 0, 
  className,
  propertyType = 'daire',
  status = 'satilik',
  neighborhood,
  autoPlay = false,
  autoPlayInterval = 5000,
  heroOverlay,
}: ListingImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine overlay mode: full on first image, compact otherwise
  const showFullOverlay = heroOverlay && currentIndex === 0 && !isOpen;
  const showCompactOverlay = heroOverlay && (currentIndex !== 0 || isOpen);
  
  // Get placeholder image URL
  const placeholderUrl = getPropertyPlaceholder(propertyType, status, neighborhood, 1200, 800);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1 || isOpen) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, images.length, isOpen, autoPlayInterval]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setIsZoomed(true);
      } else if (e.key === '-') {
        e.preventDefault();
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  // Handle touch/swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPlaying(false); // Pause auto-play on touch
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle mouse drag for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) return;
    setTouchStart(e.clientX);
    setIsPlaying(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!touchStart || isZoomed) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const handleThumbnailClick = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className={cn("relative w-full h-[55vh] min-h-[500px] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200", className)}>
        <img
          src={placeholderUrl}
          alt={`${title} - Placeholder görsel`}
          className="w-full h-full object-cover opacity-80"
          loading="eager"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="text-center p-6">
            <p className="text-slate-600 font-medium mb-2">Görsel yükleniyor...</p>
            <p className="text-slate-500 text-sm">{title}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Main Slider Container */}
      <div className={cn("relative w-full", className)}>
        {/* Full-Width Main Image Slider */}
        <div 
          ref={sliderRef}
          className="relative w-full h-[50vh] sm:h-[55vh] min-h-[350px] sm:min-h-[450px] md:min-h-[500px] max-h-[600px] md:max-h-[700px] rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Main Image - Clickable Area */}
          <button
            type="button"
            className="relative w-full h-full cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl"
            onClick={() => setIsOpen(true)}
            aria-label="Görseli büyüt - Lightbox'ı aç"
          >
            {currentImage.url ? (
              <img
                src={currentImage.url}
                alt={currentImage.alt || `${title} - Görsel ${currentIndex + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  isTransitioning && "opacity-70"
                )}
                loading={currentIndex === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
            ) : currentImage.public_id ? (
              <GalleryImage
                publicId={currentImage.public_id}
                alt={currentImage.alt || `${title} - Görsel ${currentIndex + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  isTransitioning && "opacity-70"
                )}
                priority={currentIndex === 0}
                sizes="(max-width: 1024px) 100vw, 66vw"
                fallback={placeholderUrl}
              />
            ) : (
              <img
                src={placeholderUrl}
                alt={`${title} - Placeholder görsel ${currentIndex + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  isTransitioning && "opacity-70"
                )}
                loading={currentIndex === 0 ? "eager" : "lazy"}
              />
            )}

            {/* Overlay Gradient - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Click Hint Overlay - Hidden on mobile, shown on desktop hover */}
            <div className="absolute inset-0 items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
              <div className="bg-black/70 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xl">
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Tıklayarak büyüt ({images.length} görsel)</span>
              </div>
            </div>

            {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-900 p-2 sm:p-2.5 md:p-3 rounded-full shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110 active:scale-95 touch-manipulation"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-900 p-2 sm:p-2.5 md:p-3 rounded-full shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20 hover:scale-110 active:scale-95 touch-manipulation"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/80 text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold backdrop-blur-sm z-20 shadow-lg">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Auto-play Toggle */}
            {autoPlay && images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="absolute bottom-4 left-4 bg-black/80 hover:bg-black/90 text-white p-2.5 rounded-lg backdrop-blur-sm z-30 transition-colors shadow-lg"
                aria-label={isPlaying ? "Duraklat" : "Oynat"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            )}

            {/* Hero Overlay - Full Mode (First Image Only) */}
            {showFullOverlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30 flex flex-col justify-end p-3 sm:p-4 md:p-6 pointer-events-none transition-opacity duration-500">
                {/* Top Badges */}
                <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 flex items-start justify-between z-40 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={cn(
                      "px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm",
                      heroOverlay.status === 'satilik' 
                        ? 'bg-[#006AFF] text-white' 
                        : 'bg-[#00A862] text-white'
                    )}>
                      {heroOverlay.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                    </span>
                    {heroOverlay.featured && (
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                        <span className="hidden sm:inline">Öne Çıkan</span>
                        <span className="sm:hidden">Öne Çıkan</span>
                      </span>
                    )}
                    {heroOverlay.verified && (
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold bg-green-500/90 backdrop-blur-sm text-white shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">Doğrulanmış</span>
                      </span>
                    )}
                  </div>

                  {/* Share Buttons - Hidden on mobile */}
                  <div className="hidden md:block pointer-events-auto">
                    <ShareButtons
                      url={heroOverlay.shareUrl}
                      title={heroOverlay.shareTitle}
                      description={heroOverlay.shareDescription}
                    />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-40 pointer-events-auto">
                  {/* Title & Location */}
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-display font-extrabold text-white mb-1.5 sm:mb-2 leading-tight drop-shadow-lg line-clamp-2">
                    {heroOverlay.title}
                  </h1>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 mb-3 sm:mb-4">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base font-medium line-clamp-1">
                      {heroOverlay.location.neighborhood}, {heroOverlay.location.district}
                    </span>
                  </div>

                  {/* Price & Trust Signals */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/20">
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg">
                        ₺{new Intl.NumberFormat('tr-TR').format(heroOverlay.price)}
                        {heroOverlay.status === 'kiralik' && (
                          <span className="text-base sm:text-lg md:text-xl text-white/80 font-medium">/ay</span>
                        )}
                      </div>
                      {heroOverlay.status === 'satilik' && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium">
                          Tahmini aylık ödeme: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(heroOverlay.price * 0.006))}/ay
                        </p>
                      )}
                    </div>

                    {/* Trust Signals - Hidden on very small screens */}
                    {heroOverlay.hasDocuments && (
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="flex flex-col items-center gap-0.5 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          <span className="text-[9px] sm:text-[10px] font-semibold text-white">Tapu</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          <span className="text-[9px] sm:text-[10px] font-semibold text-white">İskan</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hero Overlay - Compact Mode (Other Images or Lightbox) */}
            {showCompactOverlay && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/70 to-transparent z-30 p-2 sm:p-3 md:p-4 lg:p-6 pointer-events-none transition-opacity duration-500">
                <div className="flex items-center justify-between gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  {/* Left: Badges & Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1 sm:mb-2">
                      <span className={cn(
                        "px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold shadow-lg backdrop-blur-sm flex-shrink-0",
                        heroOverlay.status === 'satilik' 
                          ? 'bg-[#006AFF] text-white' 
                          : 'bg-[#00A862] text-white'
                      )}>
                        {heroOverlay.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                      </span>
                      {heroOverlay.featured && (
                        <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 fill-current" />
                          <span className="hidden sm:inline">Öne Çıkan</span>
                        </span>
                      )}
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-display font-extrabold text-white truncate drop-shadow-lg flex-1 min-w-0">
                        {heroOverlay.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium truncate flex-1 min-w-0">
                        {heroOverlay.location.neighborhood}, {heroOverlay.location.district}
                      </span>
                      <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white ml-1 sm:ml-2 flex-shrink-0 whitespace-nowrap">
                        ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 0 }).format(heroOverlay.price)}
                        {heroOverlay.status === 'kiralik' && (
                          <span className="text-xs sm:text-sm text-white/80 font-medium">/ay</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Share Buttons - Hidden on mobile */}
                  <div className="hidden md:block ml-2 lg:ml-4 pointer-events-auto">
                    <ShareButtons
                      url={heroOverlay.shareUrl}
                      title={heroOverlay.shareTitle}
                      description={heroOverlay.shareDescription}
                    />
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Thumbnail Strip - Professional & Mobile Optimized */}
        {images.length > 1 && (
          <div className="mt-3 sm:mt-4">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-slate-100 hover:scrollbar-thumb-primary/50 scrollbar-thumb-rounded-full snap-x snap-mandatory">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-3 transition-all duration-300 group cursor-pointer snap-start touch-manipulation",
                    currentIndex === index
                      ? "border-primary shadow-lg scale-105 ring-2 sm:ring-4 ring-primary/30"
                      : "border-slate-200 active:border-primary/60 active:scale-105 active:shadow-md"
                  )}
                  aria-label={`Görsel ${index + 1}'e git`}
                  aria-current={currentIndex === index ? "true" : "false"}
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderUrl;
                      }}
                    />
                  ) : image.public_id ? (
                    <ThumbnailImage
                      publicId={image.public_id}
                      alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 1024px) 112px, 112px"
                      fallback={placeholderUrl}
                    />
                  ) : (
                    <img
                      src={placeholderUrl}
                      alt={`${title} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  {/* Active indicator */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-primary/30 border-3 border-primary ring-4 ring-primary/20" />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* Number badge */}
                  <div className={cn(
                    "absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center transition-all duration-300",
                    currentIndex === index
                      ? "bg-primary text-white shadow-lg"
                      : "bg-black/60 text-white group-active:bg-primary"
                  )}>
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-white/70">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-white hover:bg-white/20"
                  aria-label={isZoomed ? "Uzaklaştır" : "Yakınlaştır"}
                >
                  {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Main Image */}
            <div 
              className="flex-1 flex items-center justify-center overflow-hidden relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className={cn(
                  "relative transition-transform duration-300 max-w-full max-h-full",
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                )}
              >
                {currentImage.url ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || `${title} - Görsel ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderUrl;
                    }}
                  />
                ) : currentImage.public_id ? (
                  <OptimizedImage
                    publicId={currentImage.public_id}
                    alt={currentImage.alt || `${title} - Görsel ${currentIndex + 1}`}
                    width={1920}
                    height={1080}
                    className="max-w-full max-h-[90vh] object-contain"
                    priority
                    quality={90}
                    objectFit="contain"
                    fallback={placeholderUrl}
                  />
                ) : (
                  <img
                    src={placeholderUrl}
                    alt={`${title} - Placeholder görsel ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                    loading="eager"
                  />
                )}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 z-40"
                    aria-label="Önceki görsel"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 z-40"
                    aria-label="Sonraki görsel"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-2 overflow-x-auto justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        currentIndex === index
                          ? "border-white shadow-lg scale-110"
                          : "border-white/30 hover:border-white/60 hover:scale-105"
                      )}
                      aria-label={`Görsel ${index + 1}'e git`}
                    >
                      {image.url ? (
                        <img
                          src={image.url}
                          alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : image.public_id ? (
                        <ThumbnailImage
                          publicId={image.public_id}
                          alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          sizes="64px"
                          fallback={placeholderUrl}
                        />
                      ) : (
                        <img
                          src={placeholderUrl}
                          alt={`${title} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {currentIndex === index && (
                        <div className="absolute inset-0 bg-white/20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
