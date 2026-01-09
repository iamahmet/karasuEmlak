/**
 * Content Optimization API Route
 * POST /api/services/seo/content
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent, getSEORecommendations } from '@/lib/services/content-optimization';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, keyword, url } = body;

    if (!content || !keyword) {
      return NextResponse.json({
        success: false,
        error: 'Missing content or keyword parameter',
      }, { status: 400 });
    }

    const action = body.action || 'analyze'; // 'analyze', 'recommendations'

    if (action === 'recommendations') {
      const recommendations = await getSEORecommendations(
        url || '',
        content,
        keyword
      );
      return NextResponse.json({
        success: true,
        data: recommendations,
      });
    }

    // Default: analyze content
    const analysis = await analyzeContent(content, keyword);
    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Content analysis failed',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Content optimization API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze content',
    }, { status: 500 });
  }
}
