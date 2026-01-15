import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { checkContentQualityWithGemini, improveContentWithGemini } from '@/lib/services/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = body;

    if (!type || (type !== 'article' && type !== 'news')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const tableName = type === 'article' ? 'articles' : 'news_articles';

    // Fetch content
    const { data: content, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const contentText = content.content || content.original_summary || content.description_long || '';
    const title = content.title || '';

    if (!contentText || contentText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is empty' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Run quality analysis with Gemini
    const qualityAnalysis = await checkContentQualityWithGemini(contentText, title, {
      category: content.category || undefined,
      keywords: content.tags || undefined,
    });

    // Improve content if score is low
    let improvedContent = contentText;
    let improvementResult = null;
    
    if (qualityAnalysis.score < 70) {
      try {
        improvementResult = await improveContentWithGemini(contentText, title, qualityAnalysis);
        improvedContent = improvementResult.improved;
      } catch (improveError: any) {
        console.error('Error improving content:', improveError);
        // Continue with original content if improvement fails
      }
    }

    // Update content with new quality score and improved content
    const updateData: any = {
      quality_score: qualityAnalysis.score,
      quality_issues: qualityAnalysis.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        suggestion: issue.suggestion,
      })),
      updated_at: new Date().toISOString(),
    };

    // Update content if improvement was successful
    if (improvementResult && improvedContent !== contentText) {
      updateData.content = improvedContent;
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update quality score: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newScore: qualityAnalysis.score,
      issues: qualityAnalysis.issues,
      improved: improvementResult !== null,
      scoreImprovement: improvementResult?.score.improvement || 0,
    });
  } catch (error: any) {
    console.error('Error improving content quality:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
