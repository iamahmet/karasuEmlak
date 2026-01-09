'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { GoogleMapsLoader } from './GoogleMapsLoader';

export interface HospitalLocation {
  name: string;
  address: string;
  type: 'hastane' | 'saglik-merkezi' | 'ozel-saglik';
  phone?: string;
}

interface HospitalsMapProps {
  hospitals: HospitalLocation[];
  center?: { lat: number; lng: number };
  className?: string;
  height?: string;
}

// Geocoding helper - basit adres parsing (gerçek projede API kullanılmalı)
function geocodeAddress(address: string, defaultCenter: { lat: number; lng: number }): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve(defaultCenter);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address, region: 'TR' }, (results: any[] | null, status: string) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      } else {
        resolve(defaultCenter);
      }
    });
  });
}

export function HospitalsMap({ 
  hospitals, 
  center = { lat: 41.0969, lng: 30.6906 }, // Karasu default
  className = '',
  height = '500px'
}: HospitalsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isInitialized = false;

    const initMap = async () => {
      if (isInitialized || !mapRef.current) {
        return;
      }

      // Wait for Google Maps to be fully available
      if (!window.google?.maps || !window.google.maps.Map) {
        return;
      }

      isInitialized = true;

      try {
        // Professional map styling
        const mapStyles = [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }, { lightness: 17 }],
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
          },
        ];

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: mapStyles,
          gestureHandling: 'cooperative',
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Geocode and add markers for each hospital
        const bounds = new window.google.maps.LatLngBounds();
        let geocodedCount = 0;

        for (const hospital of hospitals) {
          try {
            const location = await geocodeAddress(hospital.address, center);
            bounds.extend(location);

            // Marker color based on type
            const markerColor = 
              hospital.type === 'hastane' ? '#dc2626' : // red
              hospital.type === 'saglik-merkezi' ? '#2563eb' : // blue
              '#9333ea'; // purple

            const marker = new window.google.maps.Marker({
              position: location,
              map,
              title: hospital.name,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              },
            });

            // Info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">
                    ${hospital.name}
                  </h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                    <strong>Adres:</strong> ${hospital.address}
                  </p>
                  ${hospital.phone ? `
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      <strong>Telefon:</strong> 
                      <a href="tel:${hospital.phone.replace(/\s/g, '')}" style="color: #2563eb; text-decoration: none;">
                        ${hospital.phone}
                      </a>
                    </p>
                  ` : ''}
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
            geocodedCount++;
          } catch (err) {
            console.warn(`Failed to geocode ${hospital.name}:`, err);
          }
        }

        // Fit bounds if we have markers
        if (geocodedCount > 0 && markersRef.current.length > 0) {
          if (markersRef.current.length === 1) {
            map.setCenter(bounds.getCenter());
            map.setZoom(15);
          } else {
            map.fitBounds(bounds);
            // Don't zoom in too much
            const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
              if (map.getZoom() && map.getZoom() > 16) {
                map.setZoom(16);
              }
              window.google.maps.event.removeListener(listener);
            });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Harita yüklenirken bir hata oluştu');
        setIsLoading(false);
      }
    };

    // Function to check and initialize map
    const checkAndInit = () => {
      if (typeof window !== 'undefined' && window.google?.maps && window.google.maps.Map && mapRef.current) {
        if (checkInterval) clearInterval(checkInterval);
        initMap();
      }
    };

    // If Google Maps is already loaded, initialize immediately
    if (typeof window !== 'undefined' && window.google?.maps && window.google.maps.Map && mapRef.current) {
      checkAndInit();
    } else {
      // Wait for Google Maps to be available
      checkInterval = setInterval(checkAndInit, 100);

      // Timeout after 15 seconds
      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        if (typeof window === 'undefined' || !window.google?.maps || !window.google.maps.Map) {
          setError('Google Maps yüklenemedi. Lütfen sayfayı yenileyin veya internet bağlantınızı kontrol edin.');
          setIsLoading(false);
        }
      }, 15000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
      isInitialized = false;
    };
  }, [hospitals, center]);

  if (error) {
    return (
      <div 
        className={`rounded-lg overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const handleMapsLoad = () => {
    // Trigger map initialization when Google Maps is loaded
    // The useEffect will handle the actual initialization
  };

  return (
    <GoogleMapsLoader onLoad={handleMapsLoad}>
      <div 
        ref={mapRef} 
        className={`rounded-lg overflow-hidden border border-gray-200 shadow-lg relative ${className}`}
        style={{ height, minHeight: height }}
      >
        {isLoading && !error && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center z-10">
            <div className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#006AFF] mx-auto mb-3"></div>
              <p className="text-slate-600 text-sm font-medium">Harita yükleniyor...</p>
            </div>
          </div>
        )}
      </div>
    </GoogleMapsLoader>
  );
}
