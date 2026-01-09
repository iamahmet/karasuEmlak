"use client";

import { TrendingUp, TrendingDown, BarChart3, DollarSign, Home, Calendar } from "lucide-react";
import { cn } from "@karasu/lib";

export function MarketTrendsSection() {
  // Mock market data - In production, this would come from API
  const trends = [
    {
      period: "Son 6 Ay",
      avgPrice: 450000,
      change: 8.5,
      trend: "up" as const,
      listings: 245,
      sales: 89,
    },
    {
      period: "Son 3 Ay",
      avgPrice: 475000,
      change: 4.2,
      trend: "up" as const,
      listings: 189,
      sales: 67,
    },
    {
      period: "Son 1 Ay",
      avgPrice: 490000,
      change: 2.1,
      trend: "up" as const,
      listings: 156,
      sales: 34,
    },
  ];

  const propertyTypes = [
    { type: "Daire", avgPrice: 420000, change: 7.2, trend: "up" as const },
    { type: "Villa", avgPrice: 1200000, change: 12.5, trend: "up" as const },
    { type: "Yazlık", avgPrice: 680000, change: -2.3, trend: "down" as const },
    { type: "Arsa", avgPrice: 350000, change: 5.8, trend: "up" as const },
  ];

  const neighborhoods = [
    { name: "Merkez", avgPrice: 480000, change: 9.2, trend: "up" as const },
    { name: "Sahil", avgPrice: 750000, change: 11.5, trend: "up" as const },
    { name: "Liman", avgPrice: 420000, change: 6.8, trend: "up" as const },
    { name: "Çamlık", avgPrice: 550000, change: 4.5, trend: "up" as const },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <BarChart3 className="h-4 w-4 text-purple-600 stroke-[1.5]" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Piyasa Analizi</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 text-gray-900 tracking-tight">
              Karasu Emlak Piyasa Trendleri
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Güncel piyasa verileri, fiyat trendleri ve yatırım fırsatları ile bilinçli kararlar verin.
            </p>
          </div>

          {/* Price Trends Over Time */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[#006AFF] stroke-[1.5]" />
              Fiyat Trendleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trends.map((trend, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-600">{trend.period}</span>
                    {trend.trend === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-600 stroke-[1.5]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 stroke-[1.5]" />
                    )}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₺{new Intl.NumberFormat('tr-TR').format(trend.avgPrice)}
                  </div>
                  <div className={cn(
                    "text-sm font-semibold mb-4",
                    trend.trend === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {trend.trend === "up" ? "+" : ""}{trend.change}% değişim
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">İlanlar</div>
                      <div className="text-lg font-semibold text-gray-900">{trend.listings}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Satışlar</div>
                      <div className="text-lg font-semibold text-[#006AFF]">{trend.sales}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Type Trends */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
              <Home className="h-6 w-6 text-[#00A862] stroke-[1.5]" />
              Gayrimenkul Türüne Göre Trendler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {propertyTypes.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.type}</h4>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-600 stroke-[1.5]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 stroke-[1.5]" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ₺{new Intl.NumberFormat('tr-TR').format(item.avgPrice)}
                  </div>
                  <div className={cn(
                    "text-sm font-semibold",
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {item.trend === "up" ? "+" : ""}{item.change}% değişim
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Trends */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600 stroke-[1.5]" />
              Mahalle Bazında Fiyat Trendleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {neighborhoods.map((neighborhood, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{neighborhood.name}</h4>
                    {neighborhood.trend === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-600 stroke-[1.5]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 stroke-[1.5]" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ₺{new Intl.NumberFormat('tr-TR').format(neighborhood.avgPrice)}
                  </div>
                  <div className={cn(
                    "text-sm font-semibold",
                    neighborhood.trend === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {neighborhood.trend === "up" ? "+" : ""}{neighborhood.change}% değişim
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="mt-12 bg-gradient-to-br from-[#006AFF] to-[#0052CC] rounded-2xl p-8 text-white shadow-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4 tracking-tight">Piyasa Öngörüleri</h3>
              <p className="text-[17px] leading-[1.47] opacity-90 mb-6">
                Karasu emlak piyasası son 6 ayda güçlü bir büyüme trendi gösteriyor. Özellikle denize sıfır konumlar ve merkez bölgelerde yatırımcı ilgisi artıyor. Fiyatların %8.5 artış göstermesi, bölgenin yatırım potansiyelini ortaya koyuyor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">%8.5</div>
                  <div className="text-sm opacity-90">Ortalama Fiyat Artışı</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">245</div>
                  <div className="text-sm opacity-90">Aktif İlan</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">89</div>
                  <div className="text-sm opacity-90">Son 6 Ayda Satış</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

