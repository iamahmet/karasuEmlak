import Link from 'next/link';
import { TrendingUp, Tag, Clock, ChevronRight, FileText, Home, Calculator, MapPin } from 'lucide-react';
import { cn } from '@karasu/lib';
import { EnhancedTableOfContents } from './EnhancedTableOfContents';
import { RelatedListingsCTA } from './RelatedListingsCTA';
import { NewsletterSignup } from './NewsletterSignup';

interface Category {
  name: string;
  slug: string;
  count?: number;
}

interface PopularArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  published_at?: string | null;
}

interface EnhancedArticleSidebarProps {
  basePath: string;
  article: {
    id: string;
    title: string;
    content: string;
    slug: string;
    category?: string | null;
  };
  readingTime: number;
  wordCount: number;
  categories: Category[];
  popularArticles: PopularArticle[];
  className?: string;
}

export function EnhancedArticleSidebar({
  basePath,
  article,
  readingTime,
  wordCount,
  categories,
  popularArticles,
  className,
}: EnhancedArticleSidebarProps) {
  // Quick links based on content context
  const quickLinks = [
    { href: `${basePath}/satilik`, label: 'Satılık İlanlar', icon: Home },
    { href: `${basePath}/kiralik`, label: 'Kiralık İlanlar', icon: MapPin },
    { href: `${basePath}/kredi-hesaplayici`, label: 'Kredi Hesaplayıcı', icon: Calculator },
    { href: `${basePath}/blog`, label: 'Tüm Yazılar', icon: FileText },
  ];

  return (
    <aside className={cn('space-y-6', className)}>
      {/* Table of Contents - Desktop */}
      <div className="hidden xl:block sticky top-24">
        <EnhancedTableOfContents
          content={article.content}
          articleId={article.id}
          articleTitle={article.title}
          className="mb-6"
        />

        {/* Article Stats */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Makale Bilgileri</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Okuma süresi</span>
              <span className="font-medium text-gray-900">{readingTime} dk</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Kelime sayısı</span>
              <span className="font-medium text-gray-900">{wordCount.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>

        {/* Related Listings CTA */}
        <RelatedListingsCTA
          basePath={basePath}
          articleTitle={article.title}
          articleContent={article.content}
          className="mb-6"
        />

        {/* Popular Articles */}
        {popularArticles.length > 0 && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Popüler Yazılar
            </h3>
            <div className="space-y-3">
              {popularArticles.slice(0, 5).map((post, index) => (
                <Link
                  key={post.id}
                  href={`${basePath}/blog/${post.slug}`}
                  className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Kategoriler
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`${basePath}/blog/kategori/${category.slug}`}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {category.name}
                  {category.count && (
                    <span className="ml-1 text-gray-400">({category.count})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Hızlı Erişim</h3>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-primary transition-colors">
                  <link.icon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                  {link.label}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <NewsletterSignup
          articleId={article.id}
          articleSlug={article.slug}
          articleTitle={article.title}
          variant="compact"
        />
      </div>
    </aside>
  );
}
