'use client';

import Link from 'next/link';
import { Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@karasu/lib';

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    slug: string;
    original_summary?: string;
    emlak_analysis?: string;
    published_at?: string;
    source_domain?: string;
  };
  basePath: string;
  variant?: 'default' | 'compact';
}

export function NewsCard({ news, basePath, variant = 'default' }: NewsCardProps) {
  const isCompact = variant === 'compact';
  const summary = news.emlak_analysis || news.original_summary || '';
  const truncatedSummary = summary.length > 120 ? summary.substring(0, 120) + '...' : summary;

  // Generate proper link
  // If slug is a full URL (Gündem articles), use it directly
  // Otherwise, use internal news page
  const newsLink = news.slug.startsWith('http')
    ? news.slug
    : `${basePath}/haberler/${news.slug}`;

  return (
    <Link
      href={newsLink}
      target={news.source_domain === 'karasugundem.com' ? '_blank' : undefined}
      rel={news.source_domain === 'karasugundem.com' ? 'noopener noreferrer' : undefined}
      className={cn(
        'group block bg-white rounded-lg border border-gray-200 overflow-hidden',
        'hover:border-primary/40 hover:shadow-md transition-all duration-200',
        isCompact ? 'p-4' : 'p-5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5',
          'flex items-center justify-center',
          isCompact ? 'w-10 h-10' : 'w-12 h-12'
        )}>
          <TrendingUp className={cn('text-primary', isCompact ? 'h-5 w-5' : 'h-6 w-6')} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors',
              isCompact ? 'text-sm mb-1' : 'text-base mb-2'
            )}
            dangerouslySetInnerHTML={{ __html: news.title }}
          />

          {!isCompact && truncatedSummary && (
            <p
              className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: truncatedSummary }}
            />
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {news.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(news.published_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
            {news.source_domain && (
              <div className="flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="truncate">{news.source_domain}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
