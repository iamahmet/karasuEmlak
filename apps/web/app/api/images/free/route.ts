/**
 * Free Image API Endpoint
 * 
 * Server-side endpoint for fetching free images from Unsplash/Pexels
 * Used by client components that can't access server-only code
 */

import { NextRequest, NextResponse } from 'next/server';

// Client-safe image search functions (no server-only dependencies)
async function searchUnsplash(query: string): Promise<string | null> {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    
    if (UNSPLASH_ACCESS_KEY) {
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

    // Fallback: Use Unsplash Source API
    return `https://source.unsplash.com/featured/1792x1024/?${encodeURIComponent(query)}`;
  } catch (error) {
    console.error('Unsplash search error:', error);
    return null;
  }
}

async function searchPexels(query: string): Promise<string | null> {
  try {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY || process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Search multiple sources
    // Try Unsplash first
    const unsplashImage = await searchUnsplash(query);
    if (unsplashImage) {
      return NextResponse.json({
        success: true,
        url: unsplashImage,
        source: 'unsplash',
      });
    }

    // Try Pexels
    const pexelsImage = await searchPexels(query);
    if (pexelsImage) {
      return NextResponse.json({
        success: true,
        url: pexelsImage,
        source: 'pexels',
      });
    }

    // Fallback to placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(query.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    
    return NextResponse.json({
      success: true,
      url: placeholderUrl,
      source: 'placeholder',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Free image API error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to fetch free image', message: errorMessage },
      { status: 500 }
    );
  }
}

