'use client';

import { Article } from '@/lib/supabase/queries/articles';
import { CardImage } from '@/components/images';
import { ExternalImage } from '@/components/images';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowRight, FileText } from 'lucide-react';
import { cn } from '@karasu/lib';

interface RelatedArticlesProps {
  articles: Article[];
  currentArticleId?: string;
  title?: string;
  limit?: number;
  basePath?: string;
}

export default function RelatedArticles({
  articles,
  currentArticleId,
  title = 'İlgili Yazılar',
  limit = 3,
  basePath = '',
}: RelatedArticlesProps) {
  // Filter out current article and limit results
  const filteredArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, limit);

  if (filteredArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredArticles.map((article) => {
          const isCloudinary = isValidCloudinaryId(article.featured_image);
          const readingTime = calculateReadingTime(article.content || '');
          
          return (
            <Link
              key={article.id}
              href={`${basePath}/blog/${article.slug}`}
              className="group h-full bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {article.featured_image ? (
                  isCloudinary ? (
                    <CardImage
                      publicId={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <ExternalImage
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      fill
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Görsel yok</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {article.category && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 bg-white/95 backdrop-blur-sm text-primary rounded-full text-xs font-semibold shadow-md">
                      {article.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors text-gray-900">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-gray-100 rounded-md">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{article.author || 'Karasu Emlak'}</span>
                  </div>
                  {article.published_at && (
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-gray-100 rounded-md">
                        <Calendar className="w-3 h-3" />
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
                        <Clock className="w-3 h-3" />
                      </div>
                      <span>{readingTime} dk</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                  <span>Devamını Oku</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

