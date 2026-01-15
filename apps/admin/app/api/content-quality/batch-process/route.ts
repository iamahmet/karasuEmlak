import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { checkContentQualityWithGemini, batchAnalyzeContentQuality } from '@/lib/services/gemini';

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();

    // Fetch all articles
    let articles: any[] = [];
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, content, original_summary, description_long, quality_score, quality_issues')
        .limit(100); // Process max 100 at a time
      
      if (!error && data) {
        articles = data.map(a => ({
          id: a.id,
          title: a.title || 'Untitled',
          content: a.content || a.original_summary || a.description_long || '',
          type: 'article' as const,
        }));
      }
    } catch (err) {
      console.warn('Error fetching articles:', err);
    }

    // Fetch all news articles
    let newsArticles: any[] = [];
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, content, original_summary, description_long, quality_score, quality_issues')
        .limit(100);
      
      if (!error && data) {
        newsArticles = data.map(a => ({
          id: a.id,
          title: a.title || 'Untitled',
          content: a.content || a.original_summary || a.description_long || '',
          type: 'news' as const,
        }));
      }
    } catch (err) {
      console.warn('Error fetching news articles:', err);
    }

    // Filter out empty contents
    const allContents = [...articles, ...newsArticles].filter(
      item => item.content && item.content.trim().length > 0
    );

    if (allContents.length === 0) {
      return NextResponse.json({
        message: 'No content to process',
        processed: 0,
        updated: 0,
      });
    }

    // Batch analyze with Gemini
    const analysisResults = await batchAnalyzeContentQuality(
      allContents.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
      }))
    );

    // Update database with results
    let updated = 0;
    for (const result of analysisResults) {
      const content = allContents.find(c => c.id === result.id);
      if (!content) continue;

      const tableName = content.type === 'article' ? 'articles' : 'news_articles';
      const { error: updateError } = await supabase
        .from(tableName)
        .update({
          quality_score: result.analysis.score,
          quality_issues: result.analysis.issues.map(issue => ({
            type: issue.type,
            severity: issue.severity,
            message: issue.message,
            suggestion: issue.suggestion,
          })),
          updated_at: new Date().toISOString(),
        })
        .eq('id', result.id);

      if (!updateError) {
        updated++;
      } else {
        console.error(`Error updating ${result.id}:`, updateError);
      }
    }

    return NextResponse.json({
      message: 'Batch processing completed',
      processed: analysisResults.length,
      updated,
    });
  } catch (error: any) {
    console.error('Error starting batch processing:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
