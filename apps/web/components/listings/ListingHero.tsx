"use client";

import { MapPin, Shield, CheckCircle2, Star, Share2, Heart, Phone } from 'lucide-react';
import { cn } from '@karasu/lib';
import { Button } from '@karasu/ui';
import ShareButtons from '@/components/share/ShareButtons';
import { FavoriteButton } from '@/components/listings/FavoriteButton';
import { PrintButton } from '@/components/listings/PrintButton';
import dynamic from 'next/dynamic';

const ViewingBooking = dynamic(() => import('@/components/booking/ViewingBooking').then(mod => ({ default: mod.default })), {
  ssr: false,
});

interface ListingHeroProps {
  title: string;
  location: {
    neighborhood: string;
    district: string;
    city?: string;
  };
  price: number;
  status: 'satilik' | 'kiralik';
  featured?: boolean;
  verified?: boolean;
  hasDocuments?: boolean;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  propertyId: string;
  propertySlug: string;
  images?: Array<{ public_id?: string; url?: string; alt?: string }>;
  className?: string;
}

export function ListingHero({
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
  propertyId,
  propertySlug,
  images,
  className,
}: ListingHeroProps) {
  const mainImage = images?.[0];

  return (
    <section className={cn("relative bg-white border-b border-slate-200/80", className)}>
      {/* Hero Image with Overlay */}
      <div className="relative h-[60vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Image or Gradient */}
        {mainImage?.url || mainImage?.public_id ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: mainImage.url 
                ? `url(${mainImage.url})` 
                : mainImage.public_id 
                ? `url(https://res.cloudinary.com/demo/image/fetch/w_1920,h_1080,c_fill,q_auto,f_auto/${mainImage.public_id})`
                : undefined,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 lg:px-6 h-full relative z-10">
          <div className="h-full flex flex-col justify-end pb-8 md:pb-12 lg:pb-16">
            {/* Top Badges & Actions */}
            <div className="absolute top-6 left-4 right-4 flex items-start justify-between z-20">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold tracking-tight shadow-xl backdrop-blur-md border",
                  status === 'satilik' 
                    ? 'bg-[#006AFF]/95 text-white border-[#006AFF]/30' 
                    : 'bg-[#00A862]/95 text-white border-[#00A862]/30'
                )}>
                  {status === 'satilik' ? 'Satılık' : 'Kiralık'}
                </span>
                {featured && (
                  <span className="px-4 py-2 rounded-xl text-sm font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-xl backdrop-blur-md border border-yellow-300/30 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-current" />
                    Öne Çıkan
                  </span>
                )}
                {verified && (
                  <span className="px-4 py-2 rounded-xl text-sm font-bold tracking-tight bg-green-500/95 backdrop-blur-md text-white shadow-xl border border-green-400/30 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                    Doğrulanmış
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <ShareButtons
                  url={shareUrl}
                  title={shareTitle}
                  description={shareDescription}
                />
                <FavoriteButton listingId={propertyId} variant="detail" />
                <PrintButton />
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-4 tracking-[-0.04em] leading-[1.08] drop-shadow-2xl">
                {title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2.5 text-white/95 mb-6">
                <MapPin className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-base md:text-lg font-semibold tracking-tight">
                  {location.neighborhood}, {location.district}
                  {location.city && `, ${location.city}`}
                </span>
              </div>

              {/* Price & Trust Signals Row */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pt-6 border-t border-white/20">
                {/* Price */}
                <div className="flex-1">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
                    ₺{new Intl.NumberFormat('tr-TR').format(price)}
                    {status === 'kiralik' && (
                      <span className="text-2xl md:text-3xl text-white/80 font-medium ml-2">/ay</span>
                    )}
                  </div>
                  {status === 'satilik' && (
                    <p className="text-sm md:text-base text-white/80 font-medium tracking-tight">
                      Tahmini aylık ödeme: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(price * 0.006))}/ay
                    </p>
                  )}
                </div>

                {/* Trust Signals */}
                {hasDocuments && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5 p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 shadow-lg hover:bg-white/20 transition-colors">
                      <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                      <span className="text-[11px] font-bold text-white tracking-tight uppercase">Tapu</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 shadow-lg hover:bg-white/20 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                      <span className="text-[11px] font-bold text-white tracking-tight uppercase">İskan</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions - Mobile */}
              <div className="md:hidden flex items-center gap-2 mt-6 pt-6 border-t border-white/20">
                <Button
                  size="sm"
                  className="flex-1 bg-white/95 hover:bg-white text-slate-900 font-semibold rounded-xl"
                  asChild
                >
                  <a href="tel:+905466395461">
                    <Phone className="h-4 w-4 mr-2" />
                    Ara
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
