/**
 * NewsSidebar Component
 * Sidebar for news detail pages
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Card } from '@karasu/ui';
import { ArticleInfoPanel } from '@/components/blocks/article-info-panel';
import { calculateReadingTime } from '@/lib/utils/reading-time';

interface NewsSidebarProps {
  basePath: string;
  article: {
    id: string;
    title: string;
    content: string;
    published_at?: string | null;
    featured?: boolean;
  };
  relatedNews?: Array<{
    id: string;
    title: string;
    slug: string;
    published_at?: string | null;
  }>;
}

export function NewsSidebar({
  basePath,
  article,
  relatedNews = [],
}: NewsSidebarProps) {
  const readingTime = calculateReadingTime(article.content);
  const wordCount = article.content.split(/\s+/).length;

  return (
    <aside className="hidden xl:block xl:sticky xl:top-24 h-fit space-y-6">
      {/* Article Info Panel */}
      <ArticleInfoPanel
        readingTime={readingTime}
        wordCount={wordCount}
        publishedAt={article.published_at || undefined}
        featured={article.featured || false}
        showTrustSignals={true}
        variant="sidebar"
      />

      {/* Navigation */}
      <Card variant="outlined" className="p-5">
        <Link
          href={`${basePath}/haberler`}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Haberler'e Dön</span>
        </Link>
      </Card>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <Card variant="outlined" className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            İlgili Haberler
          </h3>
          <div className="space-y-2">
            {relatedNews
              .filter(a => a.id !== article.id)
              .slice(0, 3)
              .map((news) => (
                <Link
                  key={news.id}
                  href={`${basePath}/haberler/${news.slug}`}
                  className="block group"
                >
                  <h4 className="text-xs font-medium text-gray-700 line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h4>
                </Link>
              ))}
          </div>
        </Card>
      )}
    </aside>
  );
}
