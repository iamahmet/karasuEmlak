import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get articles pending review
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, author, created_at, quality_score, review_status, reviewed_by, reviewed_at, review_notes')
      .eq('review_status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get news articles pending review
    const { data: newsArticles, error: newsError } = await supabase
      .from('news_articles')
      .select('id, title, slug, author, created_at, quality_score, review_status, reviewed_by, reviewed_at, review_notes')
      .eq('review_status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(50);

    if (articlesError || newsError) {
      return NextResponse.json(
        { error: 'Failed to fetch pending reviews' },
        { status: 500 }
      );
    }

    const items = [
      ...(articles || []).map(a => ({ ...a, type: 'article' as const })),
      ...(newsArticles || []).map(a => ({ ...a, type: 'news' as const })),
    ];

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
