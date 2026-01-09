'use client';

import { useMemo, useEffect, useState } from 'react';
import { TrendingUp, Eye, Clock, FileText, Star } from 'lucide-react';
import { assessContentQuality } from '@/lib/services/content-quality';
import { cn } from '@karasu/lib';

interface ArticleInsightsProps {
  content: string;
  title: string;
  readingTime: number;
  wordCount: number;
  keywords?: string[];
  className?: string;
}

/**
 * Article Insights Component
 * Shows content quality metrics and insights
 */
export function ArticleInsights({
  content,
  title,
  readingTime,
  wordCount,
  keywords = [],
  className,
}: ArticleInsightsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quality = useMemo(() => {
    if (!mounted || !content || content.trim() === '') {
      return null;
    }
    try {
      return assessContentQuality(content, title, keywords);
    } catch (error) {
      console.error('Error assessing content quality:', error);
      return null;
    }
  }, [mounted, content, title, keywords]);

  if (!quality) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={cn('p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-xl', className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-[#006AFF] dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          İçerik Analizi
        </h3>
      </div>

      <div className="space-y-3">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Genel Kalite</span>
          <div className="flex items-center gap-2">
            <div className={cn('text-lg font-bold', getScoreColor(quality.overall))}>
              {quality.overall}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-500">/100</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className={cn('text-2xl font-bold mb-1', getScoreColor(quality.readability))}>
              {quality.readability}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Okunabilirlik</div>
          </div>
          <div className="text-center">
            <div className={cn('text-2xl font-bold mb-1', getScoreColor(quality.seo))}>
              {quality.seo}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">SEO</div>
          </div>
          <div className="text-center">
            <div className={cn('text-2xl font-bold mb-1', getScoreColor(quality.engagement))}>
              {quality.engagement}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Etkileşim</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <FileText className="h-3 w-3" />
              <span>Kelime</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {wordCount.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Okuma Süresi</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {readingTime} dk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
