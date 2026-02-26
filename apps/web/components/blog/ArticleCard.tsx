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
  variant?: 'default' | 'hero' | 'compact' | 'horizontal';
}

export function ArticleCard({ article, basePath, variant = 'default' }: ArticleCardProps) {
  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';
  const isHorizontal = variant === 'horizontal';

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
    <Link href={`${basePath}/blog/${article.slug}`} prefetch={true} className={cn(isHero && "lg:col-span-2")}>
      <article className={cn(
        "group h-full bg-white dark:bg-gray-900/40 rounded-3xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:border-primary/40 transition-all duration-500 hover:-translate-y-1.5 flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-white/5 dark:before:from-white/5 dark:before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:pointer-events-none backdrop-blur-sm z-0",
        isHorizontal && "lg:flex-row lg:h-64",
        isHero && "lg:min-h-[400px]"
      )}>
        {/* Image Container */}
        <div className={cn(
          "relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden border-b border-gray-100 dark:border-gray-800 flex-shrink-0",
          isHorizontal ? "w-full lg:w-1/3 h-48 lg:h-full border-b-0 lg:border-r" : "h-56 sm:h-60"
        )}>
          {imageUrl ? (
            isCloudinary ? (
              <CardImage
                publicId={article.featured_image!}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes={isHero ? "(max-width: 1200px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
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
          {/* Active Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center px-4 py-1.5 bg-white/95 dark:bg-black/95 backdrop-blur-md text-[#006AFF] font-bold rounded-2xl text-xs shadow-lg border border-white/20 tracking-tighter uppercase">
                {article.category}
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          {readingTime > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-xl text-xs font-medium border border-white/10 shadow-lg">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} dk
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={cn(
          "p-6 sm:p-7 flex-1 flex flex-col relative z-20",
          isHorizontal && "lg:justify-center"
        )}>
          {isHero && (
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Haftanın Yazısı</span>
            </div>
          )}

          <h3
            className={cn(
              "font-bold mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors text-gray-900 dark:text-white leading-[1.25] tracking-tight",
              isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl",
              isCompact && "text-lg sm:text-xl"
            )}
            dangerouslySetInnerHTML={{ __html: article.title }}
          />

          {!isCompact && article.excerpt && (
            <p
              className={cn(
                "text-gray-600 dark:text-gray-400 mb-5 leading-relaxed flex-1",
                isHero ? "text-[16px] sm:text-[18px] line-clamp-3 lg:line-clamp-4" : "text-sm sm:text-base line-clamp-3",
                isHorizontal && "line-clamp-2"
              )}
              dangerouslySetInnerHTML={{ __html: article.excerpt }}
            />
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-bold text-gray-900">{article.author || 'Karasu Emlak'}</span>
            </div>

            {article.published_at && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-semibold">
                  {new Date(article.published_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            )}
          </div>

          {!isCompact && (
            <div className="mt-8 flex items-center text-[#006AFF] font-bold text-sm tracking-tight group-hover:gap-2 transition-all">
              <span>Devamını Oku</span>
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

