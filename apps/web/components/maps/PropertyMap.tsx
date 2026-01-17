'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@karasu/ui';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
  className?: string;
}

export function PropertyMap({ latitude, longitude, title, address, className }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || !window.google) {
      setIsLoading(false);
      return;
    }

    try {
      // Professional map styling - Corporate Premium
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
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 18 }],
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 16 }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#dedede' }, { lightness: 21 }],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
        },
        {
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#f2f2f2' }, { lightness: 19 }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [{ color: '#fefefe' }, { lightness: 20 }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }],
        },
      ];

      // Initialize map with professional styling
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [
            window.google.maps.MapTypeId.ROADMAP,
            window.google.maps.MapTypeId.SATELLITE,
            window.google.maps.MapTypeId.HYBRID,
          ],
        },
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        styles: mapStyles,
        disableDefaultUI: false,
        gestureHandling: 'cooperative',
      });

      mapInstanceRef.current = map;

      // Professional custom marker icon
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: title || address || 'Emlak Konumu',
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#006AFF',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 4,
          anchor: new window.google.maps.Point(0, 0),
        },
        optimized: true,
      });

      markerRef.current = marker;

      // Enhanced info window with better styling
      if (title || address) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: 'Inter', sans-serif; max-width: 250px;">
              ${title ? `<h3 style="margin: 0 0 8px 0; font-weight: 700; font-size: 16px; color: #1a1a1a; line-height: 1.4;">${title}</h3>` : ''}
              ${address ? `
                <div style="display: flex; align-items: start; gap: 6px; margin-bottom: 8px;">
                  <svg style="width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; color: #666;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">${address}</p>
                </div>
              ` : ''}
              <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; background: #006AFF; color: white; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 8px;">
                <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Yol Tarifi Al
              </a>
            </div>
          `,
          maxWidth: 300,
        });

        // Open info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Open by default
        infoWindow.open(map, marker);
      }

      // Professional circle to show approximate area
      new window.google.maps.Circle({
        strokeColor: '#006AFF',
        strokeOpacity: 0.5,
        strokeWeight: 2.5,
        fillColor: '#006AFF',
        fillOpacity: 0.08,
        map,
        center: { lat: latitude, lng: longitude },
        radius: 300, // 300 meters radius for better visibility
      });

      setIsLoading(false);
      setMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }
  }, [latitude, longitude, title, address]);

  const recenterMap = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
      mapInstanceRef.current.setZoom(16);
      // Bounce marker
      markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        markerRef.current.setAnimation(null);
      }, 2000);
    }
  };

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // Check if window is available (client-side only)
  if (typeof window === 'undefined' || !window.google) {
    return (
      <div className={className || 'w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center'}>
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-[#006AFF] mx-auto mb-4"></div>
          <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-medium">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={className || 'w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden min-h-[400px]'}
      />
      
      {/* Professional Map controls overlay */}
      {mapReady && (
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          <Button
            onClick={recenterMap}
            variant="outline"
            size="sm"
            className="bg-white/95 backdrop-blur-md shadow-xl border-slate-200/80 hover:bg-white hover:shadow-2xl transition-all duration-200 rounded-xl px-4 py-2.5 font-semibold text-sm"
          >
            <Navigation className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
            Konuma Dön
          </Button>
          <Button
            onClick={openDirections}
            variant="outline"
            size="sm"
            className="bg-[#006AFF]/95 backdrop-blur-md text-white shadow-xl border-[#006AFF] hover:bg-[#0052CC] hover:shadow-2xl transition-all duration-200 rounded-xl px-4 py-2.5 font-semibold text-sm"
          >
            <MapPin className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
            Yol Tarifi
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-t-3 border-[#006AFF] absolute top-0 left-0"></div>
            </div>
            <p className="text-sm font-semibold text-slate-700 tracking-tight">Harita yükleniyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: any;
  }
}

