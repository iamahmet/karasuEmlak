/**
 * Enhanced Image APIs Integration
 * 
 * Integrates multiple free image APIs:
 * - Unsplash (with API key for better results)
 * - Pexels (with API key)
 * - Pixabay (free, no API key required)
 * - Lorem Picsum (fallback)
 */

export interface ImageSearchResult {
  url: string;
  source: 'unsplash' | 'pexels' | 'pixabay' | 'picsum' | 'placeholder';
  width?: number;
  height?: number;
  photographer?: string;
  photographerUrl?: string;
}

/**
 * Search Unsplash for images
 */
export async function searchUnsplash(
  query: string,
  options: { width?: number; height?: number; orientation?: 'landscape' | 'portrait' | 'squarish' } = {}
): Promise<ImageSearchResult | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    
    if (UNSPLASH_ACCESS_KEY) {
      const orientation = options.orientation || 'landscape';
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          return {
            url: photo.urls.regular || photo.urls.full,
            source: 'unsplash',
            width: photo.width,
            height: photo.height,
            photographer: photo.user?.name,
            photographerUrl: photo.user?.links?.html,
          };
        }
      }
    }

    // Fallback: Use Unsplash Source API (deprecated but works)
    const width = options.width || 1792;
    const height = options.height || 1024;
    return {
      url: `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(query)}`,
      source: 'unsplash',
      width,
      height,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unsplash search error:', error);
    }
    return null;
  }
}

/**
 * Search Pexels for images
 */
export async function searchPexels(
  query: string,
  options: { width?: number; height?: number; orientation?: 'landscape' | 'portrait' | 'square' } = {}
): Promise<ImageSearchResult | null> {
  try {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY || process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    
    if (PEXELS_API_KEY) {
      const orientation = options.orientation || 'landscape';
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const photo = data.photos[0];
          return {
            url: photo.src.large || photo.src.original,
            source: 'pexels',
            width: photo.width,
            height: photo.height,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
          };
        }
      }
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Pexels search error:', error);
    }
    return null;
  }
}

/**
 * Search Pixabay for images (free, no API key required for basic usage)
 */
export async function searchPixabay(
  query: string,
  options: { width?: number; height?: number; imageType?: 'photo' | 'illustration' | 'vector' } = {}
): Promise<ImageSearchResult | null> {
  try {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
    const imageType = options.imageType || 'photo';
    
    // Pixabay requires API key for better results, but we can use a public endpoint
    // For production, get free API key from https://pixabay.com/api/docs/
    const apiKey = PIXABAY_API_KEY || '9656065-a4094594c34c9ac8b7ffe39a6'; // Public demo key (limited)
    
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=${imageType}&per_page=1&safesearch=true`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        const hit = data.hits[0];
        return {
          url: hit.webformatURL || hit.largeImageURL,
          source: 'pixabay',
          width: hit.imageWidth,
          height: hit.imageHeight,
        };
      }
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Pixabay search error:', error);
    }
    return null;
  }
}

/**
 * Get image from Lorem Picsum (fallback)
 */
export function getPicsumImage(
  width = 1792,
  height = 1024,
  seed?: string | number
): ImageSearchResult {
  const seedValue = seed 
    ? (typeof seed === 'string' ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : seed)
    : Math.floor(Math.random() * 1000);
  
  return {
    url: `https://picsum.photos/seed/${seedValue}/${width}/${height}`,
    source: 'picsum',
    width,
    height,
  };
}

/**
 * Search multiple image sources with fallback
 */
export async function searchImages(
  query: string,
  options: {
    width?: number;
    height?: number;
    orientation?: 'landscape' | 'portrait' | 'square';
    preferredSource?: 'unsplash' | 'pexels' | 'pixabay';
  } = {}
): Promise<ImageSearchResult> {
  const { width = 1792, height = 1024, orientation = 'landscape', preferredSource } = options;

  // Map 'square' to 'squarish' for Unsplash API
  const unsplashOrientation = orientation === 'square' ? 'squarish' : orientation;

  // Try preferred source first
  if (preferredSource === 'unsplash') {
    const result = await searchUnsplash(query, { width, height, orientation: unsplashOrientation });
    if (result) return result;
  } else if (preferredSource === 'pexels') {
    const result = await searchPexels(query, { width, height, orientation: orientation as 'landscape' | 'portrait' | 'square' });
    if (result) return result;
  } else if (preferredSource === 'pixabay') {
    const result = await searchPixabay(query, { width, height });
    if (result) return result;
  }

  // Try all sources in order
  const sources = [
    () => searchUnsplash(query, { width, height, orientation: unsplashOrientation }),
    () => searchPexels(query, { width, height, orientation: orientation as 'landscape' | 'portrait' | 'square' }),
    () => searchPixabay(query, { width, height }),
  ];

  for (const searchFn of sources) {
    const result = await searchFn();
    if (result) return result;
  }

  // Final fallback: Picsum with query-based seed
  return getPicsumImage(width, height, query);
}

/**
 * Get real estate related image
 */
export async function getRealEstateImage(
  propertyType: string = 'house',
  location?: string
): Promise<ImageSearchResult> {
  const queries = [
    `${propertyType} ${location || 'turkey'}`,
    `${propertyType} real estate`,
    `${propertyType} architecture`,
    'real estate property',
  ];

  for (const query of queries) {
    const result = await searchImages(query, {
      width: 1792,
      height: 1024,
      orientation: 'landscape',
    });
    
    if (result.source !== 'picsum') {
      return result;
    }
  }

  // Return last result (Picsum fallback)
  return getPicsumImage(1792, 1024, `${propertyType}-${location || 'default'}`);
}
