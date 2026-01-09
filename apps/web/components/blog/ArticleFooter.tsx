'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { EnhancedRelatedArticles } from './EnhancedRelatedArticles';
import { Article } from '@/lib/supabase/queries/articles';

const RelatedArticlesSection = dynamic(
  () => import('./RelatedArticlesSection').then((mod) => ({ default: mod.default })),
  { ssr: true }
);

interface ArticleFooterProps {
  relatedArticles: Article[];
  currentArticleId?: string;
  basePath?: string;
  className?: string;
}

/**
 * Article Footer Component
 * Shows related articles and additional content
 */
export function ArticleFooter({
  relatedArticles,
  currentArticleId,
  basePath = '',
  className,
}: ArticleFooterProps) {
  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <footer className={className}>
      {/* Enhanced Related Articles */}
      <Suspense
        fallback={
          <div className="py-8 md:py-12">
            <div className="h-8 w-48 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <EnhancedRelatedArticles
          articles={relatedArticles}
          currentArticleId={currentArticleId}
          basePath={basePath}
          limit={6}
          showTrending={true}
        />
      </Suspense>
    </footer>
  );
}
