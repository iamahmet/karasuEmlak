'use client';

import { Article } from '@/lib/supabase/queries/articles';
import { CardImage } from '@/components/images';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';
import { ExternalImage } from '@/components/images';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { getFreeImageForArticle } from '@/lib/images/free-image-fallback';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { cn } from '@karasu/lib';
import { useMemo } from 'react';

interface ArticleCardProps {
  article: Article;
  basePath: string;
}

export function ArticleCard({ article, basePath }: ArticleCardProps) {
  const [freeImageUrl, setFreeImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Fetch free image if no featured_image
    if (!article.featured_image) {
      getFreeImageForArticle(article)
        .then(url => {
          setFreeImageUrl(url);
          setImageLoading(false);
        })
        .catch(() => {
          setImageLoading(false);
        });
    } else {
      setImageLoading(false);
    }
  }, [article]);

  const imageUrl = article.featured_image || freeImageUrl;
  const isCloudinary = isValidCloudinaryId(article.featured_image);
  const readingTime = calculateReadingTime(article.content || '');

  // Quick AI check for badge (lightweight check)
  const aiCheckResult = useMemo(() => {
    if (!article.content || article.content.length < 100) return null;

    const content = article.content.replace(/<[^>]*>/g, ' ').toLowerCase();
    const genericPhrases = [
      'bu makalede', 'sonuç olarak', 'kısacası', 'özetlemek gerekirse',
      'bu yazıda', 'bu bağlamda', 'bu noktada', 'bu açıdan',
    ];
    const genericCount = genericPhrases.filter(phrase => content.includes(phrase)).length;
    const hasHighGeneric = genericCount >= 3;

    // Simple heuristic: if too many generic phrases, might be AI-like
    return hasHighGeneric ? { score: Math.max(0, 100 - genericCount * 15), isAI: true } : null;
  }, [article.content]);

  return (
    <Link href={`${basePath}/blog/${article.slug}`} prefetch={true}>
      <article className="group h-full bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] hover:border-primary/40 transition-all duration-500 hover:-translate-y-1.5 flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-white/5 dark:before:from-white/5 dark:before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:pointer-events-none backdrop-blur-sm z-0">
        {/* Image */}
        <div className="relative h-56 sm:h-60 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden border-b border-gray-100 dark:border-gray-800">
          {imageUrl ? (
            isCloudinary ? (
              <CardImage
                publicId={article.featured_image!}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <ExternalImage
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                fill
              />
            )
          ) : imageLoading ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="animate-pulse">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
              <FileText className="h-12 w-12 text-primary/40 dark:text-primary/30" />
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md text-primary dark:text-primary-light rounded-xl text-xs sm:text-sm font-bold shadow-lg border border-white/20 dark:border-white/10 tracking-wide uppercase">
                {article.category}
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          {readingTime > 0 && (
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white rounded-xl text-xs sm:text-sm font-medium border border-white/10 shadow-lg">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {readingTime} dk
              </span>
              {/* AI Check Badge - Admin Only (Hidden from public) */}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col relative z-20">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors text-gray-900 dark:text-white leading-[1.3] tracking-tight">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 line-clamp-3 leading-relaxed flex-1">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{article.author || 'Karasu Emlak'}</span>
            </div>

            {article.published_at && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">
                  {new Date(article.published_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Read More */}
          <div className="mt-7 flex items-center text-primary dark:text-primary-light font-bold text-sm tracking-wide transition-all group-hover:gap-1.5 w-max relative">
            <span>Devamını Oku</span>
            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left rounded-full" />
          </div>
        </div>
      </article>
    </Link>
  );
}

