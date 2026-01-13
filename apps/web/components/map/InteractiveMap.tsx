"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Home, TrendingUp, Filter, X, Square, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { ListingImage } from "@/components/images";
import { demoListings } from "@/lib/demo-listings";
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";

// Lazy load map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Listing {
  id: string;
  title: string;
  slug: string;
  location_neighborhood: string;
  location_district?: string;
  coordinates_lat: string;
  coordinates_lng: string;
  price_amount: string;
  status: string;
  property_type?: string;
  images?: Array<{ public_id: string; url?: string; alt?: string }>;
  features?: {
    sizeM2?: number;
    rooms?: number;
    bathrooms?: number;
  };
}

interface InteractiveMapProps {
  listings: Listing[];
  basePath?: string;
  height?: string;
}

// Convert demo listings to map format
const mapDemoListings: Listing[] = demoListings.map(listing => ({
  id: listing.id,
  title: listing.title,
  slug: listing.slug,
  location_neighborhood: listing.location_neighborhood,
  location_district: listing.location_district,
  coordinates_lat: listing.coordinates_lat,
  coordinates_lng: listing.coordinates_lng,
  price_amount: listing.price_amount,
  status: listing.status,
  property_type: listing.property_type,
  images: listing.images.map(img => ({
    public_id: img.public_id,
    url: img.url,
    alt: img.alt,
  })),
  features: listing.features,
}));

export function InteractiveMap({ listings, basePath = "", height = "600px" }: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showList, setShowList] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const mapInitializedRef = useRef(false);
  const mapKeyRef = useRef(`interactive-map-${Math.random().toString(36).substring(2, 11)}`);

  // Use demo listings if no real listings
  const allListings = listings.length > 0 ? listings : mapDemoListings;

  useEffect(() => {
    // Only set mounted once, prevent double initialization
    if (!mounted) {
      setMounted(true);
    }
    
    // Load Leaflet CSS only once
    if (typeof document !== 'undefined') {
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    }

    // Only allow map rendering if not already initialized (React Strict Mode protection)
    // Use a more robust check that persists across re-renders
    if (mounted && !mapInitializedRef.current) {
      // Check if container exists and doesn't have a map yet
      if (mapContainerRef.current && !mapContainerRef.current.querySelector('.leaflet-container')) {
        // Use requestAnimationFrame to ensure DOM is ready and avoid double initialization
        const rafId = requestAnimationFrame(() => {
          // Double-check after RAF to ensure no race conditions
          if (!mapInitializedRef.current && mapContainerRef.current && !mapContainerRef.current.querySelector('.leaflet-container')) {
            mapInitializedRef.current = true;
            setShouldRenderMap(true);
          }
        });
        
        return () => {
          cancelAnimationFrame(rafId);
        };
      }
    }

    // Cleanup function to remove map instance on unmount
    return () => {
      if (mapContainerRef.current) {
        // Clear any existing map instances from the container
        const container = mapContainerRef.current;
        if (container) {
          // Remove all Leaflet map instances
          const leafletContainer = container.querySelector('.leaflet-container');
          if (leafletContainer) {
            try {
              // @ts-ignore - Leaflet global
              if (typeof window !== 'undefined' && window.L) {
                const L = window.L;
                const map = (leafletContainer as any)._leaflet_id ? L.Map.prototype.getContainer.call({ _container: leafletContainer }) : null;
                if (map && typeof map.remove === 'function') {
                  map.remove();
                }
              }
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        }
      }
      mapInstanceRef.current = null;
      isInitializingRef.current = false;
      // Don't reset mapInitializedRef here - we want it to persist across Strict Mode re-renders
    };
  }, [mounted]);

  useEffect(() => {
    let filtered = allListings;

    if (statusFilter) {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    setFilteredListings(filtered);
    
    // Auto-select first listing if none selected
    if (!selectedListing && filtered.length > 0) {
      setSelectedListing(filtered[0]);
    }
  }, [statusFilter, allListings]);

  const clearFilters = () => {
    setStatusFilter(null);
  };

  // Karasu center coordinates - adjusted to show all listings better
  const center: [number, number] = [41.0965, 30.7860];

  if (!mounted) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="w-full bg-gray-100 rounded-2xl flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-500 font-medium">Harita yükleniyor...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">İnteraktif Harita</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Haritada Keşfedin
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Karasu'daki tüm ilanları harita üzerinde görüntüleyin ve konuma göre arama yapın
            </p>
          </div>

          {/* Filters and Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500 stroke-[1.5]" />
                <span className="text-[14px] font-semibold text-gray-700">Filtreler:</span>
              </div>

              <button
                onClick={() => setStatusFilter(statusFilter === 'satilik' ? null : 'satilik')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[14px] font-semibold transition-all duration-200",
                  statusFilter === 'satilik'
                    ? "bg-[#006AFF] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Home className="h-3.5 w-3.5 inline-block mr-1.5 stroke-[1.5]" />
                Satılık ({allListings.filter(l => l.status === 'satilik').length})
              </button>

              <button
                onClick={() => setStatusFilter(statusFilter === 'kiralik' ? null : 'kiralik')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[14px] font-semibold transition-all duration-200",
                  statusFilter === 'kiralik'
                    ? "bg-[#00A862] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5 inline-block mr-1.5 stroke-[1.5]" />
                Kiralık ({allListings.filter(l => l.status === 'kiralik').length})
              </button>

              {statusFilter && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                >
                  <X className="h-3.5 w-3.5 inline-block mr-1.5 stroke-[1.5]" />
                  Temizle
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[14px] text-gray-600 font-medium">
                {filteredListings.length} ilan gösteriliyor
              </span>
              <button
                onClick={() => setShowList(!showList)}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
              >
                {showList ? 'Listeyi Gizle' : 'Listeyi Göster'}
              </button>
            </div>
          </div>

          {/* Map and List Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <SectionErrorBoundary
                sectionName="İnteraktif Harita"
                fallback={
                  <div 
                    className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-gray-50 flex items-center justify-center" 
                    style={{ height }}
                  >
                    <div className="text-center p-8">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Harita şu anda yüklenemiyor</p>
                      <p className="text-sm text-gray-400 mt-2">Sayfayı yenileyerek tekrar deneyebilirsiniz</p>
                    </div>
                  </div>
                }
              >
                <div 
                  ref={mapContainerRef}
                  className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg" 
                  style={{ height }}
                >
                  {shouldRenderMap && (() => {
                    // Final check before rendering - prevent double initialization
                    if (mapContainerRef.current?.querySelector('.leaflet-container')) {
                      return null;
                    }
                    try {
                      return (
                        <MapContainer
                          key={mapKeyRef.current}
                          center={center}
                          zoom={13}
                          minZoom={11}
                          maxZoom={18}
                          style={{ height: '100%', width: '100%' }}
                          className="z-10"
                        >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {filteredListings.map((listing) => {
                    if (!listing.coordinates_lat || !listing.coordinates_lng) return null;

                    const position: [number, number] = [
                      parseFloat(listing.coordinates_lat),
                      parseFloat(listing.coordinates_lng)
                    ];

                    return (
                      <Marker 
                        key={listing.id} 
                        position={position}
                        eventHandlers={{
                          click: () => setSelectedListing(listing),
                        }}
                      >
                        <Popup>
                          <div className="p-3 min-w-[220px]">
                            {/* Image */}
                            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
                              {listing.images?.[0]?.url || listing.images?.[0]?.public_id ? (
                                listing.images[0].url ? (
                                  <img
                                    src={listing.images[0].url}
                                    alt={listing.images[0].alt || listing.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : listing.images[0].public_id ? (
                                  <ListingImage
                                    publicId={listing.images[0].public_id}
                                    alt={listing.images[0].alt || listing.title}
                                    className="w-full h-full object-cover"
                                    sizes="220px"
                                    fallback={getPropertyPlaceholder(listing.property_type || 'daire', listing.status as 'satilik' | 'kiralik', listing.location_neighborhood, 400, 300)}
                                  />
                                ) : null
                              ) : (
                                <img
                                  src={getPropertyPlaceholder(listing.property_type || 'daire', listing.status as 'satilik' | 'kiralik', listing.location_neighborhood, 400, 300)}
                                  alt={listing.title}
                                  className="w-full h-full object-cover opacity-80"
                                  loading="lazy"
                                />
                              )}
                              <div className={cn(
                                "absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white",
                                listing.status === 'satilik' 
                                  ? 'bg-[#006AFF]' 
                                  : 'bg-[#00A862]'
                              )}>
                                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                              </div>
                            </div>
                            {!listing.images?.[0] && (
                              <div className={cn(
                                "inline-block px-2 py-1 rounded text-[11px] font-bold mb-2",
                                listing.status === 'satilik' 
                                  ? 'bg-[#006AFF] text-white' 
                                  : 'bg-[#00A862] text-white'
                              )}>
                                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                              </div>
                            )}
                            <h3 className="font-bold text-[15px] text-gray-900 mb-2 line-clamp-2">
                              {listing.title}
                            </h3>
                            <p className="text-[13px] text-gray-600 mb-2 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {listing.location_neighborhood}
                            </p>
                            {listing.features?.sizeM2 && (
                              <p className="text-[12px] text-gray-500 mb-2 flex items-center gap-1">
                                <Square className="h-3 w-3" />
                                {listing.features.sizeM2} m²
                                {listing.features.rooms && ` • ${listing.features.rooms} Oda`}
                              </p>
                            )}
                            <p className="text-[17px] font-bold text-[#006AFF] mb-3">
                              ₺{new Intl.NumberFormat('tr-TR').format(parseFloat(listing.price_amount))}
                              {listing.status === 'kiralik' && <span className="text-[13px] font-normal text-gray-500">/ay</span>}
                            </p>
                            <Link
                              href={`${basePath}/ilan/${listing.slug}`}
                              className="block w-full text-center px-3 py-2 bg-[#006AFF] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0052CC] transition-colors"
                            >
                              Detayları Gör
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                        </MapContainer>
                      );
                    } catch (error) {
                      // If MapContainer fails to initialize, return fallback
                      console.error('MapContainer initialization error:', error);
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-center p-8">
                            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Harita yüklenemedi</p>
                          </div>
                        </div>
                      );
                    }
                  })()}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-200 z-[1000]">
                  <div className="text-[12px] font-bold text-gray-900 mb-2">
                    Harita Göstergeleri
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#006AFF] rounded-full" />
                      <span className="text-[11px] text-gray-600">Satılık</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#00A862] rounded-full" />
                      <span className="text-[11px] text-gray-600">Kiralık</span>
                    </div>
                  </div>
                </div>
                </div>
              </SectionErrorBoundary>

              {/* Quick Stats Below Map */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xl font-bold text-[#006AFF] leading-none mb-1">
                    {allListings.filter(l => l.status === 'satilik').length}
                  </div>
                  <div className="text-[12px] text-gray-600 font-medium">Satılık İlan</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-xl font-bold text-[#00A862] leading-none mb-1">
                    {allListings.filter(l => l.status === 'kiralik').length}
                  </div>
                  <div className="text-[12px] text-gray-600 font-medium">Kiralık İlan</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-xl font-bold text-purple-600 leading-none mb-1">
                    {new Set(allListings.map(l => l.location_neighborhood)).size}
                  </div>
                  <div className="text-[12px] text-gray-600 font-medium">Mahalle</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-xl font-bold text-orange-600 leading-none mb-1">
                    {allListings.length}
                  </div>
                  <div className="text-[12px] text-gray-600 font-medium">Toplam İlan</div>
                </div>
              </div>
            </div>

            {/* List Sidebar - Shows on desktop, can toggle */}
            {showList && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-[600px] flex flex-col">
                  {/* List Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      İlanlar ({filteredListings.length})
                    </h3>
                    <p className="text-[13px] text-gray-600">
                      Haritadaki işaretlere tıklayarak detayları görüntüleyin
                    </p>
                  </div>

                  {/* List Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredListings.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Filtre kriterlerine uygun ilan bulunamadı</p>
                      </div>
                    ) : (
                      filteredListings.map((listing) => {
                        const mainImage = listing.images?.[0];
                        const isSelected = selectedListing?.id === listing.id;
                        const fallbackImageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80";

                        return (
                          <Link
                            key={listing.id}
                            href={`${basePath}/ilan/${listing.slug}`}
                            onClick={() => setSelectedListing(listing)}
                            className={cn(
                              "block p-3 rounded-lg border-2 transition-all duration-200",
                              isSelected
                                ? "border-[#006AFF] bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-[#006AFF]/40 hover:shadow-md"
                            )}
                          >
                            <div className="flex gap-3">
                              {/* Image */}
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                {mainImage?.url ? (
                                  <img
                                    src={mainImage.url}
                                    alt={mainImage.alt || listing.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : mainImage?.public_id ? (
                                  <ListingImage
                                    publicId={mainImage.public_id}
                                    alt={mainImage.alt || listing.title}
                                    className="w-full h-full object-cover"
                                    sizes="80px"
                                    fallback={fallbackImageUrl}
                                  />
                                ) : (
                                  <img
                                    src={fallbackImageUrl}
                                    alt={listing.title}
                                    className="w-full h-full object-cover opacity-60"
                                    loading="lazy"
                                  />
                                )}
                                <div className={cn(
                                  "absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                                  listing.status === 'satilik' ? 'bg-[#006AFF]' : 'bg-[#00A862]'
                                )}>
                                  {listing.status === 'satilik' ? 'Sat' : 'Kir'}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                                  {listing.title}
                                </h4>
                                <p className="text-[12px] text-gray-600 mb-2 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{listing.location_neighborhood}</span>
                                </p>
                                {listing.features && (
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                                    {listing.features.sizeM2 && (
                                      <span className="flex items-center gap-1">
                                        <Square className="h-3 w-3" />
                                        {listing.features.sizeM2}m²
                                      </span>
                                    )}
                                    {listing.features.rooms && (
                                      <span>{listing.features.rooms} Oda</span>
                                    )}
                                  </div>
                                )}
                                <div className="text-[15px] font-bold text-[#006AFF]">
                                  ₺{new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(parseFloat(listing.price_amount))}
                                  {listing.status === 'kiralik' && <span className="text-[11px] font-normal text-gray-500">/ay</span>}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  {/* List Footer */}
                  <div className="p-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      className="w-full bg-[#006AFF] hover:bg-[#0052CC] text-white text-[13px] font-semibold"
                      asChild
                    >
                      <Link href={`${basePath}/haritada-goruntule`}>
                        Tüm İlanları Haritada Gör
                        <ArrowRight className="h-4 w-4 ml-2 stroke-[1.5]" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
