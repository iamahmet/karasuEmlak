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
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@karasu/lib';

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

  return (
    <Link href={`${basePath}/blog/${article.slug}`} prefetch={true}>
      <article className="group h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
        {/* Image */}
        <div className="relative h-40 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {imageUrl ? (
            isCloudinary ? (
              <CardImage
                publicId={article.featured_image!}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <ExternalImage
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                fill
              />
            )
          ) : imageLoading ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Görsel yükleniyor...</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Görsel yok</span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center px-3 py-1 bg-white/95 backdrop-blur-sm text-primary rounded-full text-xs font-semibold shadow-md">
                {article.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 flex-1 flex flex-col">
          <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors text-gray-900 leading-snug">
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed flex-1">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-gray-100 rounded-md">
                <User className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
              <span className="font-medium">{article.author || 'Karasu Emlak'}</span>
            </div>
            
            {article.published_at && (
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-gray-100 rounded-md">
                  <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
                <span>
                  {new Date(article.published_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {readingTime > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-gray-100 rounded-md">
                  <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
                <span>{readingTime} dk</span>
              </div>
            )}
          </div>

          {/* Read More */}
          <div className="mt-5 flex items-center text-primary font-semibold text-base group-hover:gap-2 transition-all">
            <span>Devamını Oku</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

