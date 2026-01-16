"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@karasu/ui';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@karasu/ui';
import { GalleryImage, OptimizedImage, ThumbnailImage } from '@/components/images';
import { cn } from '@karasu/lib';
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';

interface ImageItem {
  public_id?: string;
  url?: string;
  alt?: string;
  order?: number;
}

interface ImageGalleryProps {
  images: ImageItem[];
  title: string;
  initialIndex?: number;
  className?: string;
  propertyType?: string;
  status?: 'satilik' | 'kiralik';
  neighborhood?: string;
}

export function ImageGallery({ 
  images, 
  title, 
  initialIndex = 0, 
  className,
  propertyType = 'daire',
  status = 'satilik',
  neighborhood,
}: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Get placeholder image URL
  const placeholderUrl = getPropertyPlaceholder(propertyType, status, neighborhood, 1200, 800);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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
    
    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle mouse drag for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) return; // Don't drag when zoomed
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || isZoomed) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Only handle horizontal drags
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && images.length > 1) {
        handlePrevious();
        setDragStart(null);
      } else if (deltaX < 0 && images.length > 1) {
        handleNext();
        setDragStart(null);
      }
    }
  };

  const onMouseUp = () => {
    setDragStart(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className={cn("relative h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200", className)}>
        <img
          src={placeholderUrl}
          alt={`${title} - Placeholder görsel`}
          className="w-full h-full object-cover opacity-80"
          loading="eager"
          onError={(e) => {
            // Fallback to gradient if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
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

  const mainImage = images[currentIndex];

  return (
    <>
      {/* Main Image Display with Gallery Layout */}
      <div className={cn("mb-4", className)}>
        {/* Gallery Grid Layout - Show all images in grid if multiple, or single large if one */}
        {images.length === 1 ? (
          // Single image - still show as gallery format
          <div className={cn("relative h-full min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden group cursor-pointer", className && "h-full")}>
            {mainImage.url ? (
              <img
                src={mainImage.url}
                alt={mainImage.alt || `${title} - Ana görsel`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => setIsOpen(true)}
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
            ) : mainImage.public_id ? (
              <div onClick={() => setIsOpen(true)} className="w-full h-full cursor-pointer">
                <GalleryImage
                  publicId={mainImage.public_id}
                  alt={mainImage.alt || `${title} - Ana görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  fallback={placeholderUrl}
                />
              </div>
            ) : (
              <img
                src={placeholderUrl}
                alt={`${title} - Placeholder görsel`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => setIsOpen(true)}
                loading="eager"
              />
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                  Görseli büyüt
                </div>
              </div>
            </div>
          </div>
        ) : images.length === 2 ? (
          // Two images - side by side
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsOpen(true);
                }}
                className={cn(
                  "relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group cursor-pointer",
                  currentIndex === index && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || `${title} - Görsel ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderUrl;
                    }}
                  />
                ) : image.public_id ? (
                  <GalleryImage
                    publicId={image.public_id}
                    alt={image.alt || `${title} - Görsel ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index === 0}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    fallback={placeholderUrl}
                  />
                ) : (
                  <img
                    src={placeholderUrl}
                    alt={`${title} - Placeholder görsel ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </div>
            ))}
          </div>
        ) : images.length === 3 ? (
          // Three images - one large, two small
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => {
                setCurrentIndex(0);
                setIsOpen(true);
              }}
              className={cn(
                "relative row-span-2 h-[500px] md:h-[600px] rounded-xl overflow-hidden group cursor-pointer",
                currentIndex === 0 && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {images[0].url ? (
                <img
                  src={images[0].url}
                  alt={images[0].alt || `${title} - Ana görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderUrl;
                  }}
                />
              ) : images[0].public_id ? (
                <GalleryImage
                  publicId={images[0].public_id}
                  alt={images[0].alt || `${title} - Ana görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  fallback={placeholderUrl}
                />
              ) : (
                <img
                  src={placeholderUrl}
                  alt={`${title} - Placeholder görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
              )}
              {currentIndex === 0 && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </div>
            {images.slice(1, 3).map((image, idx) => {
              const index = idx + 1;
              return (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsOpen(true);
                  }}
                  className={cn(
                    "relative h-[245px] md:h-[295px] rounded-xl overflow-hidden group cursor-pointer",
                    currentIndex === index && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt || `${title} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderUrl;
                      }}
                    />
                  ) : image.public_id ? (
                    <GalleryImage
                      publicId={image.public_id}
                      alt={image.alt || `${title} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      fallback={placeholderUrl}
                    />
                  ) : (
                    <img
                      src={placeholderUrl}
                      alt={`${title} - Placeholder görsel ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Four or more images - Masonry/Grid layout
          <div className="space-y-2">
            {/* Main large image */}
            <div className={cn("relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group cursor-pointer", className && "h-full")}>
              {mainImage.url ? (
                <img
                  src={mainImage.url}
                  alt={mainImage.alt || `${title} - Ana görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setIsOpen(true)}
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderUrl;
                  }}
                />
              ) : mainImage.public_id ? (
                <div onClick={() => setIsOpen(true)} className="w-full h-full cursor-pointer">
                  <GalleryImage
                    publicId={mainImage.public_id}
                    alt={mainImage.alt || `${title} - Ana görsel`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    fallback={placeholderUrl}
                  />
                </div>
              ) : (
                <img
                  src={placeholderUrl}
                  alt={`${title} - Placeholder görsel`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setIsOpen(true)}
                  loading="eager"
                />
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                    Tüm görselleri görüntüle ({images.length})
                  </div>
                </div>
              </div>

              {/* Image counter badge */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Thumbnail Gallery - Always show for 4+ images */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {images.slice(0, 8).map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    if (images.length > 1) {
                      setIsOpen(true);
                    }
                  }}
                  className={cn(
                    "relative h-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200",
                    currentIndex === index
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent hover:border-primary/50 hover:scale-105"
                  )}
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt || `${title} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderUrl;
                      }}
                    />
                  ) : image.public_id ? (
                    <ThumbnailImage
                      publicId={image.public_id}
                      alt={image.alt || `${title} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      fallback={placeholderUrl}
                    />
                  ) : (
                    <img
                      src={placeholderUrl}
                      alt={`${title} - Placeholder görsel ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                </button>
              ))}
              {images.length > 8 && (
                <button
                  onClick={() => {
                    setCurrentIndex(8);
                    setIsOpen(true);
                  }}
                  className="relative h-20 md:h-24 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center bg-muted group"
                >
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-semibold text-gray-600 group-hover:text-primary">
                      +{images.length - 8}
                    </div>
                    <div className="text-xs text-muted-foreground">Daha fazla</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
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
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <div
                className={cn(
                  "relative transition-transform duration-300 max-w-full max-h-full",
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in",
                  dragStart && !isZoomed && "cursor-grabbing"
                )}
              >
                {images[currentIndex].url ? (
                  <img
                    src={images[currentIndex].url}
                    alt={images[currentIndex].alt || `${title} - Görsel ${currentIndex + 1}`}
                    className={cn(
                      "max-w-full max-h-[90vh] object-contain",
                      isZoomed && "cursor-grab active:cursor-grabbing"
                    )}
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderUrl;
                    }}
                  />
                ) : images[currentIndex].public_id ? (
                  <OptimizedImage
                    publicId={images[currentIndex].public_id}
                    alt={images[currentIndex].alt || `${title} - Görsel ${currentIndex + 1}`}
                    width={1920}
                    height={1080}
                    className={cn(
                      "max-w-full max-h-[90vh] object-contain",
                      isZoomed && "cursor-grab active:cursor-grabbing"
                    )}
                    priority
                    quality={90}
                    objectFit="contain"
                    fallback={placeholderUrl}
                  />
                ) : (
                  <img
                    src={placeholderUrl}
                    alt={`${title} - Placeholder görsel ${currentIndex + 1}`}
                    className={cn(
                      "max-w-full max-h-[90vh] object-contain",
                      isZoomed && "cursor-grab active:cursor-grabbing"
                    )}
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
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto">
                <div className="flex gap-2 justify-center">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        currentIndex === index
                          ? "border-primary shadow-lg scale-110"
                          : "border-white/30 hover:border-white/60 hover:scale-105"
                      )}
                    >
                      {image.url ? (
                        <img
                          src={image.url}
                          alt={image.alt || `${title} - Görsel ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderUrl;
                          }}
                        />
                      ) : image.public_id ? (
                        <ThumbnailImage
                          publicId={image.public_id}
                          alt={image.alt || `${title} - Görsel ${index + 1}`}
                          className="w-full h-full object-cover"
                          sizes="96px"
                          fallback={placeholderUrl}
                        />
                      ) : (
                        <img
                          src={placeholderUrl}
                          alt={`${title} - Placeholder görsel ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {currentIndex === index && (
                        <div className="absolute inset-0 bg-primary/30" />
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

