/**
 * Timezone API Service
 * Uses TimeAPI (free, no API key required)
 * Alternative: WorldTimeAPI (free, no API key)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface TimezoneInfo {
  timezone: string;
  datetime: string;
  date: string;
  time: string;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
  abbreviation: string;
  utcOffset: string;
}

/**
 * Get current time for a timezone
 */
export async function getTimezoneInfo(
  timezone: string = 'Europe/Istanbul'
): Promise<TimezoneInfo | null> {
  try {
    // Use WorldTimeAPI (free, no API key)
    const url = `https://worldtimeapi.org/api/timezone/${timezone}`;
    
    const data = await fetchWithRetry<{
      timezone: string;
      datetime: string;
      day_of_week: number;
      day_of_year: number;
      week_number: number;
      abbreviation: string;
      utc_offset: string;
    }>(url);

    if (data.success && data.data) {
      const date = new Date(data.data.datetime);
      return {
        timezone: data.data.timezone,
        datetime: data.data.datetime,
        date: date.toLocaleDateString('tr-TR'),
        time: date.toLocaleTimeString('tr-TR'),
        dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][data.data.day_of_week] || '',
        dayOfYear: data.data.day_of_year,
        weekNumber: data.data.week_number,
        abbreviation: data.data.abbreviation,
        utcOffset: data.data.utc_offset,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Timezone API error:', error);
    }
  }

  // Fallback: use local time
  const now = new Date();
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    datetime: now.toISOString(),
    date: now.toLocaleDateString('tr-TR'),
    time: now.toLocaleTimeString('tr-TR'),
    dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][now.getDay()],
    dayOfYear: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000),
    weekNumber: Math.ceil(now.getDate() / 7),
    abbreviation: 'TRT',
    utcOffset: '+03:00',
  };
}

/**
 * Get current time in Turkey
 */
export async function getTurkeyTime(): Promise<TimezoneInfo | null> {
  return getTimezoneInfo('Europe/Istanbul');
}

/**
 * Check if current time is business hours (09:00-18:00 Turkey time)
 */
export async function isBusinessHours(): Promise<boolean> {
  const timeInfo = await getTurkeyTime();
  if (!timeInfo) return false;

  const hour = new Date(timeInfo.datetime).getHours();
  const day = new Date(timeInfo.datetime).getDay();
  
  // Monday to Friday, 9 AM to 6 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}
