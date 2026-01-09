"use client";

import { useState } from "react";
import { Calculator, Home, MapPin, Square, Building2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

export function PropertyValuationSection() {
  const [propertyType, setPropertyType] = useState<"daire" | "villa" | "yazlik" | "arsa">("daire");
  const [neighborhood, setNeighborhood] = useState<string>("merkez");
  const [sizeM2, setSizeM2] = useState<number>(100);
  const [roomCount, setRoomCount] = useState<number>(3);
  const [age, setAge] = useState<number>(5);
  const [floor, setFloor] = useState<number>(2);
  const [hasBalcony, setHasBalcony] = useState<boolean>(true);
  const [hasParking, setHasParking] = useState<boolean>(true);
  const [hasElevator, setHasElevator] = useState<boolean>(true);

  // Mock valuation calculation
  const basePrices: Record<string, number> = {
    merkez: 4500,
    sahil: 7000,
    liman: 4000,
    camlik: 5500,
  };

  const typeMultipliers: Record<string, number> = {
    daire: 1.0,
    villa: 1.8,
    yazlik: 1.3,
    arsa: 0.7,
  };

  const calculateValuation = () => {
    const basePrice = basePrices[neighborhood] || 4500;
    const typeMultiplier = typeMultipliers[propertyType] || 1.0;
    let price = basePrice * sizeM2 * typeMultiplier;

    // Adjustments
    if (age < 5) price *= 1.1;
    else if (age < 10) price *= 1.0;
    else if (age < 20) price *= 0.95;
    else price *= 0.9;

    if (hasBalcony) price *= 1.05;
    if (hasParking) price *= 1.08;
    if (hasElevator) price *= 1.03;

    return Math.round(price);
  };

  const estimatedValue = calculateValuation();
  const minValue = Math.round(estimatedValue * 0.9);
  const maxValue = Math.round(estimatedValue * 1.1);

  const neighborhoods = [
    { value: "merkez", label: "Merkez", avgPrice: 4500 },
    { value: "sahil", label: "Sahil", avgPrice: 7000 },
    { value: "liman", label: "Liman", avgPrice: 4000 },
    { value: "camlik", label: "Çamlık", avgPrice: 5500 },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
              <Calculator className="h-4 w-4 text-orange-600 stroke-[1.5]" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Gayrimenkul Değerleme</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 text-gray-900 tracking-tight">
              Gayrimenkul Değerleme Aracı
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Gayrimenkulünüzün piyasa değerini öğrenin. AI destekli analiz ile güncel fiyat tahmini alın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Input Panel */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                <Home className="h-5 w-5 text-orange-600 stroke-[1.5]" />
                Gayrimenkul Bilgileri
              </h3>

              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gayrimenkul Türü
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "daire", label: "Daire" },
                      { value: "villa", label: "Villa" },
                      { value: "yazlik", label: "Yazlık" },
                      { value: "arsa", label: "Arsa" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPropertyType(type.value as any)}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                          propertyType === type.value
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Mahalle
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-lg font-medium"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label} (₺{new Intl.NumberFormat('tr-TR').format(n.avgPrice)}/m²)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Square className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Metrekare (m²)
                  </label>
                  <input
                    type="number"
                    value={sizeM2}
                    onChange={(e) => setSizeM2(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="10"
                  />
                </div>

                {/* Room Count */}
                {propertyType !== "arsa" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Oda Sayısı
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          onClick={() => setRoomCount(count)}
                          className={cn(
                            "flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                            roomCount === count
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          )}
                        >
                          {count}+1
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age */}
                {propertyType !== "arsa" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bina Yaşı (Yıl)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-lg font-medium"
                      min="0"
                      max="50"
                      step="1"
                    />
                  </div>
                )}

                {/* Features */}
                {propertyType !== "arsa" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Özellikler
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: "hasBalcony", label: "Balkon", value: hasBalcony, setter: setHasBalcony },
                        { key: "hasParking", label: "Otopark", value: hasParking, setter: setHasParking },
                        { key: "hasElevator", label: "Asansör", value: hasElevator, setter: setHasElevator },
                      ].map((feature) => (
                        <label
                          key={feature.key}
                          className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={feature.value}
                            onChange={(e) => feature.setter(e.target.checked)}
                            className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Valuation Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight">Tahmini Değer</h3>
                  <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div className="text-5xl font-bold mb-2">
                  ₺{new Intl.NumberFormat('tr-TR').format(estimatedValue)}
                </div>
                <div className="text-sm opacity-90 mb-4">
                  {minValue.toLocaleString('tr-TR')} - {maxValue.toLocaleString('tr-TR')} aralığında
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-xs opacity-90 mb-1">m² Fiyatı</div>
                  <div className="text-2xl font-bold">
                    ₺{new Intl.NumberFormat('tr-TR').format(Math.round(estimatedValue / sizeM2))}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight">Değerleme Detayları</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Temel Değer</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{new Intl.NumberFormat('tr-TR').format(Math.round(estimatedValue * 0.85))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Özellik Bonusları</span>
                    <span className="text-lg font-bold text-green-600">
                      +₺{new Intl.NumberFormat('tr-TR').format(Math.round(estimatedValue * 0.15))}
                    </span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tahmini Değer</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ₺{new Intl.NumberFormat('tr-TR').format(estimatedValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 stroke-[1.5] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Önemli Not</h4>
                    <p className="text-sm text-gray-600">
                      Bu değerleme tahmini bir değerdir. Kesin değerleme için profesyonel bir ekspertiz raporu gereklidir. 
                      Ücretsiz ekspertiz hizmetimiz için iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-[15px] font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Ücretsiz Ekspertiz Talep Edin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

