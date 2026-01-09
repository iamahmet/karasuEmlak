"use client";

import Link from "next/link";
import { MapPin, Waves, Building2, TreePine, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { generateSlug } from '@/lib/utils';

interface LocalAreaGuideSectionProps {
  basePath?: string;
}

export function LocalAreaGuideSection({ basePath = "" }: LocalAreaGuideSectionProps) {
  const areas = [
    {
      icon: Waves,
      name: "Sahil Bölgesi",
      description: "Denize sıfır konumlar, yazlık ve villa seçenekleri",
      highlights: ["Deniz manzarası", "Yazlık kiralama", "Yatırım potansiyeli"],
      listings: "120+",
      avgPrice: "₺850K",
      href: `${basePath}/mahalle/${generateSlug('Sahil')}`,
    },
    {
      icon: Building2,
      name: "Merkez",
      description: "Şehir merkezi, alışveriş ve ulaşım kolaylığı",
      highlights: ["Merkez konum", "Yıl boyu kira", "Kolay erişim"],
      listings: "200+",
      avgPrice: "₺450K",
      href: `${basePath}/mahalle/${generateSlug('Merkez')}`,
    },
    {
      icon: TreePine,
      name: "Çamlık",
      description: "Doğa içinde sakin yaşam, yazlık ve villa seçenekleri",
      highlights: ["Doğa içinde", "Sakin yaşam", "Yazlık"],
      listings: "80+",
      avgPrice: "₺680K",
      href: `${basePath}/mahalle/${generateSlug('Çamlık')}`,
    },
    {
      icon: MapPin,
      name: "Liman",
      description: "Liman yakını, ticari ve konut seçenekleri",
      highlights: ["Liman yakını", "Ticari potansiyel", "Ulaşım"],
      listings: "60+",
      avgPrice: "₺420K",
      href: `${basePath}/mahalle/${generateSlug('Liman')}`,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50 relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Bölge Rehberi</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu'nun Popüler Bölgeleri
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Her bölgenin kendine özgü özellikleri ve avantajları. Size en uygun bölgeyi keşfedin.
            </p>
          </div>

          {/* Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {areas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Link
                  key={index}
                  href={area.href}
                  className="group block"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Icon */}
                    <div className="mb-5">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                        <Icon className="h-7 w-7 text-[#006AFF] stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                      {area.name}
                    </h3>
                    <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                      {area.description}
                    </p>

                    {/* Stats */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Aktif İlan</span>
                        <span className="text-sm font-bold text-gray-900">{area.listings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Ort. Fiyat</span>
                        <span className="text-sm font-bold text-[#006AFF]">{area.avgPrice}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5 mb-4">
                      {area.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#006AFF]"></div>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                        Bölgeyi Keşfet
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50 text-gray-700 hover:text-[#006AFF] px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/karasu`}>
                Tüm Bölgeleri Keşfet
                <MapPin className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

