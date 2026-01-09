'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AlertCircle } from 'lucide-react';
import type { LatLngExpression } from 'leaflet';

// Dynamic imports for Leaflet (SSR disabled)
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

export interface HospitalLocation {
  name: string;
  address: string;
  type: 'hastane' | 'saglik-merkezi' | 'ozel-saglik';
  phone?: string;
  lat?: number;
  lng?: number;
}

interface HospitalsMapProps {
  hospitals: HospitalLocation[];
  center?: { lat: number; lng: number };
  className?: string;
  height?: string;
}

// Simple geocoding - approximate coordinates for Karasu/Kocaali
function getApproximateCoordinates(address: string, defaultCenter: { lat: number; lng: number }): { lat: number; lng: number } {
  // Try to extract coordinates from address or use default
  // For now, we'll use default center with slight variations
  const variations = [
    { lat: defaultCenter.lat + 0.01, lng: defaultCenter.lng + 0.01 },
    { lat: defaultCenter.lat - 0.01, lng: defaultCenter.lng - 0.01 },
    { lat: defaultCenter.lat + 0.02, lng: defaultCenter.lng },
    { lat: defaultCenter.lat, lng: defaultCenter.lng + 0.02 },
  ];
  
  // Use hash of address to get consistent variation
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variations[hash % variations.length];
}

// Map bounds fitter component (must be inside MapContainer)
// This component uses useMap hook which must be inside MapContainer
const MapBoundsFitter = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMap } = mod;
    return function MapBoundsFitterComponent({ hospitals, center }: { hospitals: HospitalLocation[]; center: { lat: number; lng: number } }) {
      const map = useMap();
      
      useEffect(() => {
        if (!map || hospitals.length === 0) return;
        
        const bounds: LatLngExpression[] = hospitals
          .map(h => {
            if (h.lat && h.lng) {
              return [h.lat, h.lng] as LatLngExpression;
            }
            const coords = getApproximateCoordinates(h.address, center);
            return [coords.lat, coords.lng] as LatLngExpression;
          });
        
        if (bounds.length > 0) {
          if (bounds.length === 1) {
            map.setView(bounds[0] as [number, number], 15);
          } else {
            // @ts-ignore - Leaflet types
            const L = require('leaflet');
            const boundsObj = L.latLngBounds(bounds);
            map.fitBounds(boundsObj, { padding: [50, 50], maxZoom: 16 });
          }
        }
      }, [map, hospitals, center]);
      
      return null;
    };
  }),
  { ssr: false }
);

export function HospitalsMapLeaflet({ 
  hospitals, 
  center = { lat: 41.0969, lng: 30.6906 }, // Karasu default
  className = '',
  height = '500px'
}: HospitalsMapProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
    
    // Load Leaflet CSS
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

    // Mark as initializing to prevent double mount
    if (mounted && !isInitializingRef.current) {
      isInitializingRef.current = true;
    }

    // Cleanup
    return () => {
      if (mapContainerRef.current) {
        const container = mapContainerRef.current;
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
      isInitializingRef.current = false;
    };
  }, [mounted]);

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

  if (!mounted) {
    return (
      <div 
        className={`rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#006AFF] mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm font-medium">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [center.lat, center.lng];

  // Calculate initial bounds
  const allCoords = hospitals.map(h => {
    if (h.lat && h.lng) {
      return [h.lat, h.lng] as [number, number];
    }
    const coords = getApproximateCoordinates(h.address, center);
    return [coords.lat, coords.lng] as [number, number];
  });

  // Determine initial zoom and center
  let initialZoom = 13;
  let initialCenter = mapCenter;
  
  if (allCoords.length > 0) {
    if (allCoords.length === 1) {
      initialCenter = allCoords[0];
      initialZoom = 15;
    } else {
      // Calculate center of all points
      const avgLat = allCoords.reduce((sum, [lat]) => sum + lat, 0) / allCoords.length;
      const avgLng = allCoords.reduce((sum, [, lng]) => sum + lng, 0) / allCoords.length;
      initialCenter = [avgLat, avgLng];
    }
  }

  return (
    <div 
      ref={mapContainerRef}
      className={`rounded-lg overflow-hidden border border-gray-200 shadow-lg relative ${className}`}
      style={{ height, minHeight: height }}
    >
      {mounted && !isInitializingRef.current && (
        <MapContainer
          key="hospitals-map-single-instance"
          center={initialCenter}
          zoom={initialZoom}
          minZoom={11}
          maxZoom={18}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          scrollWheelZoom={true}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsFitter hospitals={hospitals} center={center} />

        {hospitals.map((hospital, index) => {
          const coords = hospital.lat && hospital.lng 
            ? [hospital.lat, hospital.lng] as [number, number]
            : (() => {
                const approx = getApproximateCoordinates(hospital.address, center);
                return [approx.lat, approx.lng] as [number, number];
              })();

          // Marker color based on type
          const markerColor = 
            hospital.type === 'hastane' ? '#dc2626' : // red
            hospital.type === 'saglik-merkezi' ? '#2563eb' : // blue
            '#9333ea'; // purple

          // Create custom icon using Leaflet divIcon
          const createIcon = () => {
            if (typeof window === 'undefined') return undefined;
            const L = require('leaflet');
            
            return L.divIcon({
              className: 'custom-hospital-marker',
              html: `<div style="
                width: 28px;
                height: 28px;
                background-color: ${markerColor};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  background-color: white;
                  border-radius: 50%;
                "></div>
              </div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
            });
          };

          return (
            <Marker
              key={`${hospital.name}-${index}`}
              position={coords}
              icon={createIcon()}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    {hospital.name}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                    <strong>Adres:</strong> {hospital.address}
                  </p>
                  {hospital.phone && (
                    <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                      <strong>Telefon:</strong>{' '}
                      <a 
                        href={`tel:${hospital.phone.replace(/\s/g, '')}`}
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                      >
                        {hospital.phone}
                      </a>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        </MapContainer>
      )}
    </div>
  );
}
