import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles } from '@/lib/db/news';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * GET /api/news/breaking
 * Fetch breaking/featured content for news ticker
 * Combines:
 * - Featured news articles
 * - Featured blog articles
 * - Featured listings
 * Uses repository pattern with anon client (respects RLS)
 * Falls back to recent content if no featured content available
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    const newsItems: Array<{
      id: string;
      title: string;
      url: string;
      type: 'breaking' | 'trending' | 'new' | 'featured' | 'listing';
      publishedAt?: string;
      category?: string;
    }> = [];

    // 1. Get featured news articles
    try {
      const { articles: newsArticles } = await getNewsArticles(
        { featured: true },
        Math.ceil(limit * 0.4), // 40% news
        0
      );
      newsItems.push(...newsArticles.map((item) => ({
        id: `news-${item.id}`,
        title: item.title,
        url: `/haberler/${item.slug}`,
        type: item.featured ? 'breaking' as const : 'new' as const,
        publishedAt: item.published_at,
        category: 'Haber',
      })));
    } catch (error) {
      console.error('[api/news/breaking] Error fetching news:', error);
    }

    // 2. Get featured blog articles
    try {
      const supabase = createServiceClient();
      const { data: blogArticles } = await supabase
        .from('articles')
        .select('id, title, slug, published_at, featured')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(Math.ceil(limit * 0.3)); // 30% blog

      if (blogArticles) {
        newsItems.push(...blogArticles.map((item) => ({
          id: `blog-${item.id}`,
          title: item.title,
          url: `/blog/${item.slug}`,
          type: item.featured ? 'featured' as const : 'new' as const,
          publishedAt: item.published_at,
          category: 'Blog',
        })));
      }
    } catch (error) {
      console.error('[api/news/breaking] Error fetching blog articles:', error);
    }

    // 3. Get featured listings
    try {
      const supabase = createServiceClient();
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, slug, created_at, featured, status')
        .eq('featured', true)
        .in('status', ['satilik', 'kiralik'])
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit * 0.3)); // 30% listings

      if (listings) {
        newsItems.push(...listings.map((item) => ({
          id: `listing-${item.id}`,
          title: `${item.title} - ${item.status === 'satilik' ? 'Satılık' : 'Kiralık'}`,
          url: `/ilan/${item.slug}`,
          type: 'listing' as const,
          publishedAt: item.created_at,
          category: item.status === 'satilik' ? 'Satılık' : 'Kiralık',
        })));
      }
    } catch (error) {
      console.error('[api/news/breaking] Error fetching listings:', error);
    }

    // If we have items, sort by publishedAt and return
    if (newsItems.length > 0) {
      newsItems.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            news: newsItems.slice(0, limit),
          },
          count: newsItems.length,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
            'CDN-Cache-Control': 'public, s-maxage=300',
            'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          },
        }
      );
    }

    // Fallback: Get recent news if no featured content
    try {
      const { articles } = await getNewsArticles(
        undefined, // No filters - get all published
        limit,
        0
      );

      const fallbackItems = articles.map((item) => ({
        id: `news-${item.id}`,
        title: item.title,
        url: `/haberler/${item.slug}`,
        type: 'new' as const,
        publishedAt: item.published_at,
        category: 'Haber',
      }));

      return NextResponse.json(
        {
          success: true,
          data: {
            news: fallbackItems,
          },
          count: fallbackItems.length,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'CDN-Cache-Control': 'public, s-maxage=300',
            'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
          },
        }
      );
    } catch (error) {
      console.error('[api/news/breaking] Error fetching fallback news:', error);
    }

    // Return empty if everything fails
    return NextResponse.json(
      {
        success: true,
        data: {
          news: [],
        },
        count: 0,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('[api/news/breaking] Error:', error);
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json(
      {
        success: true,
        data: {
          news: [],
        },
        count: 0,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

