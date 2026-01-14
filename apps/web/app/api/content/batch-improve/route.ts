import { NextRequest, NextResponse } from 'next/server';
import { checkStaff } from '@/lib/admin/auth/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { analyzeContentWithAI, improveContentWithAI } from '@/lib/services/ai-content-improver';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/error-handler';
import { getRequestId } from '@/lib/api/middleware';

/**
 * POST /api/content/batch-improve
 * Batch improve multiple articles
 * Admin only
 */
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  
  // Check authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  const user = await checkStaff();
  
  if (!isDevelopment && !user) {
    return NextResponse.json(
      createErrorResponse(requestId, 'UNAUTHORIZED', 'Staff authentication required'),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { articleIds, autoApply = false } = body;

    const supabase = createServiceClient();
    
    // Fetch articles
    let query = supabase.from('articles').select('id, title, content, slug');
    
    if (articleIds && articleIds.length > 0) {
      query = query.in('id', articleIds);
    } else {
      query = query.eq('status', 'published').limit(50);
    }

    const { data: articles, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        createSuccessResponse(requestId, {
          processed: 0,
          improved: 0,
          skipped: 0,
          errors: 0,
          results: [],
        })
      );
    }

    const results: Array<{
      articleId: string;
      title: string;
      slug: string;
      improved: boolean;
      scoreBefore: number;
      scoreAfter: number;
      error?: string;
    }> = [];

    let improvedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process articles one by one (with rate limiting)
    for (const article of articles) {
      try {
        // Analyze
        const analysis = await analyzeContentWithAI(article.content || '', article.title);
        
        // Only improve if needed
        if (analysis.humanLikeScore < 70 || analysis.aiProbability > 0.5) {
          const improvement = await improveContentWithAI(
            article.content || '',
            article.title,
            analysis
          );

          if (improvement.score.improvement > 0 && autoApply) {
            // Update in database
            const { error: updateError } = await supabase
              .from('articles')
              .update({
                content: improvement.improved,
                updated_at: new Date().toISOString(),
              })
              .eq('id', article.id);

            if (updateError) {
              results.push({
                articleId: article.id,
                title: article.title,
                slug: article.slug,
                improved: false,
                scoreBefore: analysis.humanLikeScore,
                scoreAfter: analysis.humanLikeScore,
                error: updateError.message,
              });
              errorCount++;
            } else {
              results.push({
                articleId: article.id,
                title: article.title,
                slug: article.slug,
                improved: true,
                scoreBefore: improvement.score.before,
                scoreAfter: improvement.score.after,
              });
              improvedCount++;
            }
          } else {
            results.push({
              articleId: article.id,
              title: article.title,
              slug: article.slug,
              improved: false,
              scoreBefore: analysis.humanLikeScore,
              scoreAfter: improvement.score.after,
            });
            skippedCount++;
          }
        } else {
          results.push({
            articleId: article.id,
            title: article.title,
            slug: article.slug,
            improved: false,
            scoreBefore: analysis.humanLikeScore,
            scoreAfter: analysis.humanLikeScore,
          });
          skippedCount++;
        }

        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        results.push({
          articleId: article.id,
          title: article.title,
          slug: article.slug,
          improved: false,
          scoreBefore: 0,
          scoreAfter: 0,
          error: error.message,
        });
        errorCount++;
      }
    }

    return NextResponse.json(
      createSuccessResponse(requestId, {
        processed: articles.length,
        improved: improvedCount,
        skipped: skippedCount,
        errors: errorCount,
        results,
      })
    );
  } catch (error: any) {
    console.error('Batch improvement error:', error);
    return NextResponse.json(
      createErrorResponse(requestId, 'INTERNAL_ERROR', error.message || 'Batch improvement failed'),
      { status: 500 }
    );
  }
}
