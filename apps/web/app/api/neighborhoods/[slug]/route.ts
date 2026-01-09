/**
 * Single Neighborhood API Endpoint
 * 
 * GET /api/neighborhoods/[slug]
 * Returns a single neighborhood by slug with detailed information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodWithImage } from '@/lib/supabase/queries/neighborhoods';
import { getListings } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch neighborhood
    const neighborhoodResult = await withTimeout(
      getNeighborhoodWithImage(slug),
      3000,
      null
    );

    if (!neighborhoodResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Neighborhood not found',
        },
        { status: 404 }
      );
    }

    // Fetch listings for this neighborhood
    const listingsResult = await withTimeout(
      getListings({}, { field: 'created_at', order: 'desc' }, 100, 0),
      3000,
      { listings: [], total: 0 }
    );

    const allListings = listingsResult?.listings || [];
    const neighborhoodListings = allListings.filter(listing =>
      listing.location_neighborhood?.toLowerCase() === neighborhoodResult.name?.toLowerCase() ||
      listing.location_district?.toLowerCase() === neighborhoodResult.district?.toLowerCase()
    );

    const satilikCount = neighborhoodListings.filter(l => l.status === 'satilik').length;
    const kiralikCount = neighborhoodListings.filter(l => l.status === 'kiralik').length;

    const stats = {
      totalListings: neighborhoodListings.length,
      satilikCount,
      kiralikCount,
      avgPrice: neighborhoodListings.length > 0
        ? neighborhoodListings
            .filter(l => l.price_amount && l.price_amount > 0)
            .reduce((sum, l) => sum + (l.price_amount || 0), 0) / neighborhoodListings.filter(l => l.price_amount && l.price_amount > 0).length
        : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        neighborhood: {
          ...neighborhoodResult,
          stats,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch neighborhood',
      },
      { status: 500 }
    );
  }
}
