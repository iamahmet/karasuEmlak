/**
 * Backlinks API Route
 * GET /api/services/seo/backlinks?domain=karasuemlak.net
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBacklinks, checkBacklinks } from '@/lib/services/backlinks';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain') || 'karasuemlak.net';
    const url = searchParams.get('url');
    const action = searchParams.get('action'); // 'analyze', 'check'

    if (action === 'check' && url) {
      const backlinks = await checkBacklinks(url);
      if (!backlinks) {
        return NextResponse.json({
          success: false,
          error: 'Backlink check failed',
        }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: backlinks,
      });
    }

    // Default: analyze domain
    const analysis = await analyzeBacklinks(domain);
    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Backlink analysis failed',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Backlinks API route error:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze backlinks',
    }, { status: 500 });
  }
}
