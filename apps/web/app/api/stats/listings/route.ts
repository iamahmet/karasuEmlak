import { NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/stats/listings
 * Get real-time listing statistics
 * Cached for 5 minutes, stale-while-revalidate for 1 hour
 */
export async function GET() {
  try {
    let supabase;
    try {
      supabase = createServiceClient();
    } catch (error: any) {
      console.error('Stats API - Service client creation failed:', error.message);
      // Return fallback data if Supabase is unavailable
      return NextResponse.json(
        {
          success: false,
          data: { total: 0, satilik: 0, kiralik: 0 },
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Get total count
    const { count: total } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null);

    // Get satilik count
    const { count: satilik } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .eq('available', true)
      .eq('status', 'satilik')
      .is('deleted_at', null);

    // Get kiralik count
    const { count: kiralik } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .eq('available', true)
      .eq('status', 'kiralik')
      .is('deleted_at', null);

    return NextResponse.json(
      {
        success: true,
        data: {
          total: total || 0,
          satilik: satilik || 0,
          kiralik: kiralik || 0,
        },
        lastUpdated: new Date().toISOString(),
        cached: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600', // 5 min cache, 1 hour stale
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      }
    );
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: { total: 0, satilik: 0, kiralik: 0 },
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

