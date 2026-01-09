/**
 * News API Route
 * GET /api/services/news?type=real-estate&pageSize=10
 * GET /api/services/news?type=headlines&category=business
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealEstateNews, getTopHeadlines } from '@/lib/services/news';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'real-estate'; // 'real-estate' or 'headlines'
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const category = searchParams.get('category') || 'business';

    if (type === 'headlines') {
      const articles = await getTopHeadlines(category, pageSize);
      return NextResponse.json({
        success: true,
        data: {
          articles,
          count: articles.length,
        },
      });
    }

    // Default: real estate news
    const articles = await getRealEstateNews('tr', pageSize);
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        count: articles.length,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('News API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news',
    }, { status: 500 });
  }
}
