import { NextRequest, NextResponse } from 'next/server';
import { checkContentQualityWithGemini, improveContentWithGemini } from '@/lib/services/gemini';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * POST /api/content/analyze-and-improve
 * Analyze content and optionally improve it
 * Admin panel endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, action, articleId } = body;

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      );
    }

    // Analyze content
    const qualityAnalysis = await checkContentQualityWithGemini(content, title);

    // Convert QualityAnalysis to ContentAnalysis format (what component expects)
    // Component expects: { humanLikeScore, aiProbability, overallQuality, issues, strengths, suggestions }
    const analysis = {
      humanLikeScore: qualityAnalysis.humanLikeScore || Math.max(0, qualityAnalysis.score - 20),
      aiProbability: qualityAnalysis.aiGenerated ? 0.8 : Math.max(0, (100 - qualityAnalysis.score) / 100),
      overallQuality: qualityAnalysis.score,
      issues: qualityAnalysis.issues.map(issue => issue.message),
      strengths: qualityAnalysis.issues
        .filter(issue => issue.severity === 'low')
        .map(issue => issue.suggestion)
        .slice(0, 3),
      suggestions: qualityAnalysis.suggestions,
    };

    // If action is "improve", also improve the content
    if (action === 'improve') {
      const supabase = createServiceClient();
      let improvementQueueId: string | null = null;

      // Create queue record
      try {
        const { data: queueRecord, error: queueError } = await supabase
          .from('content_ai_improvements')
          .insert({
            content_type: 'article',
            content_id: body.articleId || '00000000-0000-0000-0000-000000000000', // Placeholder if no articleId
            field: 'content',
            status: 'processing',
            original_content: content,
            progress: 0,
            progress_message: 'İyileştirme başlatılıyor...',
          })
          .select()
          .single();

        if (!queueError && queueRecord) {
          improvementQueueId = queueRecord.id;
        }
      } catch (err) {
        console.warn('[Content Improve API] Could not create queue record:', err);
      }

      try {
        // Update queue status
        if (improvementQueueId) {
          await supabase
            .from('content_ai_improvements')
            .update({ progress: 50, progress_message: 'İçerik iyileştiriliyor...' })
            .eq('id', improvementQueueId);
        }

        const improvement = await improveContentWithGemini(content, title, qualityAnalysis);
        
        // Update queue with result
        if (improvementQueueId) {
          await supabase
            .from('content_ai_improvements')
            .update({
              status: 'completed',
              improved_content: improvement.improved,
              quality_analysis: qualityAnalysis,
              improvement_result: {
                score: {
                  before: improvement.score.before,
                  after: improvement.score.after,
                  improvement: improvement.score.improvement,
                },
                changes: improvement.changes,
              },
              progress: 100,
              progress_message: 'Tamamlandı!',
              completed_at: new Date().toISOString(),
            })
            .eq('id', improvementQueueId);
        }
        
        // Convert to component's expected format
        // Component expects: { improvedText, changes: string[] }
        const improved = {
          improvedText: improvement.improved,
          changes: improvement.changes.map(change => {
            if (typeof change === 'string') {
              return change;
            }
            // change is { type, improved, reason }
            return change.reason || change.improved || 'İçerik iyileştirildi';
          }),
        };

        return NextResponse.json({
          analysis,
          improved,
          improvementId: improvementQueueId,
        });
      } catch (improveError: any) {
        // Update queue with error
        if (improvementQueueId) {
          await supabase
            .from('content_ai_improvements')
            .update({
              status: 'failed',
              error_message: improveError.message || 'İyileştirme başarısız',
              progress: 0,
            })
            .eq('id', improvementQueueId);
        }
        throw improveError;
      }
    }

    // Just return analysis
    return NextResponse.json({
      analysis,
    });
  } catch (error: any) {
    console.error('[Content Analyze API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
