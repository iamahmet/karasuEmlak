'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  Clock,
  FileText,
  Calendar,
  Star,
  CheckCircle,
  Lock,
  Shield,
  Type,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NewsletterSignup } from '@/components/blog/NewsletterSignup';

const TableOfContents = dynamic(
  () => import('@/components/blog/EnhancedTableOfContents').then((mod) => ({ default: mod.EnhancedTableOfContents })),
  { ssr: false }
);

interface RelatedGuide {
  id: string;
  title: string;
  href: string;
  description?: string;
}

interface GuideSidebarProps {
  basePath: string;
  guide: {
    id: string;
    title: string;
    content?: string;
    published_at?: string | null;
  };
  readingTime: number;
  wordCount: number;
  relatedGuides?: RelatedGuide[];
  showTOC?: boolean;
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

function GuideSidebarComponent({
  basePath,
  guide,
  readingTime,
  wordCount,
  relatedGuides = [],
  showTOC = true,
}: GuideSidebarProps) {
  const publishedDate = formatDate(guide.published_at);

  return (
    <aside className="space-y-6">
      {/* Sticky Container */}
      <div className="sticky top-24 space-y-6 z-10">
        {/* Table of Contents */}
        {showTOC && guide.content && (
          <Suspense
            fallback={
              <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border-2 border-gray-200 dark:border-gray-700" />
            }
          >
            <TableOfContents
              content={guide.content}
              articleId={guide.id}
              articleTitle={guide.title}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg"
            />
          </Suspense>
        )}

        {/* Guide Information Card */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            Rehber Bilgileri
          </h3>
          <div className="space-y-4">
            {/* Reading Time */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Okuma Süresi</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{readingTime} dk</span>
            </div>

            {/* Word Count */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Type className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Kelime Sayısı</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{wordCount.toLocaleString('tr-TR')}</span>
            </div>

            {/* Publication Date */}
            {publishedDate && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Yayın Tarihi</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{publishedDate}</span>
              </div>
            )}

            {/* Featured Guide Badge */}
            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                <Star className="h-5 w-5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Öne Çıkan Rehber</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reliability Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-emerald-900/10 dark:via-gray-800 dark:to-emerald-900/10 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Güvenilirlik
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Doğrulanmış İçerik</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Güvenli Platform</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">15+ Yıl Deneyim</span>
            </div>
          </div>
        </div>

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                İlgili Rehberler
              </h3>
              <Link
                href={`${basePath}/rehber`}
                className="text-xs font-bold text-primary hover:text-primary-dark dark:hover:text-primary-light flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-all"
              >
                Tümü
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {relatedGuides.slice(0, 4).map((related, index) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="group block p-4 bg-white dark:bg-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary text-xs font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary transition-all border border-primary/20 dark:border-primary/30 group-hover:border-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary leading-snug line-clamp-2 transition-colors mb-1">
                        {related.title}
                      </p>
                      {related.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{related.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <NewsletterSignup
          variant="compact"
          articleId={guide.id}
          articleSlug={guide.id}
          articleTitle={guide.title}
          className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl"
        />
      </div>
    </aside>
  );
}

export const GuideSidebar = memo(GuideSidebarComponent);
