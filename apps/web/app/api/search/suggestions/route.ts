/**
 * Search Suggestions API
 * Returns article, category, and tag suggestions based on query
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/clients';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        articles: [],
        categories: [],
        tags: [],
      });
    }

    const supabase = createServiceClient();
    const queryLower = query.toLowerCase();

    // Get matching articles
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(5);

    // Get matching categories (from articles)
    const { data: allArticles } = await supabase
      .from('articles')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);

    const categories = Array.from(
      new Set(
        (allArticles || [])
          .map(a => a.category)
          .filter((cat): cat is string => 
            cat !== null && cat.toLowerCase().includes(queryLower)
          )
      )
    ).slice(0, 3);

    // Get matching tags (from articles)
    const { data: articlesWithTags } = await supabase
      .from('articles')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'is', null);

    const allTags = (articlesWithTags || [])
      .flatMap(a => a.tags || [])
      .filter((tag): tag is string => tag !== null && tag.toLowerCase().includes(queryLower));

    const tags = Array.from(new Set(allTags)).slice(0, 3);

    return NextResponse.json({
      articles: (articles || []).map(article => ({
        title: article.title,
        url: `/blog/${article.slug}`,
      })),
      categories,
      tags,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
