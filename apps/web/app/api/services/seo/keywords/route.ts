/**
 * SEO Keywords API Route
 * GET /api/services/seo/keywords?keyword=karasu satılık ev
 */

import { NextRequest, NextResponse } from 'next/server';
import { getKeywordSuggestions, analyzeKeyword, getTrendingKeywords } from '@/lib/services/seo-keywords';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const action = searchParams.get('action'); // 'suggestions', 'analyze', 'trending'
    const location = searchParams.get('location') || 'karasu';

    if (action === 'trending') {
      const trending = await getTrendingKeywords(location);
      return NextResponse.json({
        success: true,
        data: trending,
      });
    }

    if (action === 'analyze' && keyword) {
      const analysis = await analyzeKeyword(keyword);
      if (!analysis) {
        return NextResponse.json({
          success: false,
          error: 'Keyword analysis failed',
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    if (keyword) {
      const suggestions = await getKeywordSuggestions(keyword);
      return NextResponse.json({
        success: true,
        data: suggestions,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing keyword parameter',
    }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SEO keywords API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch keyword data',
    }, { status: 500 });
  }
}
