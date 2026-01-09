'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Tag, 
  TrendingUp, 
  Clock, 
  ArrowLeft,
  Home,
  FileText,
  User
} from 'lucide-react';
import { Article } from '@/lib/supabase/queries/articles';
import { cn } from '@karasu/lib';
import { categoryToSlug, categoriesMatch } from '@/lib/utils/category-utils';

interface BlogSidebarProps {
  basePath?: string;
  currentCategory?: string;
  currentArticleId?: string;
  popularArticles?: Article[];
  categories?: Array<{ name: string; count: number }>;
}

export function BlogSidebar({ 
  basePath = '',
  currentCategory,
  currentArticleId,
  popularArticles = [],
  categories = []
}: BlogSidebarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className={cn(
      "space-y-6",
      isSticky && "lg:sticky lg:top-24"
    )}>
      {/* Navigation */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Navigasyon
        </h3>
        <nav className="space-y-2">
          <Link
            href={`${basePath}/blog`}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors",
              !currentCategory && !currentArticleId
                ? "bg-primary/10 text-primary font-semibold"
                : "text-gray-700 hover:bg-gray-50 hover:text-primary"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tüm Yazılar</span>
          </Link>
          {currentArticleId && (
            <Link
              href={`${basePath}/blog`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Blog'a Dön</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Kategoriler
          </h3>
          <nav className="space-y-2">
            {categories.map((category) => {
              const categorySlug = categoryToSlug(category.name);
              const isActive = currentCategory 
                ? categoriesMatch(currentCategory, category.name) || currentCategory === categorySlug
                : false;
              return (
                <Link
                  key={category.name}
                  href={`${basePath}/blog/kategori/${encodeURIComponent(categorySlug)}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                  )}
                >
                  <span>{category.name}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {category.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popüler Yazılar
          </h3>
          <div className="space-y-3">
            {popularArticles
              .filter(article => article.id !== currentArticleId)
              .slice(0, 5)
              .map((article, index) => (
                <Link
                  key={article.id}
                  href={`${basePath}/blog/${article.slug}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      {article.published_at && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(article.published_at).toLocaleDateString('tr-TR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Hızlı Erişim
        </h3>
        <nav className="space-y-2">
          <Link
            href={`${basePath}/rehber`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-white/50 hover:text-primary transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Rehber</span>
          </Link>
          <Link
            href={`${basePath}/haberler`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-white/50 hover:text-primary transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Haberler</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
