"use client";

import { TrendingUp, TrendingDown, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@karasu/ui";

export function CompactMarketTrends() {
  const trends = [
    {
      period: "Son 6 Ay",
      avgPrice: 450000,
      change: 8.5,
      trend: "up" as const,
    },
    {
      period: "Son 3 Ay",
      avgPrice: 475000,
      change: 4.2,
      trend: "up" as const,
    },
    {
      period: "Son 1 Ay",
      avgPrice: 490000,
      change: 2.1,
      trend: "up" as const,
    },
  ];

  const propertyTypes = [
    { type: "Daire", avgPrice: 420000, change: 7.2, trend: "up" as const },
    { type: "Villa", avgPrice: 1200000, change: 12.5, trend: "up" as const },
    { type: "Yazlık", avgPrice: 680000, change: -2.3, trend: "down" as const },
    { type: "Arsa", avgPrice: 350000, change: 5.8, trend: "up" as const },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-block mb-4">
                <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Piyasa Analizi</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">
                Piyasa Trendleri
              </h2>
            </div>
            <Link href="/piyasa-analizi" className="hidden md:block">
              <Button variant="outline" size="sm" className="border-2 border-gray-300 hover:border-[#006AFF]">
                Detaylı Analiz
                <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5]" />
              </Button>
            </Link>
          </div>

          {/* Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#006AFF]/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">{trend.period}</span>
                  {trend.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-green-600 stroke-[1.5]" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 stroke-[1.5]" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  ₺{new Intl.NumberFormat('tr-TR').format(trend.avgPrice)}
                </div>
                <div className={`text-sm font-semibold ${
                  trend.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {trend.trend === "up" ? "+" : ""}{trend.change}% değişim
                </div>
              </div>
            ))}
          </div>

          {/* Property Types */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {propertyTypes.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{item.type}</h4>
                  {item.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600 stroke-[1.5]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 stroke-[1.5]" />
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  ₺{new Intl.NumberFormat('tr-TR').format(item.avgPrice)}
                </div>
                <div className={`text-xs font-semibold ${
                  item.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {item.trend === "up" ? "+" : ""}{item.change}%
                </div>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="text-center md:hidden">
            <Link href="/piyasa-analizi">
              <Button variant="outline" size="sm" className="border-2 border-gray-300 hover:border-[#006AFF]">
                Detaylı Analiz
                <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
