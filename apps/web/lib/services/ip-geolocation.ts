/**
 * IP Geolocation API Service
 * Uses ip-api.com (free tier: 45 requests/minute)
 * Alternative: ipify (free, no API key)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface IPGeolocation {
  ip: string;
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get geolocation data from IP address
 */
export async function getIPGeolocation(ip?: string): Promise<IPGeolocation | null> {
  try {
    // Use ip-api.com (free, no API key, 45 req/min)
    const url = ip 
      ? `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,regionName,timezone,isp,lat,lon,query`
      : 'http://ip-api.com/json/?fields=status,message,country,countryCode,city,regionName,timezone,isp,lat,lon,query';
    
    const data = await fetchWithRetry<{
      status: string;
      country: string;
      countryCode: string;
      city?: string;
      regionName?: string;
      timezone?: string;
      isp?: string;
      lat?: number;
      lon?: number;
      query: string;
    }>(url);

    if (data.success && data.data && data.data.status === 'success') {
      return {
        ip: data.data.query,
        country: data.data.country,
        countryCode: data.data.countryCode,
        city: data.data.city,
        region: data.data.regionName,
        timezone: data.data.timezone,
        isp: data.data.isp,
        latitude: data.data.lat,
        longitude: data.data.lon,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('IP Geolocation API error:', error);
    }
  }

  return null;
}

/**
 * Get visitor's IP address
 */
export async function getVisitorIP(): Promise<string | null> {
  try {
    const data = await fetchWithRetry<{ ip: string }>('https://api.ipify.org?format=json');
    
    if (data.success && data.data) {
      return data.data.ip;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('IP API error:', error);
    }
  }

  return null;
}
