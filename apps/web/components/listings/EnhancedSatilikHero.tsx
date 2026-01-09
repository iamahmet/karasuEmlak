"use client";

import { Button } from '@karasu/ui';
import { Home, TrendingUp, MapPin, Search, ArrowRight, Building2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EnhancedSatilikHeroProps {
  totalListings: number;
  totalStats: number;
  basePath?: string;
  className?: string;
}

export function EnhancedSatilikHero({
  totalListings,
  totalStats,
  basePath = '',
  className,
}: EnhancedSatilikHeroProps) {
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
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-white/95 tracking-tight">Karasu'da {totalListings}+ Satılık Emlak</span>
          </div>

          {/* Main Heading - Corporate Typography */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-8 tracking-[-0.04em] leading-[1.08] text-white">
            Karasu'da Satılık
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 font-display">
              Emlak İlanları
            </span>
          </h1>

          {/* Description - Professional Typography */}
          <p className="text-lg md:text-xl lg:text-[22px] text-slate-200 mb-10 max-w-3xl leading-[1.7] font-normal tracking-[-0.011em]">
            Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları ile hayalinizdeki evi bulun.
            <span className="block mt-3 text-base md:text-lg text-slate-300/90 font-normal">
              15 yıllık deneyimli emlak danışmanlarımız ile güvenli alım-satım süreci.
            </span>
          </p>

          {/* Stats - Corporate Design */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-12">
            <div className="flex items-center gap-4 bg-white/6 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/12 shadow-lg hover:bg-white/8 transition-all duration-300">
              <div className="p-3 bg-[#006AFF]/20 rounded-xl border border-[#006AFF]/30">
                <Home className="h-6 w-6 text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalListings || 0}</div>
                <div className="text-sm text-slate-300 font-medium mt-0.5">Satılık İlan</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/6 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/12 shadow-lg hover:bg-white/8 transition-all duration-300">
              <div className="p-3 bg-[#00A862]/20 rounded-xl border border-[#00A862]/30">
                <Building2 className="h-6 w-6 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalStats || 0}</div>
                <div className="text-sm text-slate-300 font-medium mt-0.5">Toplam İlan</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/6 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/12 shadow-lg hover:bg-white/8 transition-all duration-300">
              <div className="p-3 bg-slate-500/20 rounded-xl border border-slate-400/30">
                <MapPin className="h-6 w-6 text-slate-300" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">50+</div>
                <div className="text-sm text-slate-300 font-medium mt-0.5">Mahalle</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons - Corporate Style */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link href={`${basePath}/satilik?propertyType=daire`}>
              <Button size="lg" className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-8 py-6 text-[15px] font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 tracking-tight">
                <Search className="h-5 w-5 mr-2.5" strokeWidth={2.5} />
                Daire Ara
                <ArrowRight className="h-5 w-5 ml-2.5" strokeWidth={2.5} />
              </Button>
            </Link>
            <Link href={`${basePath}/satilik?propertyType=villa`}>
              <Button size="lg" variant="outline" className="bg-white/8 hover:bg-white/15 text-white border-white/25 hover:border-white/40 px-8 py-6 text-[15px] font-semibold rounded-xl backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 tracking-tight">
                Villa Ara
              </Button>
            </Link>
            <Link href={`${basePath}/satilik?propertyType=yazlik`}>
              <Button size="lg" variant="outline" className="bg-white/8 hover:bg-white/15 text-white border-white/25 hover:border-white/40 px-8 py-6 text-[15px] font-semibold rounded-xl backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 tracking-tight">
                Yazlık Ara
              </Button>
            </Link>
          </div>

          {/* Quick Stats Bar - Corporate Design */}
          <div className="pt-10 border-t border-white/15">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1.5 tracking-tight">800K+</div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Başlangıç Fiyatı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1.5 tracking-tight">2.5M+</div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-300 mb-1.5 tracking-tight">%15</div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Yıllık Artış</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-300 mb-1.5 tracking-tight">24/7</div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Destek</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-20">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
