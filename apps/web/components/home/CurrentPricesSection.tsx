"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Home, Building2, TreePine, MapPin, ArrowRight, Calendar, FileText } from "lucide-react";
import { Button } from "@karasu/ui";

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
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Güncel Fiyatlar</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu Emlak Fiyatları
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'da güncel emlak fiyatları ve piyasa analizi. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları için en güncel fiyat bilgileri.
            </p>
          </div>

          {/* Price Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {priceData.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group block"
                >
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Icon & Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                          <Icon className="h-6 w-6 text-blue-600 stroke-[1.5]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#006AFF] transition-colors">{item.type}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Average Price */}
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-[#006AFF] mb-1">
                        {item.avgPrice}
                      </div>
                      <div className="text-sm text-gray-600">
                        m² başına {item.pricePerM2}
                      </div>
                    </div>

                    {/* Price Change */}
                    <div className="flex items-center gap-2 mb-4">
                      {item.changeType === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        item.changeType === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        % {item.change} {item.changeType === "up" ? "artış" : "azalış"}
                      </span>
                      <span className="text-xs text-gray-500">({item.period})</span>
                    </div>

                    {/* Stats */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Aktif İlan</span>
                        <span className="font-semibold text-gray-900">{item.activeListings}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ort. Satış Süresi</span>
                        <span className="font-semibold text-gray-900">{item.avgSaleDuration} gün</span>
                      </div>
                    </div>

                    {/* Popular Neighborhoods */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-2">Popüler Mahalleler</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.popularNeighborhoods.map((neighborhood, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white text-xs font-medium text-gray-700 rounded border border-gray-200">
                            {neighborhood}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                        Detaylı Analiz
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Tools & Report */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href={`${basePath}/kredi-hesaplayici`}
              className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <DollarSign className="h-6 w-6 text-blue-600 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#006AFF] transition-colors">Kredi Hesaplayıcı</h4>
                  <p className="text-sm text-gray-600">Aylık ödeme ve faiz hesapla</p>
                </div>
              </div>
            </Link>

            <Link
              href={`${basePath}/yatirim-hesaplayici`}
              className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#006AFF] transition-colors">Yatırım Hesaplayıcı</h4>
                  <p className="text-sm text-gray-600">Getiri oranı ve karlılık analizi</p>
                </div>
              </div>
            </Link>

            <Link
              href={`${basePath}/blog/karasu-emlak-piyasasi-2025`}
              className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                  <FileText className="h-6 w-6 text-purple-600 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#006AFF] transition-colors">2025 Piyasa Raporu</h4>
                  <p className="text-sm text-gray-600">Detaylı piyasa analizi</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
