import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    console.log('[Content Quality API] Starting request...');
    const supabase = createServiceClient();
    console.log('[Content Quality API] Supabase client created');

    // Get articles stats - get ALL articles (not just published)
    let articles: any[] = [];
    let articlesError: any = null;
    
    try {
      // First, try to get count to see if table exists and has data
      const { count, error: countError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      console.log('Articles count:', count, 'Count error:', countError);
      
      // Now fetch actual data - use select("*") like other APIs
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .is('deleted_at', null) // Exclude deleted articles like other APIs
        .order('created_at', { ascending: false })
        .limit(1000); // Get up to 1000 articles
      
      if (error) {
        articlesError = error;
        console.error('Articles fetch error:', JSON.stringify(error, null, 2));
      } else {
        // Include ALL articles, not just published ones
        articles = Array.isArray(data) ? data : [];
        console.log(`Fetched ${articles.length} articles from database`);
        if (articles.length > 0) {
          console.log('Sample article:', {
            id: articles[0].id,
            title: articles[0].title,
            quality_score: articles[0].quality_score,
            has_content: !!(articles[0].content || articles[0].original_summary || articles[0].description_long)
          });
        }
      }
    } catch (err: any) {
      articlesError = err;
      console.error('Articles fetch exception:', err?.message || err);
    }

    // Get news articles stats - get ALL news articles
    let newsArticles: any[] = [];
    let newsError: any = null;
    
    try {
      // First, try to get count to see if table exists and has data
      const { count, error: countError } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true });
      
      console.log('News articles count:', count, 'Count error:', countError);
      
      // Now fetch actual data - use select("*") like other APIs
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .is('deleted_at', null) // Exclude deleted news like other APIs
        .order('created_at', { ascending: false })
        .limit(1000); // Get up to 1000 news articles
      
      if (error) {
        newsError = error;
        console.error('News articles fetch error:', JSON.stringify(error, null, 2));
      } else {
        // Include ALL news articles, not just published ones
        newsArticles = Array.isArray(data) ? data : [];
        console.log(`Fetched ${newsArticles.length} news articles from database`);
        if (newsArticles.length > 0) {
          console.log('Sample news article:', {
            id: newsArticles[0].id,
            title: newsArticles[0].title,
            quality_score: newsArticles[0].quality_score,
            has_content: !!(newsArticles[0].content || newsArticles[0].original_summary || newsArticles[0].description_long)
          });
        }
      }
    } catch (err: any) {
      newsError = err;
      console.error('News articles fetch exception:', err?.message || err);
    }

    // If tables don't exist or have errors, return empty data instead of error
    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      // If it's a table not found error, return empty array
      if (articlesError.code === 'PGRST116' || articlesError.code === '42P01' || articlesError.message?.includes('relation') || articlesError.message?.includes('does not exist')) {
        console.warn('Articles table not found, returning empty data');
        articles = [];
      } else {
        // For other errors, log but continue with empty array
        console.warn('Articles fetch error (continuing):', articlesError.message);
        articles = [];
      }
    }

    if (newsError) {
      console.error('Error fetching news articles:', newsError);
      // If it's a table not found error, return empty array
      if (newsError.code === 'PGRST116' || newsError.code === '42P01' || newsError.message?.includes('relation') || newsError.message?.includes('does not exist')) {
        console.warn('News articles table not found, returning empty data');
        newsArticles = [];
      } else {
        // For other errors, log but continue with empty array
        console.warn('News articles fetch error (continuing):', newsError.message);
        newsArticles = [];
      }
    }

    // Safely handle data - use empty arrays if null/undefined
    const safeArticles = Array.isArray(articles) ? articles : [];
    const safeNewsArticles = Array.isArray(newsArticles) ? newsArticles : [];

    console.log(`[Content Quality API] Processing: ${safeArticles.length} articles, ${safeNewsArticles.length} news articles`);

    const allItems = [
      ...safeArticles.map((a: any) => ({ ...a, type: 'article' as const })),
      ...safeNewsArticles.map((a: any) => ({ ...a, type: 'news' as const })),
    ];
    
    console.log(`[Content Quality API] Total items to process: ${allItems.length}`);
    
    if (allItems.length === 0) {
      console.warn('[Content Quality API] ⚠️  WARNING: No items found in database!');
      console.warn('[Content Quality API] This could mean:');
      console.warn('  1. Database tables (articles, news_articles) are empty');
      console.warn('  2. RLS policies are blocking service role access');
      console.warn('  3. Service role client is not working correctly');
      console.warn('  4. Tables do not exist');
    }

    // Calculate stats
    const total = allItems.length;
    const scores = allItems
      .map((item: any) => item.quality_score || 0)
      .filter((score: number) => score > 0);
    
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;

    const highQuality = allItems.filter((item: any) => (item.quality_score || 0) >= 70).length;
    const mediumQuality = allItems.filter((item: any) => {
      const score = item.quality_score || 0;
      return score >= 50 && score < 70;
    }).length;
    const lowQuality = allItems.filter((item: any) => (item.quality_score || 0) < 50).length;

    // Get low quality items - include items with score 0 or missing score
    // Also include ALL items if total is small (for initial setup)
    const lowQualityItems = allItems
      .filter((item: any) => {
        const score = item.quality_score || 0;
        // Include items with score < 70 OR score = 0 (not analyzed yet)
        // OR if we have very few items, show all of them
        if (total <= 10) {
          return true; // Show all items if we have 10 or fewer
        }
        return score < 70;
      })
      .map((item: any) => {
        // Get content from various possible fields
        const hasContent = !!(
          item.content || 
          item.original_summary || 
          item.description_long ||
          item.emlak_analysis
        );
        
        return {
          id: item.id,
          title: item.title || 'Untitled',
          slug: item.slug || '',
          type: item.type,
          qualityScore: item.quality_score || 0,
          issues: Array.isArray(item.quality_issues) 
            ? item.quality_issues 
            : (typeof item.quality_issues === 'number' ? item.quality_issues : []),
          hasContent, // For debugging
        };
      })
      .sort((a, b) => a.qualityScore - b.qualityScore)
      .slice(0, 100); // Top 100 lowest quality (increased from 50)
    
    console.log(`[Content Quality API] Total items: ${total}, Low quality items: ${lowQualityItems.length}`);
    
    if (total > 0 && lowQualityItems.length === 0) {
      console.warn('[Content Quality API] WARNING: Have items but no low quality items found!');
      console.warn('[Content Quality API] This might mean all items have score >= 70');
      // Show first 10 items anyway for debugging
      const debugItems = allItems.slice(0, 10).map((item: any) => {
        const hasContent = !!(
          item.content || 
          item.original_summary || 
          item.description_long ||
          item.emlak_analysis
        );
        return {
          id: item.id,
          title: item.title || 'Untitled',
          slug: item.slug || '',
          type: item.type,
          qualityScore: item.quality_score || 0,
          hasContent,
          issues: Array.isArray(item.quality_issues) 
            ? item.quality_issues 
            : (typeof item.quality_issues === 'number' ? item.quality_issues : []),
        };
      });
      console.log('[Content Quality API] Sample items (first 10):', JSON.stringify(debugItems, null, 2));
    }

    const response = {
      stats: {
        total,
        highQuality,
        mediumQuality,
        lowQuality,
        averageScore,
        needsReview: lowQuality,
      },
      lowQuality: lowQualityItems,
    };
    
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Content quality stats response:', JSON.stringify(response, null, 2));
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching quality stats:', error);
    // Return empty data instead of error to prevent UI crashes
    return NextResponse.json({
      stats: {
        total: 0,
        highQuality: 0,
        mediumQuality: 0,
        lowQuality: 0,
        averageScore: 0,
        needsReview: 0,
      },
      lowQuality: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 200 });
  }
}
