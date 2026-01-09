"use client";

import { Zap, Leaf, ThermometerSun } from 'lucide-react';
import { cn } from '@karasu/lib';

interface EnergyRatingProps {
  rating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  heating?: string;
  buildingAge?: number;
  className?: string;
}

const ratingColors = {
  A: 'bg-green-600',
  B: 'bg-green-500',
  C: 'bg-lime-500',
  D: 'bg-yellow-500',
  E: 'bg-orange-500',
  F: 'bg-orange-600',
  G: 'bg-red-600',
};

const ratingLabels = {
  A: 'Çok Verimli',
  B: 'Verimli',
  C: 'İyi',
  D: 'Orta',
  E: 'Düşük',
  F: 'Çok Düşük',
  G: 'En Düşük',
};

export function EnergyRating({ rating, heating, buildingAge, className }: EnergyRatingProps) {
  // Estimate energy rating if not provided
  const estimatedRating = rating || (() => {
    if (buildingAge && buildingAge <= 3) return 'B';
    if (buildingAge && buildingAge <= 10) return 'C';
    if (buildingAge && buildingAge <= 20) return 'D';
    if (heating === 'Kombi') return 'C';
    if (heating === 'Doğalgaz') return 'C';
    return 'D';
  })();

  const allRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-green-50 rounded-xl">
          <Leaf className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Enerji Sınıfı</h3>
          <p className="text-sm text-gray-600">Tahmini enerji verimliliği</p>
        </div>
      </div>

      {/* Energy Rating Scale */}
      <div className="space-y-2 mb-6">
        {allRatings.map((r) => (
          <div
            key={r}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
              r === estimatedRating && "ring-2 ring-offset-2 ring-gray-900"
            )}
          >
            <div
              className={cn(
                "w-12 h-8 rounded flex items-center justify-center text-white font-bold text-sm",
                ratingColors[r]
              )}
              style={{
                width: `${40 + (allRatings.indexOf(r) * 15)}px`,
              }}
            >
              {r}
            </div>
            <span className={cn(
              "text-sm font-medium",
              r === estimatedRating ? "text-gray-900" : "text-gray-500"
            )}>
              {ratingLabels[r]}
            </span>
            {r === estimatedRating && (
              <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Bu Mülk
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        {heating && (
          <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-700 font-semibold">Isıtma</span>
            </div>
            <div className="text-lg font-bold text-orange-900">{heating}</div>
          </div>
        )}
        {buildingAge !== undefined && (
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-semibold">Bina Yaşı</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{buildingAge} yıl</div>
          </div>
        )}
      </div>

      <div className="mt-5 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
        <p className="text-xs text-gray-700 text-center">
          ⚡ Enerji sınıfı, ısıtma tipi ve bina yaşına göre tahmini olarak hesaplanmıştır.
        </p>
      </div>
    </div>
  );
}

export default EnergyRating;

