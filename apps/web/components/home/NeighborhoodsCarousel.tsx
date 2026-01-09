"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Home, TrendingUp } from "lucide-react";
import { Button } from "@karasu/ui";
import { CardImage } from "@/components/images";
import { cn } from "@karasu/lib";
import { generateSlug } from '@/lib/utils';

interface NeighborhoodCarouselProps {
  neighborhoods: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    stats?: {
      totalListings?: number;
      avgPrice?: number;
    };
  }>;
  basePath?: string;
}

export function NeighborhoodsCarousel({ neighborhoods, basePath = "" }: NeighborhoodCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || neighborhoods.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % neighborhoods.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, neighborhoods.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + neighborhoods.length) % neighborhoods.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % neighborhoods.length);
    setIsAutoPlaying(false);
  };

  if (neighborhoods.length === 0) return null;

  const currentNeighborhood = neighborhoods[currentIndex];

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-[28px] lg:text-[36px] font-display font-bold text-gray-900 mb-3 leading-[1.1] tracking-[-0.025em]">
              Mahalle Rehberi
            </h2>
            <p className="text-[17px] text-gray-600 tracking-[-0.014em]">
              Karasu'nun en popüler mahallelerini keşfedin
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200">
                  {currentNeighborhood.image ? (
                    <CardImage
                      publicId={currentNeighborhood.image}
                      alt={`${currentNeighborhood.name} Mahallesi`}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-24 w-24 text-blue-300 stroke-[1.5]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Navigation Buttons */}
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
                    aria-label="Önceki mahalle"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700 stroke-[2]" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
                    aria-label="Sonraki mahalle"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700 stroke-[2]" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4 w-fit">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 stroke-[2]" />
                    <span className="text-[12px] font-bold text-blue-700 uppercase tracking-wider">
                      Mahalle
                    </span>
                  </div>

                  <h3 className="text-[32px] font-display font-bold text-gray-900 mb-4 tracking-[-0.025em]">
                    {currentNeighborhood.name}
                  </h3>

                  {currentNeighborhood.description && (
                    <p className="text-[16px] text-gray-600 mb-6 leading-relaxed tracking-[-0.011em]">
                      {currentNeighborhood.description}
                    </p>
                  )}

                  {/* Stats */}
                  {currentNeighborhood.stats && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {currentNeighborhood.stats.totalListings && (
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <Home className="h-5 w-5 text-blue-600 mb-2 stroke-[2]" />
                          <div className="text-[24px] font-display font-bold text-gray-900 leading-none tracking-tight">
                            {currentNeighborhood.stats.totalListings}
                          </div>
                          <div className="text-[13px] text-gray-600 mt-1 tracking-[-0.01em]">
                            Aktif İlan
                          </div>
                        </div>
                      )}
                      {currentNeighborhood.stats.avgPrice && (
                        <div className="p-4 bg-green-50 rounded-xl">
                          <TrendingUp className="h-5 w-5 text-green-600 mb-2 stroke-[2]" />
                          <div className="text-[24px] font-display font-bold text-gray-900 leading-none tracking-tight">
                            ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(currentNeighborhood.stats.avgPrice)}
                          </div>
                          <div className="text-[13px] text-gray-600 mt-1 tracking-[-0.01em]">
                            Ort. Fiyat
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-[#006AFF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                    asChild
                  >
                    <Link href={`${basePath}/mahalle/${currentNeighborhood.slug || generateSlug(currentNeighborhood.name)}`}>
                      Mahalle Detaylarını İncele
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {neighborhoods.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-[#006AFF]"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`${neighborhoods[index].name} mahallesine git`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

