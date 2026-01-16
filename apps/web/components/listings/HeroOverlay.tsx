"use client";

import { MapPin, Shield, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@karasu/lib';
import ShareButtons from '@/components/share/ShareButtons';

interface HeroOverlayProps {
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
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  className?: string;
}

export function HeroOverlay({
  title,
  location,
  price,
  status,
  featured,
  verified,
  hasDocuments,
  shareUrl,
  shareTitle,
  shareDescription,
  className,
}: HeroOverlayProps) {
  return (
    <div className={cn("relative bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl flex flex-col justify-end p-4 md:p-6", className)}>
      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm",
            status === 'satilik' 
              ? 'bg-[#006AFF] text-white' 
              : 'bg-[#00A862] text-white'
          )}>
            {status === 'satilik' ? 'Satılık' : 'Kiralık'}
          </span>
          {featured && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              Öne Çıkan
            </span>
          )}
          {verified && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500/90 backdrop-blur-sm text-white shadow-lg flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Doğrulanmış Emlakçı
            </span>
          )}
        </div>

        {/* Share Buttons */}
        <div className="hidden md:block">
          <ShareButtons
            url={shareUrl}
            title={shareTitle}
            description={shareDescription}
          />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="relative z-20">
        {/* Title & Location */}
        <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white mb-2 leading-tight drop-shadow-lg">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-white/90 mb-4">
          <MapPin className="h-4 w-4" />
          <span className="text-sm md:text-base font-medium">
            {location.neighborhood}, {location.district}, {location.city}
          </span>
        </div>

        {/* Price & Trust Signals */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-white/20">
          <div className="flex-1">
            <div className="text-3xl md:text-5xl font-extrabold text-white mb-1 drop-shadow-lg">
              ₺{new Intl.NumberFormat('tr-TR').format(price)}
              {status === 'kiralik' && (
                <span className="text-xl text-white/80 font-medium">/ay</span>
              )}
            </div>
            {status === 'satilik' && (
              <p className="text-xs md:text-sm text-white/80 font-medium">
                Tahmini aylık ödeme: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(price * 0.006))}/ay
              </p>
            )}
          </div>

          {/* Trust Signals - Compact */}
          {hasDocuments && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5 p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-[10px] font-semibold text-white">Tapu</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-[10px] font-semibold text-white">İskan</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroOverlay;

