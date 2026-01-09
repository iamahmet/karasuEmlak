'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Article } from '@/lib/supabase/queries/articles';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { cn } from '@karasu/lib';

interface ArticleCardCompactProps {
  article: Article;
  basePath?: string;
  className?: string;
}

/**
 * Article Card Compact View Component
 * Minimal horizontal layout for compact view
 */
export function ArticleCardCompact({
  article,
  basePath = '',
  className,
}: ArticleCardCompactProps) {
  const readingTime = calculateReadingTime(article.content || '');

  return (
    <Link
      href={`${basePath}/blog/${article.slug}`}
      className={cn(
        'group block p-3 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#006AFF]/40 dark:hover:border-blue-500/40 hover:shadow-sm transition-all duration-200',
        className
      )}
      prefetch={true}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
              {article.excerpt}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{readingTime} dk</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
