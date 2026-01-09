'use client';

import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Article } from '@/lib/supabase/queries/articles';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { CardImage } from '@/components/images';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';
import { ExternalImage } from '@/components/images';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { cn } from '@karasu/lib';

interface ArticleCardListProps {
  article: Article;
  basePath?: string;
  className?: string;
}

/**
 * Article Card List View Component
 * Horizontal card layout for list view
 */
export function ArticleCardList({
  article,
  basePath = '',
  className,
}: ArticleCardListProps) {
  const readingTime = calculateReadingTime(article.content || '');
  const isCloudinary = isValidCloudinaryId(article.featured_image);
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      href={`${basePath}/blog/${article.slug}`}
      className={cn(
        'group block bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-[#006AFF]/40 dark:hover:border-blue-500/40 transition-all duration-200',
        className
      )}
      prefetch={true}
    >
      <div className="flex flex-col md:flex-row gap-4 p-4">
        {/* Image */}
        {article.featured_image && (
          <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
            {isCloudinary ? (
              <CardImage
                publicId={article.featured_image}
                alt={generateBlogImageAlt(article.title, article.category, 'Karasu')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 200px"
              />
            ) : (
              <ExternalImage
                src={article.featured_image}
                alt={generateBlogImageAlt(article.title, article.category, 'Karasu')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={200}
                height={200}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Category */}
          {article.category && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-[#006AFF]/10 text-[#006AFF] dark:text-blue-400 text-xs font-semibold rounded-full">
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
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
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
            )}
            <ArrowRight className="h-3 w-3 ml-auto text-slate-400 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
