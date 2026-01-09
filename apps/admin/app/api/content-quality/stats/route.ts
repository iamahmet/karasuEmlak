import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Get articles stats
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, quality_score, quality_issues')
      .eq('status', 'published');

    // Get news articles stats
    const { data: newsArticles, error: newsError } = await supabase
      .from('news_articles')
      .select('id, title, slug, quality_score, quality_issues')
      .eq('status', 'published');

    if (articlesError || newsError) {
      return NextResponse.json(
        { error: 'Failed to fetch quality stats' },
        { status: 500 }
      );
    }

    const allItems = [
      ...(articles || []).map(a => ({ ...a, type: 'article' as const })),
      ...(newsArticles || []).map(a => ({ ...a, type: 'news' as const })),
    ];

    // Calculate stats
    const total = allItems.length;
    const scores = allItems
      .map(item => item.quality_score || 0)
      .filter(score => score > 0);
    
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const highQuality = allItems.filter(item => (item.quality_score || 0) >= 70).length;
    const mediumQuality = allItems.filter(item => {
      const score = item.quality_score || 0;
      return score >= 50 && score < 70;
    }).length;
    const lowQuality = allItems.filter(item => (item.quality_score || 0) < 50).length;

    // Get low quality items
    const lowQualityItems = allItems
      .filter(item => (item.quality_score || 0) < 70)
      .map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        type: item.type,
        score: item.quality_score || 0,
        issues: Array.isArray(item.quality_issues) ? item.quality_issues.length : 0,
        aiProbability: 0, // Will be calculated if needed
        updated_at: new Date().toISOString(),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 50); // Top 50 lowest quality

    return NextResponse.json({
      stats: {
        total,
        highQuality,
        mediumQuality,
        lowQuality,
        averageScore,
        needsReview: lowQuality,
      },
      lowQuality: lowQualityItems,
    });
  } catch (error: any) {
    console.error('Error fetching quality stats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
