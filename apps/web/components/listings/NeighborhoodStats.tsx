"use client";

import { TrendingUp, Home, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { generateSlug } from '@/lib/utils';

interface NeighborhoodStatsProps {
  neighborhood: string;
  basePath?: string;
  className?: string;
}

export function NeighborhoodStats({ neighborhood, basePath = "", className }: NeighborhoodStatsProps) {
  const getStats = (hood: string) => {
    if (hood === 'Sahil') {
      return {
        activeListings: 45,
        avgPrice: 3200000,
        priceChange: 8.5,
        avgSaleDuration: 42,
        description: 'Karasu\'nun en popüler bölgesi. Denize yakın konumu ve yüksek yatırım değeri ile öne çıkar.',
      };
    } else if (hood === 'Merkez') {
      return {
        activeListings: 38,
        avgPrice: 2400000,
        priceChange: 7.2,
        avgSaleDuration: 35,
        description: 'Merkezi konum avantajı. Tüm ihtiyaçlara yakın, ulaşım kolay.',
      };
    } else if (hood === 'Çamlık') {
      return {
        activeListings: 22,
        avgPrice: 2100000,
        priceChange: 9.5,
        avgSaleDuration: 48,
        description: 'Gelişen bölge. Doğa içinde sakin yaşam, yüksek değer artış potansiyeli.',
      };
    } else if (hood === 'Liman') {
      return {
        activeListings: 15,
        avgPrice: 2600000,
        priceChange: 8.0,
        avgSaleDuration: 45,
        description: 'Özgün karakter. Liman manzarası ve balıkçı mahallesi atmosferi.',
      };
    }

    return {
      activeListings: 30,
      avgPrice: 2500000,
      priceChange: 7.5,
      avgSaleDuration: 40,
      description: 'Karasu\'nun gözde bölgelerinden biri.',
    };
  };

  const stats = getStats(neighborhood);

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{neighborhood} Mahallesi İstatistikleri</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{stats.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-blue-600" />
            <div className="text-xs text-blue-700 font-semibold">Aktif İlan</div>
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{stats.activeListings}</div>
        </div>

        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div className="text-xs text-green-700 font-semibold">Değer Artışı</div>
          </div>
          <div className="text-2xl font-extrabold text-green-900">%{stats.priceChange}</div>
          <div className="text-xs text-green-700">Yıllık</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <div className="text-xs text-purple-700 font-semibold">Ort. Fiyat</div>
          </div>
          <div className="text-lg font-extrabold text-purple-900">
            ₺{(stats.avgPrice / 1000000).toFixed(1)}M
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-orange-600" />
            <div className="text-xs text-orange-700 font-semibold">Ort. Satış</div>
          </div>
          <div className="text-2xl font-extrabold text-orange-900">{stats.avgSaleDuration}</div>
          <div className="text-xs text-orange-700">Gün</div>
        </div>
      </div>

      <Link href={`${basePath}/mahalle/${generateSlug(neighborhood)}`}>
        <Button variant="outline" className="w-full">
          {neighborhood} Mahallesi Tüm İlanlar
        </Button>
      </Link>
    </div>
  );
}

