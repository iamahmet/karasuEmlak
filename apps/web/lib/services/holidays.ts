/**
 * Public Holidays API Service
 * Uses Nager.Date API (free, no API key)
 * Alternative: Calendarific (free tier: 1,000 requests/month)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface Holiday {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties?: string[];
  launchYear?: number;
  types: string[];
}

/**
 * Get public holidays for a country and year
 */
export async function getPublicHolidays(
  countryCode: string = 'TR',
  year?: number
): Promise<Holiday[]> {
  const currentYear = year || new Date().getFullYear();
  
  try {
    // Use Nager.Date API (free, no API key)
    const url = `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`;
    
    const data = await fetchWithRetry<Holiday[]>(url);

    if (data.success && data.data) {
      return data.data;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Holidays API error:', error);
    }
  }

  return [];
}

/**
 * Check if a date is a public holiday
 */
export async function isPublicHoliday(
  date: Date,
  countryCode: string = 'TR'
): Promise<boolean> {
  const holidays = await getPublicHolidays(countryCode, date.getFullYear());
  const dateString = date.toISOString().split('T')[0];
  
  return holidays.some(holiday => holiday.date === dateString);
}

/**
 * Get next public holiday
 */
export async function getNextHoliday(
  countryCode: string = 'TR'
): Promise<Holiday | null> {
  const holidays = await getPublicHolidays(countryCode);
  const today = new Date().toISOString().split('T')[0];
  
  const upcoming = holidays
    .filter(holiday => holiday.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return upcoming[0] || null;
}
