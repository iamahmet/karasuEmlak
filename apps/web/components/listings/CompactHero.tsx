"use client";

import { MapPin, Shield, CheckCircle2, FileText, Star } from 'lucide-react';
import { cn } from '@karasu/lib';

interface CompactHeroProps {
  title: string;
  location: {
    neighborhood: string;
    district: string;
    city: string;
  };
  price: number;
  status: 'satilik' | 'kiralik';
  featured?: boolean;
  verified?: boolean;
  hasDocuments?: boolean;
  className?: string;
}

export function CompactHero({
  title,
  location,
  price,
  status,
  featured,
  verified,
  hasDocuments,
  className,
}: CompactHeroProps) {
  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-4 md:p-5", className)}>
      {/* Title & Location */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={cn(
            "px-3 py-1 rounded-lg text-sm font-semibold",
            status === 'satilik' 
              ? 'bg-[#006AFF] text-white' 
              : 'bg-[#00A862] text-white'
          )}>
            {status === 'satilik' ? 'Satılık' : 'Kiralık'}
          </span>
          {featured && (
            <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              Öne Çıkan
            </span>
          )}
          {verified && (
            <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Doğrulandı
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 mb-1.5 leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm md:text-base font-medium">
            {location.neighborhood}, {location.district}, {location.city}
          </span>
        </div>
      </div>

      {/* Price & Trust Signals */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t-2 border-gray-200">
        <div className="flex-1">
          <div className="text-3xl md:text-4xl font-extrabold text-[#006AFF] mb-0.5">
            ₺{new Intl.NumberFormat('tr-TR').format(price)}
            {status === 'kiralik' && (
              <span className="text-lg text-gray-500 font-medium">/ay</span>
            )}
          </div>
          {status === 'satilik' && (
            <p className="text-xs text-gray-600 font-medium">
              Tahmini aylık ödeme: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(price * 0.006))}/ay
            </p>
          )}
        </div>

        {/* Trust Signals - Compact */}
        {hasDocuments && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-0.5 p-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-semibold text-blue-700">Tapu</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-1.5 bg-green-50 rounded-lg border border-green-200">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-[10px] font-semibold text-green-700">İskan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompactHero;

