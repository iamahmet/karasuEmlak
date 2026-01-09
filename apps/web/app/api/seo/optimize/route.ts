import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { checkContentQuality, primaryKeywords, metaTemplates } from '@/lib/seo/keywords';

/**
 * POST /api/seo/optimize
 * Optimize content for SEO using AI
 */
export async function POST(request: NextRequest) {
  try {
    const { contentType, contentId } = await request.json();

    const supabase = createServiceClient();
    let content: any = null;
    let tableName = '';

    // Fetch content based on type
    switch (contentType) {
      case 'listing':
        tableName = 'listings';
        break;
      case 'article':
        tableName = 'articles';
        break;
      case 'news':
        tableName = 'news_articles';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', contentId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    content = data;

    // Check quality
    const qualityCheck = checkContentQuality({
      title: content.title || '',
      description: content.meta_description || content.excerpt || '',
      body: content.description_long || content.content || '',
      keywords: primaryKeywords.slice(0, 3) as any,
    });

    // Generate optimized meta if needed
    let optimizedMeta = content.meta_description;
    if (!optimizedMeta || qualityCheck.score < 70) {
      switch (contentType) {
        case 'listing':
          optimizedMeta = metaTemplates.listing(
            content.title,
            content.price_amount,
            content.location_neighborhood
          );
          break;
        case 'article':
          optimizedMeta = metaTemplates.blog(
            content.title,
            content.excerpt || ''
          );
          break;
      }

      // Update database
      if (optimizedMeta) {
        await supabase
          .from(tableName)
          .update({ 
            meta_description: optimizedMeta,
            seo_score: qualityCheck.score 
          })
          .eq('id', contentId);
      }
    }

    return NextResponse.json({
      success: true,
      qualityScore: qualityCheck.score,
      issues: qualityCheck.issues,
      suggestions: qualityCheck.suggestions,
      optimizedMeta,
    });
  } catch (error) {
    console.error('SEO optimize error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

