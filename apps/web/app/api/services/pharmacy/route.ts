/**
 * Pharmacy API Route
 * GET /api/services/pharmacy?city=Sakarya&district=Karasu&type=on-duty
 * 
 * Returns on-duty pharmacies for a given city/district
 * Uses free APIs with database caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOnDutyPharmacies, getAllPharmacies } from '@/lib/services/pharmacy';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || 'Sakarya';
    const district = searchParams.get('district') || 'Karasu';
    const type = searchParams.get('type') || 'on-duty'; // 'on-duty' or 'all'
    const useCache = searchParams.get('cache') !== 'false';

    // Validate inputs
    if (!city || !district) {
      return NextResponse.json(
        {
          success: false,
          error: 'City and district are required',
        },
        { status: 400 }
      );
    }

    let data;
    let source;

    if (type === 'all') {
      const result = await getAllPharmacies(city, district);
      data = result;
      source = 'database';
    } else {
      const result = await getOnDutyPharmacies(city, district, useCache);
      data = result.data;
      source = result.source;
    }

    return NextResponse.json(
      {
        success: true,
        data,
        source,
        city,
        district,
        count: data.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Pharmacy API route error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pharmacy data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
