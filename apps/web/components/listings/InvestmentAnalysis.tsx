"use client";

import { TrendingUp, DollarSign, Calendar, Percent, Home } from "lucide-react";
import { cn } from "@karasu/lib";

interface InvestmentAnalysisProps {
  price: number;
  sizeM2?: number;
  neighborhood: string;
  propertyType: string;
  status: 'satilik' | 'kiralik';
  className?: string;
}

export function InvestmentAnalysis({ price, sizeM2, neighborhood, propertyType, status, className }: InvestmentAnalysisProps) {
  // Calculate investment metrics
  const pricePerM2 = sizeM2 ? Math.round(price / sizeM2) : 0;
  
  // Estimated rental yield (based on neighborhood)
  const getRentalYield = () => {
    if (neighborhood === 'Sahil') return 5.5;
    if (neighborhood === 'Merkez') return 4.8;
    if (neighborhood === 'Çamlık') return 4.2;
    if (neighborhood === 'Liman') return 5.0;
    return 4.5;
  };

  const rentalYield = getRentalYield();
  const estimatedMonthlyRent = Math.round((price * rentalYield / 100) / 12);
  const estimatedAnnualReturn = Math.round(price * rentalYield / 100);

  // Price appreciation estimate (annual)
  const getPriceAppreciation = () => {
    if (neighborhood === 'Sahil') return 8.5;
    if (neighborhood === 'Merkez') return 7.2;
    if (neighborhood === 'Çamlık') return 9.5; // Growing area
    if (neighborhood === 'Liman') return 8.0;
    return 7.5;
  };

  const priceAppreciation = getPriceAppreciation();
  const estimatedValueIn5Years = Math.round(price * Math.pow(1 + priceAppreciation / 100, 5));

  // Market comparison
  const getMarketComparison = () => {
    const avgPricePerM2 = neighborhood === 'Sahil' ? 25000 
      : neighborhood === 'Merkez' ? 20000
      : neighborhood === 'Çamlık' ? 18000
      : 22000;

    if (!pricePerM2) return 'Piyasa ortalamasında';
    
    const diff = ((pricePerM2 - avgPricePerM2) / avgPricePerM2) * 100;
    
    if (diff < -10) return 'Piyasa ortalamasının altında (Fırsat!)';
    if (diff > 10) return 'Piyasa ortalamasının üstünde (Premium)';
    return 'Piyasa ortalamasında';
  };

  const marketComparison = getMarketComparison();

  if (status === 'kiralik') {
    return (
      <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-blue-50 rounded-xl">
            <DollarSign className="h-6 w-6 text-[#006AFF]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Kira Bilgileri</h3>
            <p className="text-sm text-gray-600">Ödeme detayları</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="text-sm text-blue-700 font-semibold mb-2">Aylık Kira</div>
            <div className="text-3xl font-extrabold text-[#006AFF]">
              ₺{new Intl.NumberFormat('tr-TR').format(price)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Tahmini Depozito</div>
              <div className="text-lg font-bold text-gray-900">
                ₺{new Intl.NumberFormat('tr-TR').format(price * 1.5)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Yıllık Toplam</div>
              <div className="text-lg font-bold text-gray-900">
                ₺{new Intl.NumberFormat('tr-TR').format(price * 12)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-blue-50 rounded-xl">
          <TrendingUp className="h-6 w-6 text-[#006AFF]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Yatırım Analizi</h3>
          <p className="text-sm text-gray-600">Getiri potansiyeli</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Price per m² */}
        {pricePerM2 > 0 && (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-700 font-semibold">m² Fiyatı</div>
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#006AFF] mb-1">
              ₺{new Intl.NumberFormat('tr-TR').format(pricePerM2)}
            </div>
            <div className="text-xs text-blue-700">{marketComparison}</div>
          </div>
        )}

        {/* Rental Yield */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-green-600" />
              <div className="text-xs text-green-700 font-semibold">Kira Getirisi</div>
            </div>
            <div className="text-2xl font-extrabold text-green-900">%{rentalYield}</div>
            <div className="text-xs text-green-700 mt-1">Yıllık</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="text-xs text-purple-700 font-semibold">Değer Artışı</div>
            </div>
            <div className="text-2xl font-extrabold text-purple-900">%{priceAppreciation}</div>
            <div className="text-xs text-purple-700 mt-1">Yıllık</div>
          </div>
        </div>

        {/* Estimated Returns */}
        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Tahmini Aylık Kira</div>
              <div className="text-lg font-bold text-gray-900">
                ₺{new Intl.NumberFormat('tr-TR').format(estimatedMonthlyRent)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Yıllık Kira Geliri</div>
              <div className="text-lg font-bold text-gray-900">
                ₺{new Intl.NumberFormat('tr-TR').format(estimatedAnnualReturn)}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-indigo-700 font-semibold mb-1">5 Yıllık Projeksiyon</div>
              <div className="text-xs text-indigo-600">Tahmini değer artışı</div>
            </div>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-900 mb-2">
            ₺{new Intl.NumberFormat('tr-TR').format(estimatedValueIn5Years)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-semibold">
              +₺{new Intl.NumberFormat('tr-TR').format(estimatedValueIn5Years - price)} potansiyel kazanç
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-xs text-yellow-900 font-medium text-center">
          ⚠️ Bu hesaplamalar tahmini olup, piyasa koşullarına göre değişiklik gösterebilir.
        </p>
      </div>
    </div>
  );
}

