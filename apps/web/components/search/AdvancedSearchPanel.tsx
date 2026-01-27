"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Search, SlidersHorizontal, X, MapPin, Home, DollarSign, Maximize2 } from "lucide-react";
import { cn } from "@karasu/lib";
import Link from "next/link";
import { NeighborhoodAutocomplete } from "./NeighborhoodAutocomplete";
import { trackHomepageEvent } from "@/lib/analytics/events";

interface AdvancedSearchPanelProps {
  basePath?: string;
  neighborhoods?: string[];
}

export function AdvancedSearchPanel({ basePath = "", neighborhoods = [] }: AdvancedSearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: 'satilik',
    propertyType: '',
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    rooms: '',
  });

  const propertyTypes = [
    { value: 'daire', label: 'Daire', icon: '🏢' },
    { value: 'villa', label: 'Villa', icon: '🏡' },
    { value: 'yazlik', label: 'Yazlık', icon: '🏖️' },
    { value: 'arsa', label: 'Arsa', icon: '📐' },
  ];

  // Use neighborhoods from props, fallback to popular ones
  const availableNeighborhoods = neighborhoods.length > 0 
    ? neighborhoods 
    : ['Merkez', 'Sahil', 'Liman', 'Çamlık', 'Yeni Mahalle'];

  const roomOptions = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'];

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return `${basePath}/arama?${params.toString()}`;
  };

  return (
    <div className="glass rounded-2xl border-2 border-white/40 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Shine effect */}
      <div className="absolute inset-0 shine-effect opacity-30" />

      <div className="relative z-10">
        {/* Quick Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 p-1 bg-white rounded-xl shadow-sm">
            <button
              onClick={() => setFilters({ ...filters, status: 'satilik' })}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg text-[15px] font-semibold tracking-[-0.011em]",
                "transition-all duration-200",
                filters.status === 'satilik'
                  ? "bg-[#006AFF] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Home className="h-4 w-4 inline-block mr-2 stroke-[2]" />
              Satılık
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'kiralik' })}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg text-[15px] font-semibold tracking-[-0.011em]",
                "transition-all duration-200",
                filters.status === 'kiralik'
                  ? "bg-[#00A862] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <DollarSign className="h-4 w-4 inline-block mr-2 stroke-[2]" />
              Kiralık
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold text-[15px]",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isExpanded
                ? "bg-[#006AFF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            aria-label={isExpanded ? "Gelişmiş filtreleri kapat" : "Gelişmiş filtreleri aç"}
            aria-expanded={isExpanded ? "true" : "false"}
          >
            <SlidersHorizontal className="h-5 w-5 stroke-[2]" />
          </button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
            {/* Property Type */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Emlak Tipi
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilters({ ...filters, propertyType: filters.propertyType === type.value ? '' : type.value })}
                    className={cn(
                      "px-4 py-3 rounded-lg text-[14px] font-semibold",
                      "transition-all duration-200",
                      "border-2",
                      filters.propertyType === type.value
                        ? "border-[#006AFF] bg-blue-50 text-[#006AFF]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Neighborhood with Autocomplete */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 inline-block mr-1 stroke-[2]" />
                Mahalle
              </label>
              <NeighborhoodAutocomplete
                value={filters.neighborhood}
                onChange={(value) => {
                  setFilters({ ...filters, neighborhood: value });
                  if (value) {
                    trackHomepageEvent.filterApplied(`neighborhood:${value}`);
                  }
                }}
                neighborhoods={neighborhoods}
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Min Fiyat
                </label>
                <input
                  type="number"
                  placeholder="₺ 0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-medium focus:border-[#006AFF] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Max Fiyat
                </label>
                <input
                  type="number"
                  placeholder="₺ ∞"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-medium focus:border-[#006AFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Size Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Min m²
                </label>
                <input
                  type="number"
                  placeholder="0 m²"
                  value={filters.minSize}
                  onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-medium focus:border-[#006AFF] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Max m²
                </label>
                <input
                  type="number"
                  placeholder="∞ m²"
                  value={filters.maxSize}
                  onChange={(e) => setFilters({ ...filters, maxSize: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-medium focus:border-[#006AFF] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Rooms */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Oda Sayısı
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {roomOptions.map((room) => (
                  <button
                    key={room}
                    onClick={() => setFilters({ ...filters, rooms: filters.rooms === room ? '' : room })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[14px] font-semibold",
                      "transition-all duration-200",
                      "border-2",
                      filters.rooms === room
                        ? "border-[#006AFF] bg-blue-50 text-[#006AFF]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-[#006AFF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          asChild
        >
          <Link href={buildSearchUrl()}>
            <Search className="h-5 w-5 mr-2 stroke-[2]" />
            {Object.values(filters).filter(Boolean).length > 1 
              ? `${Object.values(filters).filter(Boolean).length - 1} Filtre ile Ara` 
              : 'İlan Ara'
            }
          </Link>
        </Button>

        {/* Quick Stats */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[13px] text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">500+ Aktif İlan</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="font-medium">Ücretsiz Danışmanlık</span>
          <span className="text-gray-300">•</span>
          <span className="font-medium">Anında Sonuç</span>
        </div>
      </div>
    </div>
  );
}

