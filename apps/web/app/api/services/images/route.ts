/**
 * Enhanced Image Search API
 * 
 * Server-side endpoint for searching images from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchImages, getRealEstateImage } from '@/lib/services/images';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const propertyType = searchParams.get('propertyType');
    const location = searchParams.get('location');
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : 1792;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : 1024;
    const orientation = (searchParams.get('orientation') as 'landscape' | 'portrait' | 'square') || 'landscape';

    // If property type is provided, use real estate image search
    if (propertyType) {
      const result = await getRealEstateImage(propertyType, location || undefined);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    // Regular image search
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const result = await searchImages(query, {
      width,
      height,
      orientation,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Image search API error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to search images', message: errorMessage },
      { status: 500 }
    );
  }
}
