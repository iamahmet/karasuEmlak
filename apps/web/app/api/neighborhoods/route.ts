/**
 * Neighborhoods API Endpoint
 * 
 * GET /api/neighborhoods
 * Returns all neighborhoods with optional filtering
 * 
 * Query params:
 * - district: filter by district (e.g., 'Karasu', 'Kocaali')
 * - city: filter by city (e.g., 'Sakarya')
 * - limit: number of neighborhoods to return (default: 100)
 * - includeStats: include listing statistics (default: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodsWithImages } from '@/lib/supabase/queries/neighborhoods';
import { getListings } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const district = searchParams.get('district');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch neighborhoods
    const neighborhoodsResult = await withTimeout(
      getNeighborhoodsWithImages(limit),
      3000,
      []
    );

    let neighborhoods = neighborhoodsResult || [];

    // Filter by district
    if (district) {
      neighborhoods = neighborhoods.filter(
        n => n.district?.toLowerCase().includes(district.toLowerCase())
      );
    }

    // Filter by city
    if (city) {
      neighborhoods = neighborhoods.filter(
        n => n.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Include stats if requested
    let neighborhoodsWithStats = neighborhoods;
    if (includeStats) {
      const listingsResult = await withTimeout(
        getListings({}, { field: 'created_at', order: 'desc' }, 1000, 0),
        3000,
        { listings: [], total: 0 }
      );

      const allListings = listingsResult?.listings || [];

      neighborhoodsWithStats = neighborhoods.map(neighborhood => {
        const neighborhoodListings = allListings.filter(listing =>
          listing.location_neighborhood?.toLowerCase() === neighborhood.name?.toLowerCase() ||
          listing.location_district?.toLowerCase() === neighborhood.district?.toLowerCase()
        );

        const satilikCount = neighborhoodListings.filter(l => l.status === 'satilik').length;
        const kiralikCount = neighborhoodListings.filter(l => l.status === 'kiralik').length;

        return {
          ...neighborhood,
          stats: {
            totalListings: neighborhoodListings.length,
            satilikCount,
            kiralikCount,
            avgPrice: neighborhoodListings.length > 0
              ? neighborhoodListings
                  .filter(l => l.price_amount && l.price_amount > 0)
                  .reduce((sum, l) => sum + (l.price_amount || 0), 0) / neighborhoodListings.filter(l => l.price_amount && l.price_amount > 0).length
              : null,
          },
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        neighborhoods: neighborhoodsWithStats,
        pagination: {
          total: neighborhoods.length,
          limit,
          returned: neighborhoodsWithStats.length,
        },
        filters: {
          district: district || null,
          city: city || null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch neighborhoods',
      },
      { status: 500 }
    );
  }
}
