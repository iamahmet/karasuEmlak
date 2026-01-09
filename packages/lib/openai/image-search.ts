/**
 * Advanced Image Search System
 * Searches multiple sources: Unsplash, Pexels, Google Images, Bing Images
 * Provides comprehensive image discovery for AI generation
 */

import { getEnv } from '@karasu-emlak/config';

export interface ImageSearchResult {
  url: string;
  source: 'unsplash' | 'pexels' | 'google' | 'bing' | 'pixabay';
  thumbnail?: string;
  author?: string;
  license?: string;
}

/**
 * Search Unsplash for free images
 */
export async function searchUnsplash(query: string): Promise<ImageSearchResult[]> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!UNSPLASH_ACCESS_KEY) {
      // Fallback: Use Unsplash Source API (random image)
      return [{
        url: `https://source.unsplash.com/featured/1920x1080/?${encodeURIComponent(query)}`,
        source: 'unsplash',
        license: 'Unsplash License',
      }];
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((photo: any) => ({
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      source: 'unsplash' as const,
      author: photo.user.name,
      license: 'Unsplash License',
    }));
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

/**
 * Search Pexels for free images
 */
export async function searchPexels(query: string): Promise<ImageSearchResult[]> {
  try {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    
    if (!PEXELS_API_KEY) {
      return [];
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.photos || data.photos.length === 0) {
      return [];
    }

    return data.photos.map((photo: any) => ({
      url: photo.src.large,
      thumbnail: photo.src.medium,
      source: 'pexels' as const,
      author: photo.photographer,
      license: 'Pexels License',
    }));
  } catch (error) {
    console.error('Pexels search error:', error);
    return [];
  }
}

/**
 * Search Pixabay for free images
 */
export async function searchPixabay(query: string): Promise<ImageSearchResult[]> {
  try {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
    
    if (!PIXABAY_API_KEY) {
      return [];
    }

    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=5&safesearch=true`,
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.hits || data.hits.length === 0) {
      return [];
    }

    return data.hits.map((hit: any) => ({
      url: hit.largeImageURL,
      thumbnail: hit.previewURL,
      source: 'pixabay' as const,
      author: hit.user,
      license: 'Pixabay License',
    }));
  } catch (error) {
    console.error('Pixabay search error:', error);
    return [];
  }
}

/**
 * Search Google Images using Custom Search API
 * Requires GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_ENGINE_ID
 */
export async function searchGoogleImages(query: string): Promise<ImageSearchResult[]> {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const GOOGLE_ENGINE_ID = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (!GOOGLE_API_KEY || !GOOGLE_ENGINE_ID) {
      return [];
    }

    // Search for images with usage rights filter
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=5&safe=active&imgSize=large&imgType=photo&rights=cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived`,
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink,
      source: 'google' as const,
      license: item.image?.contextLink ? 'Creative Commons' : 'Unknown',
    }));
  } catch (error) {
    console.error('Google Images search error:', error);
    return [];
  }
}

/**
 * Comprehensive image search across multiple sources
 * Returns best matches from all sources
 */
export async function searchImagesComprehensive(
  query: string,
  options: {
    maxResults?: number;
    sources?: ('unsplash' | 'pexels' | 'pixabay' | 'google')[];
  } = {}
): Promise<ImageSearchResult[]> {
  const { maxResults = 10, sources = ['unsplash', 'pexels', 'pixabay'] } = options;
  
  console.log(`🔍 Comprehensive image search: "${query}"`);
  
  const searchPromises: Promise<ImageSearchResult[]>[] = [];
  
  if (sources.includes('unsplash')) {
    searchPromises.push(searchUnsplash(query));
  }
  
  if (sources.includes('pexels')) {
    searchPromises.push(searchPexels(query));
  }
  
  if (sources.includes('pixabay')) {
    searchPromises.push(searchPixabay(query));
  }
  
  if (sources.includes('google')) {
    searchPromises.push(searchGoogleImages(query));
  }
  
  // Execute all searches in parallel
  const results = await Promise.allSettled(searchPromises);
  
  // Combine and deduplicate results
  const allResults: ImageSearchResult[] = [];
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    }
  }
  
  // Remove duplicates based on URL
  const uniqueResults = allResults.filter((result, index, self) =>
    index === self.findIndex((r) => r.url === result.url)
  );
  
  // Prioritize: Unsplash > Pexels > Pixabay > Google
  const priorityOrder = ['unsplash', 'pexels', 'pixabay', 'google'];
  uniqueResults.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.source);
    const bPriority = priorityOrder.indexOf(b.source);
    return aPriority - bPriority;
  });
  
  console.log(`   ✅ Found ${uniqueResults.length} images from ${sources.length} sources`);
  
  return uniqueResults.slice(0, maxResults);
}

/**
 * Find best reference image for AI generation
 * Uses comprehensive search and selects the most relevant image
 */
export async function findBestReferenceImage(
  query: string,
  context?: {
    type?: 'listing' | 'article' | 'neighborhood';
    propertyType?: string;
    location?: string;
  }
): Promise<ImageSearchResult | null> {
  // Enhance query with context
  let enhancedQuery = query;
  
  if (context) {
    if (context.type === 'listing' && context.propertyType) {
      enhancedQuery = `${context.propertyType} ${context.location || ''} ${query}`.trim();
    } else if (context.location) {
      enhancedQuery = `${query} ${context.location}`.trim();
    }
  }
  
  // Add location-specific terms
  enhancedQuery = `${enhancedQuery} Turkey real estate property`.trim();
  
  const results = await searchImagesComprehensive(enhancedQuery, {
    maxResults: 5,
    sources: ['unsplash', 'pexels', 'pixabay'], // Google requires API setup
  });
  
  if (results.length === 0) {
    return null;
  }
  
  // Return the first result (highest priority)
  return results[0];
}

