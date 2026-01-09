/**
 * Free Image Fallback Utilities
 * 
 * Provides fallback images from free sources when Cloudinary images are not available
 * Works in both server and client components
 */

/**
 * Generate a search query from article content
 */
export function generateImageQueryFromArticle(article: {
  title: string;
  excerpt?: string;
  category?: string;
  content?: string;
}): string {
  // Extract keywords from title
  const titleWords = article.title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 3);

  // Add category if available
  const category = article.category?.toLowerCase().replace(/[^\w]/g, ' ');

  // Build query
  const queryParts = [
    ...titleWords,
    category,
    'real estate',
    'karasu',
    'turkey',
  ].filter(Boolean);

  return queryParts.join(' ');
}

/**
 * Search Unsplash for free images (client-safe, no API key required for basic usage)
 */
async function searchUnsplashClient(query: string): Promise<string | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    
    if (UNSPLASH_ACCESS_KEY) {
      // Use Unsplash API if key is available
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular || data.results[0].urls.full;
        }
      }
    }

    // Fallback: Use Unsplash Source API (random image based on query)
    // Note: This is deprecated but still works for basic usage
    return `https://source.unsplash.com/featured/1792x1024/?${encodeURIComponent(query)}`;
  } catch (error) {
    console.error('Unsplash search error:', error);
    return null;
  }
}

/**
 * Search Pexels for free images (client-safe)
 */
async function searchPexelsClient(query: string): Promise<string | null> {
  try {
    const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    
    if (PEXELS_API_KEY) {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          return data.photos[0].src.large || data.photos[0].src.original;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Pexels search error:', error);
    return null;
  }
}

/**
 * Get free image URL for article (Server-side)
 * Uses API endpoint to avoid import issues
 */
export async function getFreeImageForArticleServer(article: {
  title: string;
  excerpt?: string;
  category?: string;
  content?: string;
}): Promise<string | null> {
  try {
    const imageQuery = generateImageQueryFromArticle(article);
    
    // Use API endpoint (server-side can call itself)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/images/free?query=${encodeURIComponent(imageQuery)}`, {
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
    
    // Fallback to placeholder service
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    return placeholderUrl;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching free image (server):', errorMessage);
    // Fallback to placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    return placeholderUrl;
  }
}

/**
 * Get free image URL for article (Client-side)
 * Uses API endpoint or direct client-side search
 */
export async function getFreeImageForArticle(article: {
  title: string;
  excerpt?: string;
  category?: string;
  content?: string;
}): Promise<string | null> {
  try {
    const imageQuery = generateImageQueryFromArticle(article);
    
    // Try API endpoint first (if available)
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/images/free?query=${encodeURIComponent(imageQuery)}`, {
        signal: AbortSignal.timeout(3000),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          return data.url;
        }
      }
    } catch {
      // API failed, try direct client-side search
      console.log('API endpoint failed, trying direct search...');
    }
    
    // Try Unsplash first
    const unsplashImage = await searchUnsplashClient(imageQuery);
    if (unsplashImage) {
      return unsplashImage;
    }

    // Try Pexels
    const pexelsImage = await searchPexelsClient(imageQuery);
    if (pexelsImage) {
      return pexelsImage;
    }

    // Fallback to placeholder service
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    return placeholderUrl;
  } catch (error) {
    console.error('Error fetching free image:', error);
    // Fallback to placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    return placeholderUrl;
  }
}

/**
 * Check if a publicId is a valid Cloudinary image
 */
export function isValidCloudinaryId(publicId: string | null | undefined): boolean {
  if (!publicId) return false;
  
  // Check if it's a placeholder URL (not a Cloudinary ID)
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return false;
  }
  
  // Check if it contains slashes (Cloudinary IDs can have folders)
  // Basic validation: should not be empty and should not be a full URL
  return publicId.length > 0 && !publicId.includes('://');
}

