/**
 * Fallback Strategies
 * Provides fallback data and recovery mechanisms
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * Get cached listings from localStorage as fallback
 */
export function getCachedListings(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cached = localStorage.getItem('listings-cache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // Ignore errors
  }
  
  return [];
}

/**
 * Cache listings to localStorage
 */
export function cacheListings(listings: any[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(
      'listings-cache',
      JSON.stringify({
        data: listings,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Ignore errors (localStorage might be full)
  }
}

/**
 * Get fallback stats
 */
export function getFallbackStats(): {
  total: number;
  satilik: number;
  kiralik: number;
  byType: Record<string, number>;
} {
  return {
    total: 500,
    satilik: 350,
    kiralik: 150,
    byType: {
      daire: 200,
      villa: 100,
      yazlik: 150,
      arsa: 50,
    },
  };
}

/**
 * Get fallback neighborhoods
 */
export function getFallbackNeighborhoods(): string[] {
  return [
    'Merkez',
    'Sahil',
    'Yalı',
    'Aziziye',
    'Cumhuriyet',
    'Atatürk',
    'Bota',
    'Liman',
    'Çamlık',
    'Kurtuluş',
  ];
}

/**
 * Get fallback articles
 */
export function getFallbackArticles(): any[] {
  return [
    {
      id: 'fallback-1',
      title: 'Karasu Emlak Piyasası 2025',
      slug: 'karasu-emlak-piyasasi-2025',
      excerpt: 'Karasu emlak piyasası hakkında güncel bilgiler ve analizler.',
      featured_image: null,
    },
  ];
}

/**
 * Try to get data from cache, fallback to defaults
 */
export async function getDataWithFallback<T>(
  fetchFn: () => Promise<T>,
  fallback: T,
  cacheKey?: string
): Promise<T> {
  try {
    const data = await fetchFn();
    
    // Cache successful data
    if (cacheKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `cache-${cacheKey}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Ignore cache errors
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data, using fallback:', error);
    
    // Try to get from cache
    if (cacheKey && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cache-${cacheKey}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Cache valid for 10 minutes
          if (Date.now() - timestamp < 10 * 60 * 1000) {
            return data;
          }
        }
      } catch {
        // Ignore cache errors
      }
    }
    
    return fallback;
  }
}
