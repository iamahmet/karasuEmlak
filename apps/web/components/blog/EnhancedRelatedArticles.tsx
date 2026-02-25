'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Size özel öneriler</p>
          </div>
        </div>
        <Link
          href={`${basePath}/blog`}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary bg-primary/10 dark:bg-primary/20 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all border border-primary/20 dark:border-primary/30"
        >
          Tümü
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredArticles.map((article) => {
          const readingTime = calculateReadingTime(article.content || '');
          const publishedDate = formatDate(article.published_at);
          const recent = hasMounted && isRecent(article.published_at);
          const isCloudinary = isValidCloudinaryId(article.featured_image);

          return (
            <Link
              key={article.id}
              href={`${basePath}/blog/${article.slug}`}
              className="group block h-full"
              prefetch={true}
            >
              <article className="h-full bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col">
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
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg border border-white/20">
                        <TrendingUp className="h-3.5 w-3.5" />
                        YENİ
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Category */}
                  {article.category && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20 dark:border-primary/30">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 flex-1 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-5 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      {publishedDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="font-medium" suppressHydrationWarning>
                            {publishedDate}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">{readingTime} dk</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
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
