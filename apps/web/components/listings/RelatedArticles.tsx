"use client";

import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { cn } from '@karasu/lib';
import { generateSlug } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  published_at?: string;
  category?: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  neighborhood: string;
  className?: string;
}

export function RelatedArticles({ articles, neighborhood, className }: RelatedArticlesProps) {
  // Default articles if none provided
  const defaultArticles: Article[] = [
    {
      id: '1',
      title: `${neighborhood} Mahallesi Emlak Yatırım Rehberi`,
      slug: `${generateSlug(neighborhood)}-emlak-yatirim-rehberi`,
      excerpt: `${neighborhood} bölgesinde gayrimenkul yatırımı yapmadan önce bilmeniz gereken her şey.`,
      published_at: new Date().toISOString(),
      category: 'Yatırım',
    },
    {
      id: '2',
      title: 'Karasu\'da Ev Alırken Dikkat Edilmesi Gerekenler',
      slug: 'karasu-ev-alirken-dikkat-edilmesi-gerekenler',
      excerpt: 'Karasu\'da emlak alımı öncesi kontrol etmeniz gereken kritik noktalar.',
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Rehber',
    },
    {
      id: '3',
      title: 'Sakarya Karasu Emlak Piyasası 2025',
      slug: 'sakarya-karasu-emlak-piyasasi-2025',
      excerpt: '2025 yılında Karasu emlak piyasasının gidişatı ve beklentiler.',
      published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Piyasa',
    },
  ];

  const displayArticles = articles.length > 0 ? articles : defaultArticles;

  if (displayArticles.length === 0) return null;

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-50 rounded-xl">
          <BookOpen className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">İlgili Yazılar</h3>
          <p className="text-sm text-gray-600">Faydalı içerikler</p>
        </div>
      </div>

      <div className="space-y-4">
        {displayArticles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="block group"
          >
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {article.category}
                      </span>
                    )}
                    {article.published_at && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.published_at).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
        >
          Tüm Yazıları Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default RelatedArticles;

