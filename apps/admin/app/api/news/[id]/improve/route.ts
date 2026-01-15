import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { checkContentQualityWithGemini, improveContentWithGemini } from '@/lib/services/gemini';

/**
 * Send progress event to client
 */
function sendProgress(controller: ReadableStreamDefaultController, step: string, progress: number, data?: any) {
  const message = JSON.stringify({ type: 'progress', step, progress, data });
  controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
}

/**
 * AI Content Improvement API for News Articles
 * Analyzes and improves news article content based on quality rules
 * Uses streaming response to show progress
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { field = 'emlak_analysis' } = body; // Default to emlak_analysis for news

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let improvementQueueId: string | null = null;
        try {
          const supabase = createServiceClient();

          // Create initial queue record
          const { data: queueRecord, error: queueError } = await supabase
            .from('content_ai_improvements')
            .insert({
              content_type: 'news',
              content_id: id,
              field,
              status: 'processing',
              original_content: '', // Will be updated after fetch
              progress: 0,
              progress_message: 'Başlatılıyor...',
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (queueError) {
            console.error('[News Improve API] Error creating queue record:', queueError);
            // Continue anyway, queue is optional
          } else {
            improvementQueueId = queueRecord.id;
            console.log(`[News Improve API] Created queue record: ${improvementQueueId}`);
          }

          // Send initial progress
          sendProgress(controller, 'initializing', 0, { message: 'Başlatılıyor...' });
          
          // Update queue progress
          if (improvementQueueId) {
            await supabase
              .from('content_ai_improvements')
              .update({ progress: 0, progress_message: 'Başlatılıyor...' })
              .eq('id', improvementQueueId);
          }

          // Fetch news article
          sendProgress(controller, 'fetching', 5, { message: 'Haber yükleniyor...' });
          
          if (improvementQueueId) {
            await supabase
              .from('content_ai_improvements')
              .update({ progress: 5, progress_message: 'Haber yükleniyor...' })
              .eq('id', improvementQueueId);
          }
          
          const { data: article, error: fetchError } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

          if (fetchError || !article) {
            const error = JSON.stringify({ type: 'error', error: 'Haber bulunamadı' });
            controller.enqueue(new TextEncoder().encode(`data: ${error}\n\n`));
            controller.close();
            return;
          }

          // Get content from specified field
          const contentText = article[field as keyof typeof article] as string;
          const title = article.title || '';

          if (!contentText || (typeof contentText === 'string' && contentText.trim().length === 0)) {
            const error = JSON.stringify({ type: 'error', error: `${field} alanı boş` });
            controller.enqueue(new TextEncoder().encode(`data: ${error}\n\n`));
            controller.close();
            return;
          }

          // Check if at least one AI service is available
          if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
            const error = JSON.stringify({ type: 'error', error: 'GEMINI_API_KEY veya OPENAI_API_KEY yapılandırılmamış' });
            controller.enqueue(new TextEncoder().encode(`data: ${error}\n\n`));
            controller.close();
            return;
          }

          console.log(`[News Improve API] Starting improvement for article ${id}, field: ${field}`);

          // Step 1: Analyze content quality
          sendProgress(controller, 'analyzing', 15, { message: 'İçerik kalitesi analiz ediliyor...' });
          
          if (improvementQueueId) {
            await supabase
              .from('content_ai_improvements')
              .update({ 
                progress: 15, 
                progress_message: 'İçerik kalitesi analiz ediliyor...',
                original_content: typeof contentText === 'string' ? contentText : '',
              })
              .eq('id', improvementQueueId);
          }
          
          const qualityAnalysis = await checkContentQualityWithGemini(
            typeof contentText === 'string' ? contentText : '',
            title,
            {
              keywords: article.seo_keywords || undefined,
            }
          );

          console.log(`[News Improve API] Quality analysis completed. Score: ${qualityAnalysis.score}/100`);
          sendProgress(controller, 'analyzing', 50, { 
            message: 'Analiz tamamlandı', 
            score: qualityAnalysis.score 
          });
          
          if (improvementQueueId) {
            await supabase
              .from('content_ai_improvements')
              .update({ 
                progress: 50, 
                progress_message: 'Analiz tamamlandı',
                quality_analysis: qualityAnalysis,
              })
              .eq('id', improvementQueueId);
          }

          // Step 2: Improve content (always improve, regardless of score)
          sendProgress(controller, 'improving', 60, { message: 'İçerik iyileştiriliyor...' });
          
          if (improvementQueueId) {
            await supabase
              .from('content_ai_improvements')
              .update({ progress: 60, progress_message: 'İçerik iyileştiriliyor...' })
              .eq('id', improvementQueueId);
          }
          
          let improvedContent = typeof contentText === 'string' ? contentText : '';
          let improvementResult = null;

          try {
            improvementResult = await improveContentWithGemini(
              improvedContent,
              title,
              qualityAnalysis
            );
            improvedContent = improvementResult.improved;
            console.log(`[News Improve API] Content improvement completed. Estimated new score: ${improvementResult.score.after}`);
            sendProgress(controller, 'improving', 90, { 
              message: 'İyileştirme tamamlandı',
              newScore: improvementResult.score.after 
            });
            
            if (improvementQueueId) {
              await supabase
                .from('content_ai_improvements')
                .update({ 
                  progress: 90, 
                  progress_message: 'İyileştirme tamamlandı',
                })
                .eq('id', improvementQueueId);
            }
          } catch (improveError: any) {
            console.error('[News Improve API] Error improving content with Gemini:', improveError);
            
            // Update queue with error
            if (improvementQueueId) {
              await supabase
                .from('content_ai_improvements')
                .update({
                  status: 'failed',
                  error_message: improveError.message || 'Bilinmeyen hata',
                  quality_analysis: qualityAnalysis,
                })
                .eq('id', improvementQueueId);
            }
            
            const error = JSON.stringify({ 
              type: 'error', 
              error: 'İçerik iyileştirme başarısız: ' + (improveError.message || 'Bilinmeyen hata'),
              analysis: qualityAnalysis
            });
            controller.enqueue(new TextEncoder().encode(`data: ${error}\n\n`));
            controller.close();
            return;
          }

          // Update existing queue record with final results
          sendProgress(controller, 'saving', 95, { message: 'Sonuçlar kaydediliyor...' });
          
          if (improvementQueueId) {
            const { error: updateError } = await supabase
              .from('content_ai_improvements')
              .update({
                status: 'completed',
                improved_content: improvedContent,
                quality_analysis: qualityAnalysis,
                improvement_result: {
                  original: {
                    content: typeof contentText === 'string' ? contentText : '',
                    score: qualityAnalysis.score,
                  },
                  improved: {
                    content: improvedContent,
                    score: improvementResult.score.after,
                  },
                  analysis: {
                    score: qualityAnalysis.score,
                    passed: qualityAnalysis.passed,
                    issues: qualityAnalysis.issues,
                    suggestions: qualityAnalysis.suggestions,
                    aiGenerated: qualityAnalysis.aiGenerated,
                    humanLikeScore: qualityAnalysis.humanLikeScore,
                    seoScore: qualityAnalysis.seoScore,
                  },
                  improvement: {
                    scoreIncrease: improvementResult.score.improvement,
                    changes: improvementResult.changes,
                  },
                },
                progress: 100,
                progress_message: 'Tamamlandı!',
                completed_at: new Date().toISOString(),
              })
              .eq('id', improvementQueueId);

            if (updateError) {
              console.error('[News Improve API] Error updating queue record:', updateError);
            } else {
              console.log(`[News Improve API] Queue record updated: ${improvementQueueId}`);
            }
          }

          // Send final result
          sendProgress(controller, 'completed', 100, { message: 'Tamamlandı!' });
          
          const result = JSON.stringify({
            type: 'complete',
            success: true,
            improvementId: improvementQueueId,
            original: {
              content: typeof contentText === 'string' ? contentText : '',
              score: qualityAnalysis.score,
            },
            improved: {
              content: improvedContent,
              score: improvementResult.score.after,
            },
            analysis: {
              score: qualityAnalysis.score,
              passed: qualityAnalysis.passed,
              issues: qualityAnalysis.issues,
              suggestions: qualityAnalysis.suggestions,
              aiGenerated: qualityAnalysis.aiGenerated,
              humanLikeScore: qualityAnalysis.humanLikeScore,
              seoScore: qualityAnalysis.seoScore,
            },
            improvement: {
              scoreIncrease: improvementResult.score.improvement,
              changes: improvementResult.changes,
            },
            field,
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${result}\n\n`));
          controller.close();
        } catch (error: any) {
          console.error('[News Improve API] Error:', error);
          
          // Update queue with error if we have an ID
          if (improvementQueueId) {
            const supabase = createServiceClient();
            await supabase
              .from('content_ai_improvements')
              .update({
                status: 'failed',
                error_message: error.message || 'Sunucu hatası',
              })
              .eq('id', improvementQueueId);
          }
          
          const errorMsg = JSON.stringify({ 
            type: 'error', 
            error: error.message || 'Sunucu hatası' 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorMsg}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[News Improve API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

/**
 * Apply improved content to news article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { improvedContent, field = 'emlak_analysis', qualityScore } = body;

    if (!improvedContent) {
      return NextResponse.json(
        { success: false, error: 'İyileştirilmiş içerik gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Update the specified field
    const updateData: any = {
      [field]: improvedContent,
      updated_at: new Date().toISOString(),
    };

    // Update quality score if provided
    if (qualityScore !== undefined) {
      updateData.quality_score = qualityScore;
    }

    const { data, error } = await supabase
      .from('news_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[News Improve API] Update error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`[News Improve API] Content updated successfully for article ${id}`);

    return NextResponse.json({
      success: true,
      article: data,
    });
  } catch (error: any) {
    console.error('[News Improve API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
