"use client";

import Link from "next/link";
import { MapPin, TrendingUp, Home, ExternalLink, ArrowRight } from "lucide-react";
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
    <section className="py-24 lg:py-40 bg-gray-50/50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-100/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100/50 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">BÖLGE REHBERİ</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                Karasu'nun En <span className="text-blue-600">Popüler</span> Lokasyonları
              </h2>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                Deniz kenarından merkez mahallelerine kadar Karasu'nun her bir köşesini keşfedin ve size en uygun yaşam alanını bulun.
              </p>
            </div>

            <Link
              href={`${basePath}/karasu`}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm font-bold text-gray-900"
            >
              TÜM BÖLGELERİ GÖR
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Neighborhoods Grid - Visual Heavy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {neighborhoods.map((neighborhood, index) => (
              <Link
                key={neighborhood.id}
                href={`${basePath}/mahalle/${neighborhood.slug || generateSlug(neighborhood.name)}`}
                className="group relative"
                prefetch={false}
              >
                <article className="relative h-[480px] bg-white rounded-[40px] overflow-hidden border border-gray-100 hover:shadow-[0_40px_100px_rgba(0,106,255,0.12)] transition-all duration-700 hover:-translate-y-2">
                  {/* Image with Parallax-like effect */}
                  <div className="absolute inset-0">
                    {neighborhood.image ? (
                      <CardImage
                        publicId={neighborhood.image}
                        alt={generateNeighborhoodImageAlt(neighborhood.name, undefined, 'Karasu')}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        fallback={fallbackImageUrl}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <MapPin className="h-20 w-20 text-gray-300 stroke-[1]" />
                      </div>
                    )}
                    {/* Dark Overlay for content readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col">
                    {/* Top Badges */}
                    <div className="flex justify-between items-start">
                      {index < 2 && (
                        <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                          TREND BÖLGE
                        </div>
                      )}
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
                          {neighborhood.name}
                        </h3>
                        {neighborhood.description && (
                          <p className="text-sm font-bold text-white/70 line-clamp-2 leading-relaxed tracking-tight group-hover:text-white transition-colors">
                            {neighborhood.description}
                          </p>
                        )}
                      </div>

                      {/* Integrated Stats */}
                      {neighborhood.stats && (
                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">AKTİF İLAN</span>
                            <span className="text-lg font-black text-white">{neighborhood.stats.totalListings || 0}</span>
                          </div>
                          {neighborhood.stats.avgPrice && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">ORT. FİYAT</span>
                              <span className="text-lg font-black text-blue-400">
                                ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(neighborhood.stats.avgPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
