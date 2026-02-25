/**
 * Geocoding API Route
 * GET /api/services/geocoding?address=Karasu, Sakarya
 * GET /api/services/geocoding?lat=41.0969&lng=30.6906 (reverse)
 */

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/services/geocoding';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Reverse geocoding (coordinates to address)
    if (lat && lng) {
      const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Reverse geocoding failed',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Forward geocoding (address to coordinates)
    if (address) {
      const result = await geocodeAddress(address);
      if (!result) {
        return NextResponse.json({
          success: false,
          error: 'Geocoding failed',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing required parameters (address or lat/lng)',
    }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Geocoding API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to geocode address',
    }, { status: 500 });
  }
}
