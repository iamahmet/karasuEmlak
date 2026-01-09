/**
 * Content Enrichment API
 * 
 * Provides content analysis, optimization, and suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeContent,
  generateRelatedContentSuggestions,
  optimizeContentForSEO,
} from '@/lib/services/content-enrichment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, title, keywords, category, tags } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'analyze':
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required for analysis' },
            { status: 400 }
          );
        }
        const analysis = analyzeContent(content, keywords || [], 'tr');
        return NextResponse.json({
          success: true,
          ...analysis,
        });

      case 'optimize':
        if (!title || !content) {
          return NextResponse.json(
            { error: 'Title and content are required for optimization' },
            { status: 400 }
          );
        }
        const optimization = optimizeContentForSEO(title, content, keywords || []);
        return NextResponse.json({
          success: true,
          ...optimization,
        });

      case 'related':
        if (!title) {
          return NextResponse.json(
            { error: 'Title is required for related content suggestions' },
            { status: 400 }
          );
        }
        const related = generateRelatedContentSuggestions(title, category, tags);
        return NextResponse.json({
          success: true,
          suggestions: related,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, optimize, related' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Content enrichment API error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to process content request', message: errorMessage },
      { status: 500 }
    );
  }
}
