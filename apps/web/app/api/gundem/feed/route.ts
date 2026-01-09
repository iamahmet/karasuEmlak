import { NextRequest, NextResponse } from 'next/server';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { withTimeout } from '@/lib/utils/timeout';

/**
 * GET /api/gundem/feed
 * 
 * Karasu Gündem RSS feed'ini parse eder ve JSON olarak döner
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Parse RSS with timeout (5 seconds)
    const articlesResult = await withTimeout(
      getLatestGundemArticles(limit),
      5000,
      []
    );
    const articles = articlesResult || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          articles,
          count: articles.length,
          source: 'karasu-gundem',
        },
        cached: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800', // 10 min cache, 30 min stale
          'CDN-Cache-Control': 'public, s-maxage=600',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=600',
        },
      }
    );
  } catch (error: any) {
    console.error('Gundem RSS fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'RSS feed parse edilemedi',
        data: {
          articles: [],
          count: 0,
          source: 'karasu-gundem',
        },
        cached: false,
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

