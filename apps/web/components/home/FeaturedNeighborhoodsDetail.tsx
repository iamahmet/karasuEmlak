"use client";

import Link from "next/link";
import { MapPin, TrendingUp, Home, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { CardImage } from "@/components/images";
import { cn } from "@karasu/lib";
import { generateSlug } from '@/lib/utils';

interface NeighborhoodDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  stats: {
    totalListings: number;
    avgPrice: number;
    priceChange: number;
    population?: number;
  };
  highlights: string[];
}

interface FeaturedNeighborhoodsDetailProps {
  neighborhoods: NeighborhoodDetail[];
  basePath?: string;
}

export function FeaturedNeighborhoodsDetail({ neighborhoods, basePath = "" }: FeaturedNeighborhoodsDetailProps) {
  const mockNeighborhoods: NeighborhoodDetail[] = [
    {
      id: '1',
      name: 'Merkez Mahallesi',
      slug: 'merkez',
      description: 'Karasu\'nun kalbi. Alışveriş merkezleri, okullar ve sosyal tesislere yürüme mesafesinde. Hem yerli hem yabancı alıcılar için ideal.',
      stats: {
        totalListings: 45,
        avgPrice: 2500000,
        priceChange: 5.2,
        population: 8500,
      },
      highlights: ['Şehir Merkezi', 'Alışveriş İmkanları', 'Ulaşım Kolaylığı', 'Sosyal Tesisler'],
    },
    {
      id: '2',
      name: 'Sahil Mahallesi',
      slug: 'sahil',
      description: 'Denize sıfır konumlar. Yazlık ve sürekli yaşam için mükemmel. Yüksek kira getirisi ile yatırımcı favorisi.',
      stats: {
        totalListings: 38,
        avgPrice: 3200000,
        priceChange: 8.1,
        population: 4200,
      },
      highlights: ['Deniz Manzarası', 'Plaj Erişimi', 'Yüksek Getiri', 'Tatil Bölgesi'],
    },
  ];

  const displayNeighborhoods = neighborhoods.length > 0 ? neighborhoods : mockNeighborhoods;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
            <MapPin className="h-4 w-4 text-green-600 stroke-[2]" />
            <span className="text-[13px] font-bold text-green-700 uppercase tracking-wider">
              Mahalle Rehberi
            </span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-display font-bold mb-4 text-gray-900 leading-[1.1] tracking-[-0.025em]">
            Karasu'nun En İyi Mahalleleri
          </h2>
          <p className="text-[18px] lg:text-[20px] text-gray-600 leading-[1.6] tracking-[-0.014em]">
            Her mahalle farklı yaşam tarzı sunar. Size en uygun olanı birlikte bulalım
          </p>
        </div>

        {/* Neighborhoods Grid */}
        <div className="space-y-8">
          {displayNeighborhoods.map((neighborhood, index) => (
            <div
              key={neighborhood.id}
              className={cn(
                "grid md:grid-cols-2 gap-8 p-8 bg-white rounded-2xl",
                "border-2 border-gray-200",
                "transition-all duration-300",
                "hover:border-[#006AFF]/30 hover:shadow-xl",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                  {neighborhood.image ? (
                    <CardImage
                      publicId={neighborhood.image}
                      alt={neighborhood.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-blue-300 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Home className="h-4 w-4 text-blue-600 mb-1 stroke-[2]" />
                    <div className="text-[18px] font-display font-bold text-gray-900 leading-none">
                      {neighborhood.stats.totalListings}
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1">İlan</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mb-1 stroke-[2]" />
                    <div className="text-[18px] font-display font-bold text-gray-900 leading-none">
                      +{neighborhood.stats.priceChange}%
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1">Değer Artışı</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <h3 className="text-[28px] font-display font-bold text-gray-900 mb-3 tracking-[-0.022em]">
                  {neighborhood.name}
                </h3>

                <p className="text-[16px] text-gray-600 mb-6 leading-relaxed tracking-[-0.011em]">
                  {neighborhood.description}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {neighborhood.highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[14px] text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 bg-[#006AFF] rounded-full" />
                      <span className="font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Price Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] text-gray-600 mb-1 font-medium">Ortalama Fiyat</div>
                      <div className="text-[24px] font-display font-bold text-[#006AFF] leading-none">
                        ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(neighborhood.stats.avgPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[12px] font-bold">
                        <TrendingUp className="h-3 w-3 stroke-[2]" />
                        +{neighborhood.stats.priceChange}%
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Son 6 ay</div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  className="w-full bg-gradient-to-r from-[#006AFF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  asChild
                >
                  <Link href={`${basePath}/mahalle/${neighborhood.slug || generateSlug(neighborhood.name)}`}>
                    Mahalle Detaylarını İncele
                    <ArrowRight className="h-4 w-4 ml-2 stroke-[2]" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20"
            asChild
          >
            <Link href={`${basePath}/karasu`}>
              Tüm Mahalleleri Karşılaştır
              <MapPin className="h-5 w-5 ml-2 stroke-[2]" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

