'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/lib/supabase/queries/articles';
import { ArticleCard } from './ArticleCard';
import { ArticleCardList } from './ArticleCardList';
import { ArticleCardCompact } from './ArticleCardCompact';
import { BlogViewModes, type ViewMode } from './BlogViewModes';
import { BlogSortOptions, type SortOption } from './BlogSortOptions';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@karasu/lib';

interface BlogArticlesGridProps {
  articles: Article[];
  basePath?: string;
  className?: string;
}

/**
 * Blog Articles Grid Component
 * Handles view modes, sorting, and rendering
 */
export function BlogArticlesGrid({
  articles,
  basePath = '',
  className,
}: BlogArticlesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'grid'
  );
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );

  // Update URL when view mode or sort changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (viewMode !== 'grid') {
      params.set('view', viewMode);
    } else {
      params.delete('view');
    }
    if (sort !== 'newest') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    router.replace(`${basePath}/blog?${params.toString()}`, { scroll: false });
  }, [viewMode, sort, basePath, router, searchParams]);

  // Sort articles
  const sortedArticles = [...articles].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime();
        const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime();
        return dateA - dateB;
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'trending':
        // Simple trending: recent + high views
        const recentA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const recentB = b.published_at ? new Date(b.published_at).getTime() : 0;
        const daysA = (Date.now() - recentA) / (1000 * 60 * 60 * 24);
        const daysB = (Date.now() - recentB) / (1000 * 60 * 60 * 24);
        const scoreA = (a.views || 0) / Math.max(1, daysA);
        const scoreB = (b.views || 0) / Math.max(1, daysB);
        return scoreB - scoreA;
      case 'reading-time':
        const timeA = a.content ? Math.ceil((a.content.replace(/<[^>]*>/g, '').split(/\s+/).length) / 200) : 0;
        const timeB = b.content ? Math.ceil((b.content.replace(/<[^>]*>/g, '').split(/\s+/).length) / 200) : 0;
        return timeA - timeB;
      case 'newest':
      default:
        const dateA2 = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime();
        const dateB2 = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime();
        return dateB2 - dateA2;
    }
  });

  return (
    <div className={className}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {sortedArticles.length} makale bulundu
        </div>
        <div className="flex items-center gap-4">
          <BlogSortOptions currentSort={sort} onSortChange={setSort} />
          <BlogViewModes currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      {/* Articles Grid/List */}
      {sortedArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Makale bulunamadı.</p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
            viewMode === 'list' && 'space-y-4',
            viewMode === 'compact' && 'space-y-2'
          )}
        >
          {sortedArticles.map((article) => {
            if (viewMode === 'list') {
              return (
                <ArticleCardList
                  key={article.id}
                  article={article}
                  basePath={basePath}
                />
              );
            }
            if (viewMode === 'compact') {
              return (
                <ArticleCardCompact
                  key={article.id}
                  article={article}
                  basePath={basePath}
                />
              );
            }
            return (
              <ArticleCard
                key={article.id}
                article={article}
                basePath={basePath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
