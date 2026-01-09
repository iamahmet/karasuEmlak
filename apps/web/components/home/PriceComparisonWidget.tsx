"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function PriceComparisonWidget() {
  const [selectedType, setSelectedType] = useState<'daire' | 'villa'>('daire');

  const priceData = {
    daire: [
      { neighborhood: "Merkez", avgPrice: 2500000, change: 5.2, trend: 'up' },
      { neighborhood: "Sahil", avgPrice: 3200000, change: 8.1, trend: 'up' },
      { neighborhood: "Liman", avgPrice: 2100000, change: 3.5, trend: 'up' },
      { neighborhood: "Çamlık", avgPrice: 1900000, change: -1.2, trend: 'down' },
    ],
    villa: [
      { neighborhood: "Sahil", avgPrice: 8500000, change: 12.3, trend: 'up' },
      { neighborhood: "Merkez", avgPrice: 6200000, change: 6.8, trend: 'up' },
      { neighborhood: "Çamlık", avgPrice: 5500000, change: 4.2, trend: 'up' },
      { neighborhood: "Liman", avgPrice: 7100000, change: 0, trend: 'stable' },
    ],
  };

  const data = priceData[selectedType];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Piyasa Analizi</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Güncel Fiyat Karşılaştırması
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu mahallelerinde ortalama satış fiyatları ve değişim oranları
            </p>
          </div>

          {/* Type Selector */}
          <div className="flex items-center justify-center gap-2 mb-10 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setSelectedType('daire')}
              className={`px-6 py-3 rounded-lg text-[15px] font-semibold transition-all duration-200 ${
                selectedType === 'daire'
                  ? "bg-[#006AFF] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Daire
            </button>
            <button
              onClick={() => setSelectedType('villa')}
              className={`px-6 py-3 rounded-lg text-[15px] font-semibold transition-all duration-200 ${
                selectedType === 'villa'
                  ? "bg-[#006AFF] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Villa
            </button>
          </div>

          {/* Price Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-[#006AFF] to-[#0052CC] p-4">
              <div className="grid grid-cols-3 gap-4 text-white font-semibold text-[15px]">
                <div>Mahalle</div>
                <div className="text-right">Ortalama Fiyat</div>
                <div className="text-right">Değişim</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="font-semibold text-gray-900 text-[15px]">
                    {item.neighborhood}
                  </div>
                  <div className="text-right font-bold text-gray-900 text-[15px]">
                    ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(item.avgPrice)}
                  </div>
                  <div className="text-right">
                    {item.trend === 'up' && (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-[15px]">
                        <TrendingUp className="h-4 w-4 stroke-[1.5]" />
                        +{item.change}%
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-[15px]">
                        <TrendingDown className="h-4 w-4 stroke-[1.5]" />
                        {item.change}%
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="inline-flex items-center gap-1 text-gray-600 font-semibold text-[15px]">
                        <Minus className="h-4 w-4 stroke-[1.5]" />
                        Değişmedi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
