import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * GET /api/content-improvement/queue
 * Get improvement queue status and recent improvements
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get queue statistics
    const { data: allImprovements, error } = await supabase
      .from('content_ai_improvements')
      .select('id, status, progress, content_type, content_id, created_at, completed_at, error_message')
      .order('created_at', { ascending: false })
      .limit(100);

    // If table doesn't exist, return empty stats
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          stats: {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            total: 0,
          },
          recent: [],
        });
      }
      throw error;
    }

    // Calculate statistics
    const stats = {
      pending: allImprovements?.filter(i => i.status === 'pending').length || 0,
      processing: allImprovements?.filter(i => i.status === 'processing').length || 0,
      completed: allImprovements?.filter(i => i.status === 'completed').length || 0,
      failed: allImprovements?.filter(i => i.status === 'failed').length || 0,
      total: allImprovements?.length || 0,
    };

    // Get recent improvements (last 20)
    const recent = allImprovements?.slice(0, 20) || [];

    // Get content titles for recent improvements
    const contentIds = recent
      .filter(i => i.content_type === 'article' && i.content_id !== '00000000-0000-0000-0000-000000000000')
      .map(i => i.content_id);

    let contentTitles: Record<string, string> = {};
    if (contentIds.length > 0) {
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title')
        .in('id', contentIds);

      // Ignore errors when fetching article titles (table might not exist or RLS issue)
      if (!articlesError && articles) {
        contentTitles = articles.reduce((acc, article) => {
          acc[article.id] = article.title;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Enrich recent improvements with titles
    const enrichedRecent = recent.map(improvement => ({
      ...improvement,
      content_title: contentTitles[improvement.content_id] || 'Bilinmeyen İçerik',
    }));

    return NextResponse.json({
      stats,
      recent: enrichedRecent,
    });
  } catch (error: any) {
    console.error('[Queue API] Error:', error);
    
    // Return empty stats on error (graceful degradation)
    // Always return 200 OK with empty data, never 500
    return NextResponse.json(
      {
        stats: {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total: 0,
        },
        recent: [],
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 200 } // Always return 200, never 500
    );
  }
}
