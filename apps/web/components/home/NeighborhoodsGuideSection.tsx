"use client";

import Link from "next/link";
import { MapPin, Home, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";

interface NeighborhoodsGuideSectionProps {
  basePath?: string;
}

export function NeighborhoodsGuideSection({ basePath = "" }: NeighborhoodsGuideSectionProps) {
  const neighborhoods = [
    {
      name: "Merkez Mahallesi",
      description: "İlçenin en merkezi ve canlı bölgesi. Tüm ihtiyaçlara yakın konumu ile ideal bir yaşam alanı sunar.",
      href: `${basePath}/mahalle/merkez`,
      stats: { listings: "150+", avgPrice: "₺450.000" },
    },
    {
      name: "Sahil Mahallesi",
      description: "Denize sıfır konumu ile yazlık ve kalıcı yaşam için ideal bir bölgedir.",
      href: `${basePath}/mahalle/sahil`,
      stats: { listings: "80+", avgPrice: "₺680.000" },
    },
    {
      name: "Yalı Mahallesi",
      description: "Denize yakın konumu ve sakin atmosferi ile tercih edilen bir bölgedir.",
      href: `${basePath}/mahalle/yali`,
      stats: { listings: "60+", avgPrice: "₺550.000" },
    },
    {
      name: "Aziziye Mahallesi",
      description: "Merkeze yakın konumu ve sakin yapısı ile dikkat çeker. Aileler için ideal bir yaşam alanı sunar.",
      href: `${basePath}/mahalle/aziziye`,
      stats: { listings: "45+", avgPrice: "₺420.000" },
    },
    {
      name: "Cumhuriyet Mahallesi",
      description: "Geniş caddeleri ve modern yapıları ile öne çıkar. Şehir merkezine yakın konumu ile tercih edilen bir bölgedir.",
      href: `${basePath}/mahalle/cumhuriyet`,
      stats: { listings: "70+", avgPrice: "₺480.000" },
    },
    {
      name: "Atatürk Mahallesi",
      description: "Tarihi dokusu ve merkezi konumu ile dikkat çeker. Tüm hizmetlere yakın konumu ile ideal bir yaşam alanı sunar.",
      href: `${basePath}/mahalle/ataturk`,
      stats: { listings: "55+", avgPrice: "₺440.000" },
    },
    {
      name: "Bota Mahallesi",
      description: "Denize yakın konumu ve doğal güzellikleri ile öne çıkar. Yazlık ve kalıcı yaşam için ideal bir bölgedir.",
      href: `${basePath}/mahalle/bota`,
      stats: { listings: "40+", avgPrice: "₺600.000" },
    },
    {
      name: "Liman Mahallesi",
      description: "Liman bölgesine yakın konumu ile ticari faaliyetler için idealdir. Denize yakın konumu ile de dikkat çeker.",
      href: `${basePath}/mahalle/liman`,
      stats: { listings: "35+", avgPrice: "₺520.000" },
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu Mahalleleri ve Emlak Piyasası
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'nun her mahallesi, kendine özgü emlak karakteristikleri ve yatırım potansiyeli sunmaktadır. İşte Karasu'da emlak arayanlar için öne çıkan mahalleler:
            </p>
          </div>

          {/* Neighborhoods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {neighborhoods.map((neighborhood, index) => (
              <Link
                key={index}
                href={neighborhood.href}
                className="group block"
              >
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 mb-3">
                      <MapPin className="h-6 w-6 text-blue-600 stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                    {neighborhood.name} Emlak
                  </h3>
                  <p className="text-[15px] text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {neighborhood.description}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Aktif İlan</span>
                      <span className="text-sm font-bold text-gray-900">{neighborhood.stats.listings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Ort. Fiyat</span>
                      <span className="text-sm font-bold text-[#006AFF]">{neighborhood.stats.avgPrice}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200 inline-flex items-center gap-2">
                        Satılık İlanlar
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                      <span className="text-[14px] font-semibold text-[#00A862] group-hover:gap-3 transition-all duration-200 inline-flex items-center gap-2">
                        Kiralık İlanlar
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50 text-gray-700 hover:text-[#006AFF] px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href={`${basePath}/karasu-mahalleler`}>
                Tüm Mahalleleri Görüntüle
                <ArrowRight className="h-5 w-5 ml-2 stroke-[1.5]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
