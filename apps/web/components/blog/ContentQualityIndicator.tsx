'use client';

import { useMemo } from 'react';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { assessContentQuality } from '@/lib/services/content-quality';
import { cn } from '@karasu/lib';

interface ContentQualityIndicatorProps {
  content: string;
  title: string;
  keywords?: string[];
  className?: string;
  variant?: 'badge' | 'full';
}

/**
 * Content Quality Indicator Component
 * Shows quick quality assessment
 */
export function ContentQualityIndicator({
  content,
  title,
  keywords = [],
  className,
  variant = 'badge',
}: ContentQualityIndicatorProps) {
  const quality = useMemo(() => {
    if (!content || content.trim() === '') {
      return null;
    }
    return assessContentQuality(content, title, keywords);
  }, [content, title, keywords]);

  if (!quality) {
    return null;
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Mükemmel', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 60) return { label: 'İyi', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    return { label: 'Geliştirilebilir', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const scoreInfo = getScoreLabel(quality.overall);

  if (variant === 'badge') {
    return (
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium', scoreInfo.bg, scoreInfo.color, className)}>
        {quality.overall >= 80 ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <TrendingUp className="h-3 w-3" />
        )}
        <span>{scoreInfo.label}</span>
        <span className="font-bold">{quality.overall}</span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('p-4 rounded-lg border', scoreInfo.bg, className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {quality.overall >= 80 ? (
            <CheckCircle2 className={cn('h-4 w-4', scoreInfo.color)} />
          ) : (
            <AlertCircle className={cn('h-4 w-4', scoreInfo.color)} />
          )}
          <span className={cn('text-sm font-semibold', scoreInfo.color)}>
            İçerik Kalitesi: {scoreInfo.label}
          </span>
        </div>
        <span className={cn('text-lg font-bold', scoreInfo.color)}>
          {quality.overall}/100
        </span>
      </div>
      {quality.strengths.length > 0 && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {quality.strengths[0]}
        </div>
      )}
    </div>
  );
}
