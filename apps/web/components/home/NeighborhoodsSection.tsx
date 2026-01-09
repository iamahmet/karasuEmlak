"use client";

import Link from "next/link";
import { MapPin, TrendingUp, Home, ExternalLink } from "lucide-react";
import { Button } from "@karasu/ui";
import { CardImage } from "@/components/images";
import { generateSlug } from '@/lib/utils';
import { generateNeighborhoodImageAlt } from '@/lib/seo/image-alt-generator';

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  description?: string;
  stats?: {
    avgPrice?: number;
    totalListings?: number;
    satilikCount?: number;
    kiralikCount?: number;
  };
  image?: string;
  highlight?: string; // e.g., "Deniz Manzarası", "Şehir Merkezi", "Popüler"
}

interface NeighborhoodsSectionProps {
  neighborhoods: Neighborhood[];
  basePath?: string;
}

export function NeighborhoodsSection({ neighborhoods, basePath = "" }: NeighborhoodsSectionProps) {
  if (neighborhoods.length === 0) {
    return null;
  }

  // Fallback image for neighborhoods
  const fallbackImageUrl = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80";

  return (
    <section className="py-16 lg:py-24 bg-gray-50 relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Popüler Bölgeler</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu'nun En Gözde Mahalleleri
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Denize sıfır lokasyonlardan şehir merkezine, her bütçeye uygun mahalle seçenekleri
            </p>
          </div>

          {/* Neighborhoods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {neighborhoods.map((neighborhood, index) => (
              <Link
                key={neighborhood.id}
                href={`${basePath}/mahalle/${neighborhood.slug || generateSlug(neighborhood.name)}`}
                className="group block"
                prefetch={false}
              >
                <article className="relative h-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                    {neighborhood.image ? (
                      <CardImage
                        publicId={neighborhood.image}
                        alt={generateNeighborhoodImageAlt(neighborhood.name, undefined, 'Karasu')}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        fallback={fallbackImageUrl}
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <CardImage
                          publicId={fallbackImageUrl}
                          alt={generateNeighborhoodImageAlt(neighborhood.name, undefined, 'Karasu')}
                          className="w-full h-full object-cover opacity-60"
                          fallback={fallbackImageUrl}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-blue-300 stroke-[1.5]" />
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Neighborhood Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                        {neighborhood.name}
                      </h3>
                    </div>

                    {/* Trending Badge (for first 2) */}
                    {index < 2 && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-lg flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 stroke-[2]" />
                          TREND
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Description */}
                    {neighborhood.description && (
                      <p className="text-[15px] text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {neighborhood.description}
                      </p>
                    )}

                    {/* Stats */}
                    {neighborhood.stats && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-[14px]">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Home className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                            İlan
                          </span>
                          <span className="font-bold text-gray-900">
                            {neighborhood.stats.totalListings || 0}
                            {neighborhood.stats.satilikCount !== undefined && neighborhood.stats.kiralikCount !== undefined && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({neighborhood.stats.satilikCount} {neighborhood.stats.kiralikCount})
                              </span>
                            )}
                          </span>
                        </div>
                        {neighborhood.stats.avgPrice && (
                          <div className="flex items-center justify-between text-[14px]">
                            <span className="text-gray-600 flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                              Ortalama
                            </span>
                            <span className="font-bold text-[#006AFF]">
                              ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 0 }).format(neighborhood.stats.avgPrice)}
                            </span>
                          </div>
                        )}
                        {neighborhood.highlight && (
                          <div className="pt-2 border-t border-gray-100">
                            <span className="text-[13px] text-gray-600 font-medium">{neighborhood.highlight}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-[15px] font-semibold text-[#006AFF] group-hover:text-[#0052CC] flex items-center gap-2 transition-colors duration-200">
                        Mahalle Detayları
                        <ExternalLink className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50 text-gray-700 hover:text-[#006AFF] px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/karasu`}>
                Tüm Mahalleleri Keşfet
                <MapPin className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
