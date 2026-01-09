/**
 * Enhanced SEO API
 * 
 * Provides keyword research, suggestions, and SEO analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGoogleAutocompleteSuggestions,
  analyzeKeyword,
  generateSEOTitleSuggestions,
  generateMetaDescriptionSuggestions,
} from '@/lib/services/seo-enhanced';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'suggestions';
    const keyword = searchParams.get('keyword');
    const title = searchParams.get('title');
    const content = searchParams.get('content');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'suggestions':
        const suggestions = await getGoogleAutocompleteSuggestions(keyword);
        return NextResponse.json({
          success: true,
          suggestions,
        });

      case 'analyze':
        const analysis = await analyzeKeyword(keyword);
        return NextResponse.json({
          success: true,
          ...analysis,
        });

      case 'title-suggestions':
        if (!title) {
          return NextResponse.json(
            { error: 'Title parameter is required for title suggestions' },
            { status: 400 }
          );
        }
        const titleSuggestions = await generateSEOTitleSuggestions(title, keyword);
        return NextResponse.json({
          success: true,
          suggestions: titleSuggestions,
        });

      case 'description-suggestions':
        if (!title) {
          return NextResponse.json(
            { error: 'Title parameter is required for description suggestions' },
            { status: 400 }
          );
        }
        const descSuggestions = generateMetaDescriptionSuggestions(
          title,
          keyword,
          content || undefined
        );
        return NextResponse.json({
          success: true,
          suggestions: descSuggestions,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: suggestions, analyze, title-suggestions, description-suggestions' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SEO API error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to process SEO request', message: errorMessage },
      { status: 500 }
    );
  }
}
