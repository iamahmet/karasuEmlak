import { NextRequest, NextResponse } from 'next/server';
import { checkStaff } from '@/lib/admin/auth/server';
import { analyzeContentWithAI, improveContentWithAI } from '@/lib/services/ai-content-improver';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/error-handler';
import { getRequestId } from '@/lib/api/middleware';

/**
 * POST /api/content/analyze-and-improve
 * Analyze content and optionally improve it
 * Admin only
 */
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  
  // Check authentication - allow in development mode, require staff in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const user = await checkStaff();
  
  if (!isDevelopment && !user) {
    return NextResponse.json(
      createErrorResponse(requestId, 'UNAUTHORIZED', 'Staff authentication required'),
      { status: 401 }
    );
  }
  
  if (isDevelopment && !user) {
    console.warn(`[${requestId}] ⚠️  No authenticated user in development mode, allowing access`);
  }

  try {
    const body = await request.json();
    const { content, title, improve = false } = body;

    if (!content || !title) {
      return NextResponse.json(
        createErrorResponse(requestId, 'VALIDATION_ERROR', 'Content and title are required'),
        { status: 400 }
      );
    }

    // Analyze content
    const analysis = await analyzeContentWithAI(content, title);

    let improvedContent = null;
    if (improve) {
      const improvement = await improveContentWithAI(content, title, analysis);
      improvedContent = improvement;
    }

    return NextResponse.json(
      createSuccessResponse(requestId, {
        analysis,
        improved: improvedContent,
      })
    );
  } catch (error: any) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      createErrorResponse(requestId, 'INTERNAL_ERROR', error.message || 'Analysis failed'),
      { status: 500 }
    );
  }
}
