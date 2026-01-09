"use client";

import { useState } from "react";
import { Calculator, Home, Percent, Calendar, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

export function MortgageCalculatorSection() {
  const [propertyPrice, setPropertyPrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(2.5);
  const [loanTerm, setLoanTerm] = useState<number>(20);

  // Calculate mortgage
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numPayments;
  }

  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  const downPaymentPercent = (downPayment / propertyPrice) * 100;

  return (
    <section className="py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Home className="h-4 w-4 text-[#00A862] stroke-[1.5]" />
              <span className="text-xs font-bold text-[#00A862] uppercase tracking-wider">Kredi Hesaplama</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 text-gray-900 tracking-tight">
              Konut Kredisi Hesaplayıcı
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Aylık ödeme tutarınızı, toplam faiz maliyetini ve ödeme planınızı hesaplayın. En uygun kredi seçeneklerini karşılaştırın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Input Panel */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#00A862] stroke-[1.5]" />
                Kredi Bilgileri
              </h3>

              <div className="space-y-6">
                {/* Property Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gayrimenkul Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00A862] focus:ring-2 focus:ring-[#00A862]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="10000"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peşinat (₺)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00A862] focus:ring-2 focus:ring-[#00A862]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    step="10000"
                    max={propertyPrice}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00A862] h-full transition-all duration-300"
                        style={{ width: `${Math.min(downPaymentPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                      %{downPaymentPercent.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Yıllık Faiz Oranı (%)
                  </label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00A862] focus:ring-2 focus:ring-[#00A862]/20 transition-all duration-200 text-lg font-medium"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[1.5, 2.0, 2.5, 3.0, 3.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setInterestRate(rate)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        %{rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan Term */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                    Kredi Vadesi (Yıl)
                  </label>
                  <input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00A862] focus:ring-2 focus:ring-[#00A862]/20 transition-all duration-200 text-lg font-medium"
                    min="1"
                    max="30"
                    step="1"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[5, 10, 15, 20, 25, 30].map((term) => (
                      <button
                        key={term}
                        onClick={() => setLoanTerm(term)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {term} Yıl
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Monthly Payment Card */}
              <div className="bg-gradient-to-br from-[#00A862] to-[#008A52] rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight">Aylık Ödeme</h3>
                  <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div className="text-5xl font-bold mb-2">
                  ₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(monthlyPayment)}
                </div>
                <div className="text-sm opacity-90">
                  {loanTerm * 12} ay boyunca sabit ödeme
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 tracking-tight">Ödeme Detayları</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Kredi Tutarı</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{new Intl.NumberFormat('tr-TR').format(loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Toplam Ödeme</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{new Intl.NumberFormat('tr-TR').format(totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Toplam Faiz</span>
                    <span className="text-lg font-bold text-red-600">
                      ₺{new Intl.NumberFormat('tr-TR').format(totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Peşinat</span>
                    <span className="text-lg font-bold text-[#00A862]">
                      ₺{new Intl.NumberFormat('tr-TR').format(downPayment)}
                    </span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Toplam Maliyet</span>
                      <span className="text-2xl font-bold text-[#00A862]">
                        ₺{new Intl.NumberFormat('tr-TR').format(totalPayment + downPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affordability Check */}
              <div className={cn(
                "rounded-2xl p-6 border-2",
                monthlyPayment <= 15000
                  ? "bg-green-50 border-green-200"
                  : monthlyPayment <= 25000
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={cn(
                    "h-5 w-5 mt-0.5 stroke-[1.5] flex-shrink-0",
                    monthlyPayment <= 15000
                      ? "text-green-600"
                      : monthlyPayment <= 25000
                      ? "text-yellow-600"
                      : "text-red-600"
                  )} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {monthlyPayment <= 15000
                        ? "Uygun Ödeme Tutarı"
                        : monthlyPayment <= 25000
                        ? "Orta Seviye Ödeme"
                        : "Yüksek Ödeme Tutarı"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {monthlyPayment <= 15000
                        ? "Bu ödeme tutarı çoğu bütçe için uygundur. Gelir durumunuzu değerlendirerek ilerleyebilirsiniz."
                        : monthlyPayment <= 25000
                        ? "Bu ödeme tutarı için gelir durumunuzu ve diğer giderlerinizi dikkate almanızı öneririz."
                        : "Bu ödeme tutarı yüksek görünüyor. Daha uzun vade veya daha yüksek peşinat seçeneklerini değerlendirebilirsiniz."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-[#00A862] hover:bg-[#008A52] text-white text-[15px] font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Kredi Başvurusu Yapın
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

