'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Article } from '@/lib/supabase/queries/articles';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import Image from 'next/image';
import { CardImage } from '@/components/images';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { cn } from '@karasu/lib';

interface EnhancedRelatedArticlesProps {
  articles: Article[];
  currentArticleId?: string;
  basePath?: string;
  className?: string;
  title?: string;
  limit?: number;
  showTrending?: boolean;
}

/**
 * Enhanced Related Articles Component
 * Shows intelligent article recommendations with quality indicators
 */
export function EnhancedRelatedArticles({
  articles,
  currentArticleId,
  basePath = '',
  className,
  title = 'İlgili Yazılar',
  limit = 6,
  showTrending = false,
}: EnhancedRelatedArticlesProps) {
  const filteredArticles = useMemo(() => {
    return articles
      .filter(article => article.id !== currentArticleId)
      .slice(0, limit);
  }, [articles, currentArticleId, limit]);

  if (filteredArticles.length === 0) {
    return null;
  }

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const isRecent = (date?: string | null) => {
    if (!date) return false;
    const publishedDate = new Date(date);
    const now = new Date();
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  };

  return (
    <section className={cn('py-8 md:py-12', className)}>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#006AFF]/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-[#006AFF]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>
        <Link
          href={`${basePath}/blog`}
          className="text-sm font-medium text-[#006AFF] dark:text-blue-400 hover:text-[#0052CC] dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          Tümü
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredArticles.map((article) => {
          const readingTime = calculateReadingTime(article.content || '');
          const publishedDate = formatDate(article.published_at);
          const recent = isRecent(article.published_at);
          const isCloudinary = isValidCloudinaryId(article.featured_image);

          return (
            <Link
              key={article.id}
              href={`${basePath}/blog/${article.slug}`}
              className="group block h-full"
              prefetch={true}
            >
              <article className="h-full bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-[#006AFF]/40 dark:hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
                {/* Image */}
                {article.featured_image && (
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {isCloudinary ? (
                      <CardImage
                        publicId={article.featured_image}
                        alt={generateBlogImageAlt(article.title, article.category, 'Karasu')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <Image
                        src={article.featured_image}
                        alt={generateBlogImageAlt(article.title, article.category, 'Karasu')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={225}
                        unoptimized
                      />
                    )}
                    {recent && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-[#006AFF] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Yeni
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Category */}
                  {article.category && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-[#006AFF]/10 text-[#006AFF] dark:text-blue-400 text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {publishedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{publishedDate}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{readingTime} dk</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
