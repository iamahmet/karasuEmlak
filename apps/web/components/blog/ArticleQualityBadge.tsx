'use client';

import { useMemo } from 'react';
import { Star, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { assessContentQuality } from '@/lib/services/content-quality';
import { cn } from '@karasu/lib';

interface ArticleQualityBadgeProps {
  content: string;
  title: string;
  keywords?: string[];
  className?: string;
}

/**
 * Article Quality Badge Component
 * Shows content quality score and quick insights
 */
export function ArticleQualityBadge({
  content,
  title,
  keywords = [],
  className,
}: ArticleQualityBadgeProps) {
  const quality = useMemo(() => {
    if (!content || content.trim() === '') {
      return null;
    }
    return assessContentQuality(content, title, keywords);
  }, [content, title, keywords]);

  if (!quality) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className={cn('p-4 rounded-lg border', getScoreBg(quality.overall), className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('h-4 w-4', getScoreColor(quality.overall))} />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            İçerik Kalitesi
          </span>
        </div>
        <div className={cn('text-lg font-bold', getScoreColor(quality.overall))}>
          {quality.overall}/100
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-slate-600 dark:text-slate-400 mb-1">Okunabilirlik</div>
          <div className={cn('font-semibold', getScoreColor(quality.readability))}>
            {quality.readability}
          </div>
        </div>
        <div>
          <div className="text-slate-600 dark:text-slate-400 mb-1">SEO</div>
          <div className={cn('font-semibold', getScoreColor(quality.seo))}>
            {quality.seo}
          </div>
        </div>
        <div>
          <div className="text-slate-600 dark:text-slate-400 mb-1">Etkileşim</div>
          <div className={cn('font-semibold', getScoreColor(quality.engagement))}>
            {quality.engagement}
          </div>
        </div>
      </div>

      {quality.strengths.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {quality.strengths[0]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
