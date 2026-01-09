"use client";

import { Button } from '@karasu/ui';
import { Home, TrendingUp, MapPin, Search, ArrowRight, Building2, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EnhancedKiralikHeroProps {
  totalListings: number;
  totalStats: number;
  basePath?: string;
  className?: string;
}

export function EnhancedKiralikHero({
  totalListings,
  totalStats,
  basePath = '',
  className,
}: EnhancedKiralikHeroProps) {
  return (
    <section className={cn(
      "relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden",
      className
    )}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#006AFF]/5 via-transparent to-[#00A862]/5 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-5xl mx-auto py-20 md:py-28 lg:py-36">
          {/* Badge - Corporate Style */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/8 backdrop-blur-md rounded-full text-sm font-semibold mb-8 border border-white/15 shadow-lg">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-white/95 tracking-tight">Karasu'da {totalListings}+ Kiralık Emlak</span>
          </div>

          {/* Main Heading - Corporate Typography */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-8 tracking-[-0.04em] leading-[1.08] text-white">
            Karasu'da Kiralık
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 font-display">
              Emlak İlanları
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-slate-200/90 mb-10 max-w-3xl font-normal tracking-[-0.011em] leading-relaxed">
            Hemen taşınmaya hazır, modern ve konforlu yaşam alanları. Yazlık ve kalıcı yaşam için ideal kiralık ev seçenekleri.
          </p>

          {/* Stats Bar - Corporate Style */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Home className="h-5 w-5 text-blue-400" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalListings}+</div>
                <div className="text-xs md:text-sm text-slate-300 font-medium">Kiralık İlan</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Building2 className="h-5 w-5 text-green-400" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalStats}+</div>
                <div className="text-xs md:text-sm text-slate-300 font-medium">Toplam İlan</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <MapPin className="h-5 w-5 text-cyan-400" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">25+</div>
                <div className="text-xs md:text-sm text-slate-300 font-medium">Mahalle</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link href={`${basePath}/kiralik?propertyType=daire`}>
              <Button 
                size="lg" 
                className="h-14 px-8 rounded-2xl font-semibold text-base bg-[#006AFF] hover:bg-[#0052CC] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Search className="h-5 w-5 mr-2" />
                Daire Ara
              </Button>
            </Link>
            <Link href={`${basePath}/kiralik?propertyType=villa`}>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 rounded-2xl font-semibold text-base bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Villa Ara
              </Button>
            </Link>
            <Link href={`${basePath}/kiralik?propertyType=yazlik`}>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 rounded-2xl font-semibold text-base bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Home className="h-5 w-5 mr-2" />
                Yazlık Ara
              </Button>
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Başlangıç Fiyatı</span>
              <span className="text-base font-bold text-white">₺2.500/ay</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Ortalama Kira</span>
              <span className="text-base font-bold text-white">₺5.500/ay</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Hızlı Taşınma</span>
              <span className="text-base font-bold text-white">7 Gün</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Destek</span>
              <span className="text-base font-bold text-white">7/24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
