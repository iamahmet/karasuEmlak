"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Home, Building2, TreePine, MapPin, ArrowRight, Calendar, FileText } from "lucide-react";
import { Button } from "@karasu/ui";

import { cn } from "@karasu/lib";

interface CurrentPricesSectionProps {
  basePath?: string;
}

export function CurrentPricesSection({ basePath = "" }: CurrentPricesSectionProps) {
  const priceData = [
    {
      type: "Daire",
      icon: Building2,
      avgPrice: "3 Mn ₺",
      pricePerM2: "24 B ₺",
      change: 1.5,
      changeType: "up" as const,
      period: "1 ay",
      activeListings: 31,
      avgSaleDuration: 42,
      popularNeighborhoods: ["Merkez", "Sahil"],
      href: `${basePath}/tip/daire`,
    },
    {
      type: "Villa",
      icon: Home,
      avgPrice: "5 Mn ₺",
      pricePerM2: "19 B ₺",
      change: 0.9,
      changeType: "up" as const,
      period: "1 ay",
      activeListings: 18,
      avgSaleDuration: 58,
      popularNeighborhoods: ["Sahil", "Yalı"],
      href: `${basePath}/tip/villa`,
    },
    {
      type: "Yazlık",
      icon: TreePine,
      avgPrice: "4 Mn ₺",
      pricePerM2: "22 B ₺",
      change: 0.8,
      changeType: "down" as const,
      period: "1 ay",
      activeListings: 12,
      avgSaleDuration: 65,
      popularNeighborhoods: ["Sahil", "Yalı"],
      href: `${basePath}/tip/yazlik`,
    },
    {
      type: "Arsa",
      icon: MapPin,
      avgPrice: "1 Mn ₺",
      pricePerM2: "2 B ₺",
      change: 2.1,
      changeType: "up" as const,
      period: "1 ay",
      activeListings: 8,
      avgSaleDuration: 35,
      popularNeighborhoods: ["Sahil", "Merkez"],
      href: `${basePath}/tip/arsa`,
    },
  ];

  return (

    <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/20 rounded-full blur-[140px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center">PİYASA VERİLERİ</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                Karasu'da Güncel <span className="text-blue-600">Piyasa</span> Analizi
              </h2>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                Gerçek zamanlı verilerle Karasu emlak piyasasını takip edin, doğru zamanda doğru kararlar alın.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                SON GÜNCELLEME: ŞUBAT 2026
              </div>
            </div>
          </div>

          {/* Price Cards Grid - High Contrast Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {priceData.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group relative"
                >
                  <div className="relative h-full bg-white rounded-[40px] p-8 border border-gray-100 hover:shadow-[0_40px_100px_rgba(0,106,255,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <Icon className="h-7 w-7 stroke-[1.5]" />
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                        item.changeType === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {item.changeType === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        %{item.change}
                      </div>
                    </div>

                    <div className="space-y-1 mb-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{item.type}</h3>
                      <div className="text-4xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {item.avgPrice}
                      </div>
                      <p className="text-xs font-bold text-gray-500 tracking-tight">Ortalama Fiyat</p>
                    </div>

                    <div className="flex flex-col gap-4 py-6 border-y border-gray-50">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>METREKARE</span>
                        <span className="text-gray-900">{item.pricePerM2}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>İLAN SAYISI</span>
                        <span className="text-gray-900">{item.activeListings}</span>
                      </div>
                    </div>

                    {/* Popüler Mahalleler Tags */}
                    <div className="mt-8 flex flex-wrap gap-2">
                      {item.popularNeighborhoods.map((n, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                          {n}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-8 flex justify-end">
                      <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Action Cards - Horizontal Pill Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href={`${basePath}/kredi-hesaplayici`}
              className="group p-1 bg-white rounded-full border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-6 pr-8">
                <div className="p-5 bg-blue-50 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <DollarSign className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Kredi Hesapla</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ödeme planı çıkar</p>
                </div>
              </div>
            </Link>

            <Link
              href={`${basePath}/yatirim-hesaplayici`}
              className="group p-1 bg-white rounded-full border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-6 pr-8">
                <div className="p-5 bg-emerald-50 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <TrendingUp className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Karlılık Analizi</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Yatırım verimliliği</p>
                </div>
              </div>
            </Link>

            <Link
              href={`${basePath}/blog/karasu-emlak-piyasasi-2025`}
              className="group p-1 bg-white rounded-full border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-6 pr-8">
                <div className="p-5 bg-purple-50 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                  <FileText className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">2026 Raporu</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Derinlemesine analiz</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
