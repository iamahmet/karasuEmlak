/**
 * Geocoding API Service
 * Uses OpenCage Geocoding API (free tier: 2,500 requests/day)
 * Alternative: Nominatim (free, no API key, but rate limited)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted: string;
  city?: string;
  district?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Geocode an address (address to coordinates)
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  // Try OpenCage first (if API key available)
  const openCageKey = process.env.OPENCAGE_API_KEY;
  
  if (openCageKey) {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${openCageKey}&language=tr&limit=1`;
      
      const data = await fetchWithRetry<{
        results: Array<{
          geometry: { lat: number; lng: number };
          formatted: string;
          components: {
            city?: string;
            town?: string;
            county?: string;
            state?: string;
            country?: string;
          };
        }>;
      }>(url);

      if (data.success && data.data?.results?.[0]) {
        const result = data.data.results[0];
        return {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          formatted: result.formatted,
          city: result.components.city || result.components.town,
          district: result.components.county || result.components.state,
          country: result.components.country,
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OpenCage API error:', error);
      }
    }
  }

  // Fallback to Nominatim (free, no API key)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=tr`;
    
    const data = await fetchWithRetry<Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: {
        city?: string;
        town?: string;
        county?: string;
        state?: string;
        country?: string;
      };
    }>>(url, {
      headers: {
        'User-Agent': 'KarasuEmlak/1.0',
      },
    });

    if (data.success && data.data?.[0]) {
      const result = data.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formatted: result.display_name,
        city: result.address?.city || result.address?.town,
        district: result.address?.county || result.address?.state,
        country: result.address?.country,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Nominatim API error:', error);
    }
  }

  return null;
}

/**
 * Reverse geocode coordinates (coordinates to address)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  const openCageKey = process.env.OPENCAGE_API_KEY;
  
  if (openCageKey) {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageKey}&language=tr&limit=1`;
      
      const data = await fetchWithRetry<{
        results: Array<{
          formatted: string;
          components: {
            city?: string;
            town?: string;
            county?: string;
            state?: string;
            suburb?: string;
            neighbourhood?: string;
            postcode?: string;
            country?: string;
          };
        }>;
      }>(url);

      if (data.success && data.data?.results?.[0]) {
        const result = data.data.results[0];
        return {
          address: result.formatted,
          city: result.components.city || result.components.town,
          district: result.components.county || result.components.state,
          neighborhood: result.components.suburb || result.components.neighbourhood,
          country: result.components.country,
          postalCode: result.components.postcode,
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OpenCage reverse geocode error:', error);
      }
    }
  }

  // Fallback to Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`;
    
    const data = await fetchWithRetry<{
      display_name: string;
      address?: {
        city?: string;
        town?: string;
        county?: string;
        state?: string;
        suburb?: string;
        neighbourhood?: string;
        postcode?: string;
        country?: string;
      };
    }>(url, {
      headers: {
        'User-Agent': 'KarasuEmlak/1.0',
      },
    });

    if (data.success && data.data) {
      const result = data.data;
      return {
        address: result.display_name,
        city: result.address?.city || result.address?.town,
        district: result.address?.county || result.address?.state,
        neighborhood: result.address?.suburb || result.address?.neighbourhood,
        country: result.address?.country,
        postalCode: result.address?.postcode,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Nominatim reverse geocode error:', error);
    }
  }

  return null;
}
