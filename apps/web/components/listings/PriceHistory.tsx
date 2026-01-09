"use client";

import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { cn } from "@karasu/lib";

interface PriceHistoryProps {
  currentPrice: number;
  status: 'satilik' | 'kiralik';
  className?: string;
}

export function PriceHistory({ currentPrice, status, className }: PriceHistoryProps) {
  // Mock price history data (in production, this would come from database)
  const priceHistory = [
    {
      date: '3 ay önce',
      price: Math.round(currentPrice * 1.05),
      change: 5,
      changeType: 'down' as const,
    },
    {
      date: '2 ay önce',
      price: Math.round(currentPrice * 1.03),
      change: 2,
      changeType: 'down' as const,
    },
    {
      date: '1 ay önce',
      price: Math.round(currentPrice * 1.01),
      change: 1,
      changeType: 'down' as const,
    },
    {
      date: 'Şu an',
      price: currentPrice,
      change: 0,
      changeType: 'stable' as const,
    },
  ];

  const getChangeIcon = (type: 'up' | 'down' | 'stable') => {
    if (type === 'up') return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (type === 'down') return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (type: 'up' | 'down' | 'stable') => {
    if (type === 'up') return 'text-red-600 bg-red-50 border-red-200';
    if (type === 'down') return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Calendar className="h-6 w-6 text-[#006AFF]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Fiyat Geçmişi</h3>
          <p className="text-sm text-gray-600">Son 3 aylık değişim</p>
        </div>
      </div>

      <div className="space-y-3">
        {priceHistory.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
              index === priceHistory.length - 1 
                ? "bg-blue-50 border-blue-300 shadow-md" 
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg border",
                getChangeColor(item.changeType)
              )}>
                {getChangeIcon(item.changeType)}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{item.date}</div>
                {item.change !== 0 && (
                  <div className={cn(
                    "text-xs font-medium",
                    item.changeType === 'down' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {item.changeType === 'down' ? '↓' : '↑'} %{item.change} {item.changeType === 'down' ? 'düşüş' : 'artış'}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ₺{new Intl.NumberFormat('tr-TR').format(item.price)}
              </div>
              {status === 'kiralik' && (
                <div className="text-xs text-gray-500">/ay</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
        <p className="text-sm text-green-900 font-semibold text-center">
          💰 Fiyat düşüşü! Son 3 ayda %5 daha uygun
        </p>
      </div>
    </div>
  );
}

