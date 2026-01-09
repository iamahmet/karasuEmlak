"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Home, Key, Sparkles } from "lucide-react";
import { AdvancedSearchPanel } from "@/components/search/AdvancedSearchPanel";

interface HeroSectionProps {
  basePath?: string;
}

export function PremiumHeroSection({ basePath = "" }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<'satilik' | 'kiralik'>('satilik');

  const stats = [
    { value: "500+", label: "Aktif İlan", icon: Home },
    { value: "1000+", label: "Mutlu Müşteri", icon: Sparkles },
    { value: "15", label: "Yıllık Tecrübe", icon: TrendingUp },
  ];

  const quickLinks = [
    { label: "Denize Sıfır", href: `${basePath}/satilik?deniz_manzarasi=true`, badge: "Popüler" },
    { label: "Yeni İlanlar", href: `${basePath}/satilik?sort=newest`, badge: "Yeni" },
    { label: "Fırsat Fiyatlar", href: `${basePath}/satilik?sort=price_asc`, badge: "Fırsat" },
    { label: "Lüks Villalar", href: `${basePath}/satilik?tip=villa`, badge: "Premium" },
  ];

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-8 sm:py-12 md:py-16 lg:py-20">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center mb-10">
            {/* Badge */}
            <div className="inline-block mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                <Sparkles className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
                <span className="text-[13px] font-semibold text-[#006AFF] tracking-[-0.01em]">
                  Karasu'nun En Güvenilir Emlak Platformu
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight mb-4 md:mb-6 px-2">
              Hayalinizdeki Evi
              <br />
              <span className="text-[#006AFF]">Karasu'da Bulun</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-[17px] md:text-[18px] lg:text-[20px] text-gray-600 leading-[1.6] md:leading-[1.65] mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Denize sıfır villalardan şehir merkezindeki dairelere, 
              <span className="font-semibold text-gray-900"> 500+ aktif ilan</span> arasından size en uygun seçeneği keşfedin
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-blue-50 rounded-lg md:rounded-xl">
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-[#006AFF] stroke-[1.5]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-none mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-[13px] text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 sm:p-6 md:p-8">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-gray-100 rounded-xl w-full sm:w-fit mx-auto">
                <button
                  onClick={() => setActiveTab('satilik')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ${
                    activeTab === 'satilik'
                      ? 'bg-white text-[#006AFF] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline-block mr-1.5 sm:mr-2 stroke-[1.5]" />
                  Satılık
                </button>
                <button
                  onClick={() => setActiveTab('kiralik')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ${
                    activeTab === 'kiralik'
                      ? 'bg-white text-[#006AFF] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline-block mr-1.5 sm:mr-2 stroke-[1.5]" />
                  Kiralık
                </button>
              </div>

              {/* Advanced Search Panel */}
              <div className="relative z-20">
                <AdvancedSearchPanel basePath={basePath} />
              </div>

              {/* Quick Links */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 justify-center">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 stroke-[1.5]" />
                  <span className="text-xs sm:text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                    Popüler Aramalar
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group relative px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#006AFF] rounded-lg text-xs sm:text-[14px] font-medium text-gray-700 hover:text-[#006AFF] transition-all duration-200 hover:scale-105"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-[#006AFF] text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-[13px] text-gray-600 px-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Ücretsiz Danışmanlık</span>
            </div>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="font-medium">500+ Aktif İlan</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="font-medium">7/24 WhatsApp Destek</span>
            <span className="text-gray-300 hidden md:inline">•</span>
            <span className="font-medium">15 Yıllık Tecrübe</span>
          </div>
        </div>
      </div>
    </section>
  );
}
