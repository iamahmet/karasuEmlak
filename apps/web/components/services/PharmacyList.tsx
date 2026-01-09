'use client';

/**
 * Enhanced Pharmacy List Component
 * Displays on-duty pharmacies with search, filter, map view, and sorting
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Phone, MapPin, Clock, ExternalLink, RefreshCw, AlertCircle, Search, Filter, Map, List, Navigation, Share2, MessageCircle, X } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchWithRetry } from '@/lib/utils/api-client';
import { GoogleMapsLoader } from '@/components/maps/GoogleMapsLoader';
import Script from 'next/script';

export interface Pharmacy {
  id?: string;
  name: string;
  address: string;
  phone: string | null;
  district: string;
  city: string;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isOnDuty: boolean;
  dutyDate?: string | null;
  dutyStartTime?: string | null;
  dutyEndTime?: string | null;
  source?: string;
  verified?: boolean;
}

interface PharmacyListProps {
  city?: string;
  district?: string;
  className?: string;
}

type ViewMode = 'list' | 'map';
type SortOption = 'name' | 'distance' | 'verified';

export function PharmacyList({ 
  city = 'Sakarya', 
  district = 'Karasu',
  className = '' 
}: PharmacyListProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const fetchPharmacies = async (skipCache = false) => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const cacheParam = skipCache ? '&cache=false' : '';
      const response = await fetchWithRetry<Pharmacy[]>(
        `/api/services/pharmacy?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}${cacheParam}`
      );

      if (response.success && response.data) {
        setPharmacies(response.data as Pharmacy[]);
        setLastUpdated(new Date());
      } else {
        setError('Nöbetçi eczane bilgileri alınamadı');
      }
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      if (process.env.NODE_ENV === 'development') {
        console.error('Pharmacy fetch error:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [city, district]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && viewMode === 'map') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Silent fail - user location not required
        }
      );
    }
  }, [viewMode]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPharmacies(true);
  };

  // Filter and sort pharmacies
  const filteredAndSortedPharmacies = useMemo(() => {
    let filtered = pharmacies;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          (p.neighborhood && p.neighborhood.toLowerCase().includes(query)) ||
          (p.phone && p.phone.includes(query))
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'tr');
      }
      if (sortBy === 'verified') {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return a.name.localeCompare(b.name, 'tr');
      }
      if (sortBy === 'distance' && userLocation) {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.latitude || 0,
          a.longitude || 0
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.latitude || 0,
          b.longitude || 0
        );
        return distA - distB;
      }
      return 0;
    });

    return sorted;
  }, [pharmacies, searchQuery, sortBy, userLocation]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    if (!lat2 || !lng2) return Infinity;
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const handleShare = async (pharmacy: Pharmacy) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pharmacy.name} - Nöbetçi Eczane`,
          text: `${pharmacy.name}\n${pharmacy.address}\nTelefon: ${pharmacy.phone || 'Yok'}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${pharmacy.name}\n${pharmacy.address}\nTelefon: ${pharmacy.phone || 'Yok'}`;
      await navigator.clipboard.writeText(text);
      alert('Eczane bilgileri panoya kopyalandı!');
    }
  };

  const handleWhatsApp = (pharmacy: Pharmacy) => {
    if (pharmacy.phone) {
      const phone = pharmacy.phone.replace(/\s/g, '').replace(/^0/, '90');
      const message = encodeURIComponent(`Merhaba, ${pharmacy.name} nöbetçi eczane hakkında bilgi almak istiyorum.`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <LoadingState 
          message="Nöbetçi eczaneler yükleniyor..." 
          variant="skeleton"
          skeletonCount={3}
        />
      </div>
    );
  }

  if (error && pharmacies.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={AlertCircle}
          title="Nöbetçi Eczane Bilgisi Bulunamadı"
          description={error}
          action={{
            label: 'Yenile',
            onClick: handleRefresh,
          }}
        />
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={MapPin}
          title="Nöbetçi Eczane Bulunamadı"
          description={`${district} ilçesinde bugün için nöbetçi eczane kaydı bulunmamaktadır. Lütfen Türk Eczacıları Birliği'nin 444 0 332 numaralı hattını arayarak güncel bilgi alabilirsiniz.`}
          action={{
            label: 'Yenile',
            onClick: handleRefresh,
          }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Nöbetçi Eczaneler
              <span className="ml-3 text-lg font-normal text-gray-500">
                ({filteredAndSortedPharmacies.length})
              </span>
            </h2>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                aria-label="Liste görünümü"
                title="Liste görünümü"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                aria-label="Harita görünümü"
                title="Harita görünümü"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Eczane ara (isim, adres, mahalle)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Aramayı temizle"
                title="Aramayı temizle"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtrele
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Sıralama</span>
              <button
                onClick={() => setShowFilters(false)}
                aria-label="Filtreleri kapat"
                title="Filtreleri kapat"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sortBy === 'name'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                İsme Göre
              </button>
              {userLocation && (
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    sortBy === 'distance'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Navigation className="h-3 w-3 inline mr-1" />
                  Mesafeye Göre
                </button>
              )}
              <button
                onClick={() => setSortBy('verified')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sortBy === 'verified'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Doğrulanmış
              </button>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && pharmacies.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">{error}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Aşağıdaki bilgiler önbellekten gösterilmektedir.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content: List or Map */}
      {viewMode === 'list' ? (
        <>
          {filteredAndSortedPharmacies.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Sonuç Bulunamadı"
              description="Arama kriterlerinize uygun eczane bulunamadı."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedPharmacies.map((pharmacy) => {
                const distance = userLocation && pharmacy.latitude && pharmacy.longitude
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      pharmacy.latitude,
                      pharmacy.longitude
                    )
                  : null;

                return (
                  <div
                    key={pharmacy.id || pharmacy.name}
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 pr-2 flex-1">
                        {pharmacy.name}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        {pharmacy.isOnDuty && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Nöbetçi
                          </span>
                        )}
                        {pharmacy.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ✓ Doğrulanmış
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Distance badge */}
                    {distance !== null && (
                      <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                        <Navigation className="h-3 w-3" />
                        <span>{distance.toFixed(1)} km uzaklıkta</span>
                      </div>
                    )}

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-3 flex-1">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {pharmacy.address}
                        {pharmacy.neighborhood && (
                          <span className="text-gray-500"> • {pharmacy.neighborhood}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pharmacy.phone && (
                        <>
                          <a
                            href={`tel:${pharmacy.phone.replace(/\s/g, '')}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm flex-1 justify-center"
                          >
                            <Phone className="h-4 w-4" />
                            Ara
                          </a>
                          <button
                            onClick={() => handleWhatsApp(pharmacy)}
                            aria-label="WhatsApp ile iletişime geç"
                            title="WhatsApp"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleShare(pharmacy)}
                        aria-label="Eczane bilgilerini paylaş"
                        title="Paylaş"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Duty info */}
                    {(pharmacy.dutyDate || pharmacy.dutyStartTime) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <Clock className="h-3 w-3" />
                        <span>
                          {pharmacy.dutyDate && formatDate(pharmacy.dutyDate)}
                          {pharmacy.dutyStartTime && pharmacy.dutyEndTime && (
                            <span className="ml-1">
                              {' '}
                              {formatTime(pharmacy.dutyStartTime)} - {formatTime(pharmacy.dutyEndTime)}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Map link */}
                    {pharmacy.latitude && pharmacy.longitude && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <a
                          href={`https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Haritada göster
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <PharmacyMapView
          pharmacies={filteredAndSortedPharmacies}
          userLocation={userLocation}
          onMapReady={() => setMapReady(true)}
        />
      )}

      {/* Info footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Nöbetçi eczane bilgileri günlük olarak değişmektedir. 
          Acil durumlarda lütfen telefon ile doğrulayın. 
          Güncel bilgi için Türk Eczacıları Birliği: <strong>444 0 332</strong>
        </p>
      </div>
    </div>
  );
}

// Map View Component
function PharmacyMapView({
  pharmacies,
  userLocation,
  onMapReady,
}: {
  pharmacies: Pharmacy[];
  userLocation: { lat: number; lng: number } | null;
  onMapReady: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    // Default center (Karasu center)
    const center = userLocation || { lat: 41.0969, lng: 30.6906 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: userLocation ? 13 : 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each pharmacy
    pharmacies.forEach((pharmacy) => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: pharmacy.latitude, lng: pharmacy.longitude },
          map,
          title: pharmacy.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${pharmacy.name}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${pharmacy.address}</p>
              ${pharmacy.phone ? `<p style="font-size: 12px; margin-bottom: 4px;"><a href="tel:${pharmacy.phone.replace(/\s/g, '')}" style="color: #006AFF;">${pharmacy.phone}</a></p>` : ''}
              <a href="https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}" target="_blank" style="font-size: 12px; color: #006AFF;">Yol tarifi al</a>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      }
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Konumunuz',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#006AFF',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      markersRef.current.push(userMarker);
    }

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }

    onMapReady();
  }, [pharmacies, userLocation, onMapReady]);

  return (
    <GoogleMapsLoader>
      <div ref={mapRef} className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-gray-200" />
    </GoogleMapsLoader>
  );
}
