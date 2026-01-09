'use client';

import { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArticleInsights } from './ArticleInsights';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Clock,
  FileText,
  Calendar,
  Star,
  CheckCircle,
  Lock,
  Shield,
  Type,
} from 'lucide-react';
import type { ContextualLink } from './contextual-links';

const TableOfContents = dynamic(
  () => import('./EnhancedTableOfContents').then((mod) => ({ default: mod.EnhancedTableOfContents })),
  { ssr: false }
);

interface SidebarArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  published_at?: string | null;
  category?: string | null;
}

interface ArticleSidebarProps {
  basePath: string;
  article: {
    id: string;
    title: string;
    content: string;
    category?: string | null;
    published_at?: string | null;
  };
  readingTime: number;
  wordCount: number;
  relatedArticles?: SidebarArticle[];
  contextualLinks: ContextualLink[];
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : null;

const pickRegionalLinks = (links: ContextualLink[], limit = 2) =>
  links.filter((link) => link.intent === 'listing').slice(0, limit);

function ArticleSidebarComponent({
  basePath,
  article,
  readingTime,
  wordCount,
  relatedArticles = [],
  contextualLinks,
}: ArticleSidebarProps) {
  const publishedDate = formatDate(article.published_at);
  const regionalLinks = useMemo(() => pickRegionalLinks(contextualLinks), [contextualLinks]);

  return (
    <aside className="space-y-6">
      {/* Sticky Container - TOC + Article Info + Related + CTA */}
      <div className="sticky top-24 space-y-6 z-10">
        {/* Table of Contents - Primary Widget */}
        <Suspense
          fallback={
            <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          }
        >
          <TableOfContents
            content={article.content}
            articleId={article.id}
            articleTitle={article.title}
            className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </Suspense>

        {/* Article Information Card */}
        <div className="p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#006AFF] dark:text-blue-400" />
            Makale Bilgileri
          </h3>
          <div className="space-y-3">
            {/* Reading Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Okuma Süresi</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{readingTime} dk</span>
            </div>

            {/* Word Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Type className="h-4 w-4" />
                <span>Kelime Sayısı</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{wordCount.toLocaleString('tr-TR')}</span>
            </div>

            {/* Publication Date */}
            {publishedDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Yayın Tarihi</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{publishedDate}</span>
              </div>
            )}

            {/* Featured Article Badge */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <Star className="h-4 w-4 fill-amber-500 dark:fill-amber-400" />
                <span className="font-medium">Öne Çıkan Makale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Insights - Content Quality (Client-side only) */}
        <Suspense fallback={null}>
          <ArticleInsights
            content={article.content}
            title={article.title}
            readingTime={readingTime}
            wordCount={wordCount}
            keywords={[]}
          />
        </Suspense>

        {/* Reliability Card */}
        <div className="p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Güvenilirlik
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Doğrulanmış İçerik</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">Güvenli Platform</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">15+ Yıl Deneyim</span>
            </div>
          </div>
        </div>

        {/* Related Articles - Enhanced Cards */}
        {relatedArticles.length > 0 && (
          <div className="p-5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#006AFF] dark:text-blue-400" />
                İlgili Yazılar
              </h3>
              <Link
                href={`${basePath}/blog`}
                className="text-xs font-medium text-[#006AFF] dark:text-blue-400 hover:text-[#0052CC] dark:hover:text-blue-300 flex items-center gap-1"
              >
                Tümü
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {relatedArticles.slice(0, 4).map((related, index) => (
                <Link
                  key={related.id}
                  href={`${basePath}/blog/${related.slug}`}
                  className="group block p-3 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center group-hover:bg-[#006AFF] dark:group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 leading-snug line-clamp-2 transition-colors">
                        {related.title}
                      </p>
                      {related.category && (
                        <span className="inline-block mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {related.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regional Links - CTA */}
        {regionalLinks.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-[#006AFF]/5 dark:from-blue-500/10 to-blue-50/50 dark:to-blue-900/20 border border-[#006AFF]/10 dark:border-blue-500/20 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#006AFF] dark:text-blue-400" />
              Bölgedeki İlanlar
            </h3>
            <div className="space-y-2">
              {regionalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg hover:border-[#006AFF]/40 dark:hover:border-blue-400/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{link.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export const ArticleSidebar = memo(ArticleSidebarComponent);
