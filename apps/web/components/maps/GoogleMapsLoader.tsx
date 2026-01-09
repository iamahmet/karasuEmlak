'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
  nonce?: string;
  onLoad?: () => void;
}

export function GoogleMapsLoader({ children, nonce, onLoad }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Check if Google Maps is already loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsLoaded(true);
        onLoad?.();
      }
    };

    checkGoogleMaps();
    
    // Also check periodically in case it loads after our check
    const interval = setInterval(() => {
      checkGoogleMaps();
    }, 100);

    return () => clearInterval(interval);
  }, [onLoad]);

  if (!apiKey) {
    console.warn('Google Maps API key is not configured');
    return <>{children}</>;
  }

  const handleScriptLoad = () => {
    // Wait for Google Maps to be fully available
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
        setIsLoaded(true);
        setHasError(false);
        onLoad?.();
      } else {
        // Retry after a short delay
        setTimeout(checkLoaded, 50);
      }
    };
    
    // Start checking after script loads
    setTimeout(checkLoaded, 100);
  };

  const handleScriptError = () => {
    console.error('Google Maps API failed to load');
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing&language=tr&region=TR&loading=async`}
        strategy="lazyOnload"
        nonce={nonce}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      {hasError ? (
        <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-700 text-sm font-medium mb-2">Harita yüklenemedi</p>
            <p className="text-red-600 text-xs">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          </div>
        </div>
      ) : isLoaded ? (
        children
      ) : (
        <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-[#006AFF] mx-auto mb-3"></div>
            <p className="text-slate-600 text-sm font-medium">Harita yükleniyor...</p>
          </div>
        </div>
      )}
    </>
  );
}

