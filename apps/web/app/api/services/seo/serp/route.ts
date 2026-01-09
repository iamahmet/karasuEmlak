/**
 * SERP Tracking API Route
 * GET /api/services/seo/serp?keyword=karasu satılık ev
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackSERPPosition, getCompetitorAnalysis } from '@/lib/services/serp-tracking';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const action = searchParams.get('action'); // 'track', 'competitors'
    const domain = searchParams.get('domain') || 'karasuemlak.net';

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: 'Missing keyword parameter',
      }, { status: 400 });
    }

    if (action === 'competitors') {
      const competitors = await getCompetitorAnalysis(keyword);
      if (!competitors) {
        return NextResponse.json({
          success: false,
          error: 'Competitor analysis failed',
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: competitors,
      });
    }

    // Default: track position
    const tracking = await trackSERPPosition(keyword, domain);
    if (!tracking) {
      return NextResponse.json({
        success: false,
        error: 'SERP tracking failed',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SERP tracking API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to track SERP position',
    }, { status: 500 });
  }
}
