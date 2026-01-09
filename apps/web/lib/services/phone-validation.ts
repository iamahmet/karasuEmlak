/**
 * Phone Validation API Service
 * Uses Numverify API (free tier: 1,000 requests/month)
 * Alternative: Abstract API Phone Validation (free tier: 20 requests/month)
 * Alternative: Veriphone (free tier: 1,000 requests/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface PhoneValidationResult {
  phone: string;
  valid: boolean;
  country?: string;
  countryCode?: string;
  countryPrefix?: string;
  lineType?: string; // mobile, landline, voip, etc.
  carrier?: string;
  location?: string;
}

/**
 * Validate phone number
 */
export async function validatePhone(
  phone: string,
  countryCode?: string
): Promise<PhoneValidationResult | null> {
  const apiKey = process.env.NUMVERIFY_API_KEY;
  
  if (apiKey) {
    try {
      // Use Numverify API (if API key available)
      const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(phone)}${countryCode ? `&country_code=${countryCode}` : ''}`;
      
      const data = await fetchWithRetry<{
        valid: boolean;
        number: string;
        local_format: string;
        international_format: string;
        country_prefix: string;
        country_code: string;
        country_name: string;
        location: string;
        carrier: string;
        line_type: string;
      }>(url);

      if (data.success && data.data) {
        return {
          phone: data.data.international_format || phone,
          valid: data.data.valid,
          country: data.data.country_name,
          countryCode: data.data.country_code,
          countryPrefix: data.data.country_prefix,
          lineType: data.data.line_type,
          carrier: data.data.carrier,
          location: data.data.location,
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Numverify API error:', error);
      }
    }
  }

  // Fallback: basic validation
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return {
    phone,
    valid: phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10,
  };
}

/**
 * Format phone number for Turkey
 */
export function formatTurkishPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('90')) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  
  if (cleaned.length === 10) {
    return `+90 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
}
