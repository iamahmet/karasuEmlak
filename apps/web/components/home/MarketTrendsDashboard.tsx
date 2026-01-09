"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  MapPin, 
  Home, 
  Building2, 
  TreePine, 
  Square,
  ArrowRight,
  Activity
} from "lucide-react";
import { generateSlug } from '@/lib/utils';

export function MarketTrendsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'1ay' | '3ay' | '6ay' | '1yil'>('1ay');

  // Summary cards data
  const summaryCards = [
    {
      icon: BarChart3,
      title: "Piyasa Aktivitesi",
      value: "Orta",
      description: "75 aktif satılık ilan (son 1 ay)",
      change: 8,
      changeType: "up" as const,
      color: "blue",
    },
    {
      icon: Calendar,
      title: "Ortalama Satış Süresi",
      value: "45 gün",
      description: "Son 1 ayda hızlanma",
      change: 8,
      changeType: "down" as const, // Negative is good for sale duration
      color: "green",
    },
    {
      icon: TrendingUp,
      title: "Fiyat Artışı",
      value: "%0.9",
      description: "Son 1 ay ortalama artış",
      change: 0.1,
      changeType: "up" as const,
      color: "purple",
    },
    {
      icon: MapPin,
      title: "En Popüler Bölge",
      value: "Sahil",
      description: "En çok ilan görüntülenen mahalle",
      change: 23,
      changeType: "up" as const,
      color: "orange",
    },
  ];

  // Property type cards data
  const propertyTypes = [
    {
      icon: Building2,
      type: "Daire",
      price: 3000000,
      pricePerM2: 24000,
      change: 1.5,
      changeType: "up" as const,
      activeListings: 31,
      avgSaleDuration: 42,
      popularNeighborhoods: ["Merkez", "Sahil"],
    },
    {
      icon: Home,
      type: "Villa",
      price: 5000000,
      pricePerM2: 19000,
      change: 0.9,
      changeType: "up" as const,
      activeListings: 18,
      avgSaleDuration: 58,
      popularNeighborhoods: ["Sahil", "Yalı"],
    },
    {
      icon: TreePine,
      type: "Yazlık",
      price: 4000000,
      pricePerM2: 22000,
      change: 0.8,
      changeType: "down" as const,
      activeListings: 12,
      avgSaleDuration: 65,
      popularNeighborhoods: ["Sahil", "Yalı"],
    },
    {
      icon: Square,
      type: "Arsa",
      price: 1000000,
      pricePerM2: 2000,
      change: 2.1,
      changeType: "up" as const,
      activeListings: 8,
      avgSaleDuration: 35,
      popularNeighborhoods: ["Sahil", "Merkez"],
    },
  ];

  const periods = [
    { id: '1ay' as const, label: '1 Ay' },
    { id: '3ay' as const, label: '3 Ay' },
    { id: '6ay' as const, label: '6 Ay' },
    { id: '1yil' as const, label: '1 Yıl' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div className="mb-6 md:mb-0">
              <div className="inline-block mb-4">
                <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Piyasa Analizi</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 text-gray-900 tracking-tight">
                Karasu Emlak Piyasa Trendleri
              </h2>
              <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl">
                Güncel fiyat trendleri, piyasa analizi ve yatırım fırsatları ile bilinçli kararlar alın
              </p>
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? 'bg-[#006AFF] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#006AFF]/40 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      card.color === 'blue' ? 'bg-blue-50' :
                      card.color === 'green' ? 'bg-green-50' :
                      card.color === 'purple' ? 'bg-purple-50' :
                      'bg-orange-50'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        card.color === 'blue' ? 'text-blue-600' :
                        card.color === 'green' ? 'text-green-600' :
                        card.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      } stroke-[1.5]`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      card.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.changeType === 'up' ? (
                        <TrendingUp className="h-4 w-4 stroke-[1.5]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 stroke-[1.5]" />
                      )}
                      {card.changeType === 'up' ? '+' : ''}{card.change}%
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">{card.title}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Property Type Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyTypes.map((property, index) => {
              const Icon = property.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-5 w-5 text-[#006AFF] stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{property.type}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(property.price)} ₺
                    </div>
                    <div className="text-sm text-gray-600">
                      m² başına {new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(property.pricePerM2)} ₺
                    </div>
                  </div>

                  {/* Price Change */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      {property.changeType === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 stroke-[1.5]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 stroke-[1.5]" />
                      )}
                      <span className={`text-sm font-semibold ${
                        property.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        %{Math.abs(property.change)} {property.changeType === 'up' ? 'artış' : 'azalış'} (1 ay)
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                        Aktif İlan
                      </span>
                      <span className="font-bold text-gray-900">{property.activeListings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400 stroke-[1.5]" />
                        Ort. Satış Süresi
                      </span>
                      <span className="font-bold text-gray-900">{property.avgSaleDuration} gün</span>
                    </div>
                  </div>

                  {/* Popular Neighborhoods */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                      Popüler Mahalleler
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {property.popularNeighborhoods.map((neighborhood, idx) => (
                        <Link
                          key={idx}
                          href={`/mahalle/${generateSlug(neighborhood)}`}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#006AFF] rounded-lg text-xs font-semibold text-gray-700 hover:text-[#006AFF] transition-all duration-200"
                        >
                          {neighborhood}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/piyasa-analizi?tip=${property.type.toLowerCase()}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#006AFF] hover:text-[#0052CC] transition-colors duration-200"
                  >
                    Detaylı Analiz
                    <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

