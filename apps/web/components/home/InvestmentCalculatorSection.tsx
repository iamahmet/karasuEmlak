"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Percent, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

export function InvestmentCalculatorSection() {
  const [propertyPrice, setPropertyPrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [annualRent, setAnnualRent] = useState<number>(36000);
  const [annualAppreciation, setAnnualAppreciation] = useState<number>(5);
  const [years, setYears] = useState<number>(5);

  // Calculate ROI
  const loanAmount = propertyPrice - downPayment;
  const monthlyRent = annualRent / 12;
  const annualROI = (annualRent / propertyPrice) * 100;
  const totalRentIncome = annualRent * years;
  const futureValue = propertyPrice * Math.pow(1 + annualAppreciation / 100, years);
  const appreciationGain = futureValue - propertyPrice;
  const totalReturn = totalRentIncome + appreciationGain;
  const totalROI = ((totalReturn / propertyPrice) * 100).toFixed(1);
  const annualizedROI = ((Math.pow(totalReturn / propertyPrice, 1 / years) - 1) * 100).toFixed(1);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Calculator className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
              <span className="text-xs font-bold text-[#006AFF] uppercase tracking-wider">Yatırım Analizi</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 text-gray-900 tracking-tight">
              Yatırım Hesaplayıcı
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Gayrimenkul yatırımınızın karlılığını hesaplayın. ROI, nakit akışı ve değer artışı analizi ile bilinçli yatırım yapın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Input Panel */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#006AFF] stroke-[1.5]" />
                Yatırım Parametreleri
              </h3>

              <div className="space-y-6">
                {/* Property Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Gayrimenkul Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006AFF] focus:ring-2 focus:ring-[#006AFF]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="10000"
                  />
                  <div className="mt-2 flex gap-2">
                    {[300000, 500000, 1000000, 2000000].map((price) => (
                      <button
                        key={price}
                        onClick={() => setPropertyPrice(price)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {price / 1000}K
                      </button>
                    ))}
                  </div>
                </div>

                {/* Down Payment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Peşinat (₺)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006AFF] focus:ring-2 focus:ring-[#006AFF]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="10000"
                    max={propertyPrice}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Peşinat Oranı: %{((downPayment / propertyPrice) * 100).toFixed(1)}
                  </div>
                </div>

                {/* Annual Rent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Yıllık Kira Geliri (₺)
                  </label>
                  <input
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006AFF] focus:ring-2 focus:ring-[#006AFF]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="1000"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Aylık Kira: ₺{new Intl.NumberFormat('tr-TR').format(monthlyRent)}
                  </div>
                </div>

                {/* Annual Appreciation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Yıllık Değer Artışı (%)
                  </label>
                  <input
                    type="number"
                    value={annualAppreciation}
                    onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006AFF] focus:ring-2 focus:ring-[#006AFF]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    max="20"
                    step="0.5"
                  />
                  <div className="mt-2 flex gap-2">
                    {[3, 5, 7, 10].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setAnnualAppreciation(rate)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        %{rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Years */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Yatırım Süresi (Yıl)
                  </label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006AFF] focus:ring-2 focus:ring-[#006AFF]/20 transition-all duration-200 text-lg font-medium"
                    min="1"
                    max="30"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* ROI Summary Card */}
              <div className="bg-gradient-to-br from-[#006AFF] to-[#0052CC] rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight">Yatırım Özeti</h3>
                  <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Yıllık ROI</div>
                    <div className="text-3xl font-bold">{annualROI.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90 mb-1">Toplam ROI ({years} yıl)</div>
                    <div className="text-3xl font-bold">%{totalROI}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight">Detaylı Analiz</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Toplam Kira Geliri</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{new Intl.NumberFormat('tr-TR').format(totalRentIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Değer Artışı</span>
                    <span className="text-lg font-bold text-green-600">
                      +₺{new Intl.NumberFormat('tr-TR').format(appreciationGain)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Gelecek Değer ({years} yıl sonra)</span>
                    <span className="text-lg font-bold text-[#006AFF]">
                      ₺{new Intl.NumberFormat('tr-TR').format(futureValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Toplam Getiri</span>
                    <span className="text-xl font-bold text-[#00A862]">
                      ₺{new Intl.NumberFormat('tr-TR').format(totalReturn)}
                    </span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Yıllık Ortalama ROI</span>
                      <span className="text-2xl font-bold text-[#006AFF]">%{annualizedROI}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={cn(
                "rounded-2xl p-6 border-2",
                parseFloat(annualizedROI) >= 8
                  ? "bg-green-50 border-green-200"
                  : parseFloat(annualizedROI) >= 5
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    "h-5 w-5 mt-0.5 stroke-[1.5] flex-shrink-0",
                    parseFloat(annualizedROI) >= 8
                      ? "text-green-600"
                      : parseFloat(annualizedROI) >= 5
                      ? "text-yellow-600"
                      : "text-red-600"
                  )} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {parseFloat(annualizedROI) >= 8
                        ? "Mükemmel Yatırım Fırsatı"
                        : parseFloat(annualizedROI) >= 5
                        ? "İyi Yatırım Potansiyeli"
                        : "Dikkatli Değerlendirin"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {parseFloat(annualizedROI) >= 8
                        ? "Bu yatırım yüksek getiri potansiyeline sahip. Detaylı analiz için uzmanlarımızla iletişime geçin."
                        : parseFloat(annualizedROI) >= 5
                        ? "Bu yatırım orta düzeyde getiri sağlayabilir. Piyasa koşullarını dikkate alarak değerlendirin."
                        : "Bu yatırımın getiri potansiyeli düşük görünüyor. Alternatif seçenekleri değerlendirmenizi öneririz."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-[#006AFF] hover:bg-[#0052CC] text-white text-[15px] font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Uzman Danışmanlık Alın
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

