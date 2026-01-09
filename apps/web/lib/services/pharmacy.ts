/**
 * Pharmacy Service
 * Fetches nöbetçi eczane (on-duty pharmacy) data from free APIs
 * 
 * Free API Options:
 * 1. Keyiflerolsun.dev - Free (no API key required)
 * 2. Eczane24 - Free tier: 1000 requests/month
 * 3. Fallback: Manual data from database
 */

import { fetchWithRetry } from '@/lib/utils/api-client';
import { createServiceClient } from '@/lib/supabase/clients';

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

export interface PharmacyAPIResponse {
  success: boolean;
  data: Pharmacy[];
  source: string;
  cached?: boolean;
}

/**
 * Fetch pharmacies from Keyiflerolsun.dev API (free, no API key)
 */
async function fetchFromKeyiflerolsun(
  city: string,
  district: string
): Promise<Pharmacy[]> {
  try {
    // Keyiflerolsun.dev API endpoint
    const url = `https://api.keyiflerolsun.dev/nobetci-eczane?il=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`;
    
    const response = await fetchWithRetry<{
      success: boolean;
      data: Array<{
        eczane_adi: string;
        adres: string;
        telefon: string;
        ilce: string;
        il: string;
        mahalle?: string;
        enlem?: number;
        boylam?: number;
        nobet_tarihi?: string;
        nobet_baslangic?: string;
        nobet_bitis?: string;
      }>;
    }>(url, {}, {
      maxRetries: 2,
    });

    if (!response.success || !response.data?.data) {
      return [];
    }

    return response.data.data.map((item) => ({
      name: item.eczane_adi,
      address: item.adres,
      phone: item.telefon || null,
      district: item.ilce,
      city: item.il,
      neighborhood: item.mahalle || null,
      latitude: item.enlem || null,
      longitude: item.boylam || null,
      isOnDuty: true,
      dutyDate: item.nobet_tarihi || null,
      dutyStartTime: item.nobet_baslangic || null,
      dutyEndTime: item.nobet_bitis || null,
      source: 'keyiflerolsun',
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Keyiflerolsun API error:', error);
    }
    return [];
  }
}

/**
 * Fetch pharmacies from Eczane24 API (requires API key, free tier: 1000/month)
 */
async function fetchFromEczane24(
  city: string,
  district: string
): Promise<Pharmacy[]> {
  const apiKey = process.env.ECZANE24_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://api.eczane24.com/api/nobetci-eczane?il=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`;
    
    const response = await fetchWithRetry<{
      success: boolean;
      data: Array<{
        eczane_adi: string;
        adres: string;
        telefon: string;
        ilce: string;
        il: string;
        mahalle?: string;
        enlem?: number;
        boylam?: number;
        nobet_tarihi?: string;
      }>;
    }>(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }, {
      maxRetries: 2,
    });

    if (!response.success || !response.data?.data) {
      return [];
    }

    return response.data.data.map((item) => ({
      name: item.eczane_adi,
      address: item.adres,
      phone: item.telefon || null,
      district: item.ilce,
      city: item.il,
      neighborhood: item.mahalle || null,
      latitude: item.enlem || null,
      longitude: item.boylam || null,
      isOnDuty: true,
      dutyDate: item.nobet_tarihi || null,
      source: 'eczane24',
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Eczane24 API error:', error);
    }
    return [];
  }
}

/**
 * Get pharmacies from database cache
 */
async function getPharmaciesFromCache(
  city: string,
  district: string
): Promise<Pharmacy[]> {
  try {
    const supabase = createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('city', city)
      .eq('district', district)
      .eq('is_on_duty', true)
      .eq('published', true)
      .is('deleted_at', null)
      .or(`duty_date.is.null,duty_date.eq.${today}`)
      .order('name', { ascending: true });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Database cache error:', error);
      }
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      phone: item.phone,
      district: item.district,
      city: item.city,
      neighborhood: item.neighborhood,
      latitude: item.latitude,
      longitude: item.longitude,
      isOnDuty: item.is_on_duty,
      dutyDate: item.duty_date,
      dutyStartTime: item.duty_start_time,
      dutyEndTime: item.duty_end_time,
      source: item.source || 'database',
      verified: item.verified,
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database cache error:', error);
    }
    return [];
  }
}

/**
 * Save pharmacies to database cache
 */
async function savePharmaciesToCache(pharmacies: Pharmacy[]): Promise<void> {
  if (pharmacies.length === 0) return;

  try {
    const supabase = createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Upsert pharmacies
    const pharmacyData = pharmacies.map((pharmacy) => ({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      district: pharmacy.district,
      city: pharmacy.city,
      neighborhood: pharmacy.neighborhood,
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      is_on_duty: pharmacy.isOnDuty,
      duty_date: pharmacy.dutyDate || today,
      duty_start_time: pharmacy.dutyStartTime,
      duty_end_time: pharmacy.dutyEndTime,
      source: pharmacy.source || 'api',
      last_verified_at: new Date().toISOString(),
      verified: false,
      published: true,
    }));

    const { error } = await supabase
      .from('pharmacies')
      .upsert(pharmacyData, {
        onConflict: 'name,district,city',
        ignoreDuplicates: false,
      });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving pharmacies to cache:', error);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving pharmacies to cache:', error);
    }
  }
}

/**
 * Get on-duty pharmacies for a city/district
 * Tries multiple sources with fallback
 */
export async function getOnDutyPharmacies(
  city: string = 'Sakarya',
  district: string = 'Karasu',
  useCache: boolean = true
): Promise<PharmacyAPIResponse> {
  // Try cache first if enabled
  if (useCache) {
    const cached = await getPharmaciesFromCache(city, district);
    if (cached.length > 0) {
      // Check if cache is fresh (less than 6 hours old)
      const supabase = createServiceClient();
      const { data: recent } = await supabase
        .from('pharmacies')
        .select('last_verified_at')
        .eq('city', city)
        .eq('district', district)
        .eq('is_on_duty', true)
        .order('last_verified_at', { ascending: false })
        .limit(1)
        .single();

      if (recent?.last_verified_at) {
        const lastVerified = new Date(recent.last_verified_at);
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        
        if (lastVerified > sixHoursAgo) {
          return {
            success: true,
            data: cached,
            source: 'database_cache',
            cached: true,
          };
        }
      }
    }
  }

  // Try free APIs
  let pharmacies: Pharmacy[] = [];

  // Try Keyiflerolsun first (no API key required)
  pharmacies = await fetchFromKeyiflerolsun(city, district);

  // Fallback to Eczane24 if Keyiflerolsun fails
  if (pharmacies.length === 0) {
    pharmacies = await fetchFromEczane24(city, district);
  }

  // If APIs fail, try database cache anyway
  if (pharmacies.length === 0) {
    pharmacies = await getPharmaciesFromCache(city, district);
    return {
      success: pharmacies.length > 0,
      data: pharmacies,
      source: 'database_fallback',
      cached: true,
    };
  }

  // Save to cache for future use
  await savePharmaciesToCache(pharmacies);

  return {
    success: true,
    data: pharmacies,
    source: pharmacies[0]?.source || 'api',
    cached: false,
  };
}

/**
 * Get all pharmacies (not just on-duty) for a district
 */
export async function getAllPharmacies(
  city: string = 'Sakarya',
  district: string = 'Karasu'
): Promise<Pharmacy[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('city', city)
      .eq('district', district)
      .eq('published', true)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Database error:', error);
      }
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      phone: item.phone,
      district: item.district,
      city: item.city,
      neighborhood: item.neighborhood,
      latitude: item.latitude,
      longitude: item.longitude,
      isOnDuty: item.is_on_duty,
      dutyDate: item.duty_date,
      dutyStartTime: item.duty_start_time,
      dutyEndTime: item.duty_end_time,
      source: item.source || 'database',
      verified: item.verified,
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database error:', error);
    }
    return [];
  }
}
