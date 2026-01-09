'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, memo } from 'react';
import { ArrowRight, User, Building2 } from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import type { ContextualLink } from './contextual-links';

const TableOfContents = dynamic(
  () => import('./EnhancedTableOfContents').then((mod) => ({ default: mod.EnhancedTableOfContents })),
  { ssr: false }
);

const NewsletterSignup = dynamic(
  () => import('./NewsletterSignup').then((mod) => ({ default: mod.NewsletterSignup })),
  { ssr: false }
);

const CommentsSection = dynamic(
  () => import('@/components/comments/CommentsSection').then((mod) => ({ default: mod.CommentsSection })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    ),
  }
);

interface ArticleBodyProps {
  article: {
    id: string;
    title: string;
    slug: string;
    author?: string | null;
    content: string;
    excerpt?: string | null;
    meta_description?: string | null;
    tags?: string[] | null;
    published_at?: string | null;
  };
  basePath: string;
  locale: string;
  faqs: Array<{ question: string; answer: string }>;
  readingTime: number;
  wordCount: number;
  contextualLinks: ContextualLink[];
}

function getPrimaryCtas(links: ContextualLink[], basePath: string) {
  const listingCtas = links.filter((link) => link.intent === 'listing').slice(0, 2);
  if (listingCtas.length === 0) {
    return [
      {
        href: `${basePath}/karasu-satilik-ev`,
        label: 'Karasu Satılık Evler',
        description: 'Karasu bölgesindeki güncel ilanları inceleyin.',
      },
      {
        href: `${basePath}/karasu-mahalleler`,
        label: 'Mahalle Rehberi',
        description: 'Karasu mahallelerinin detaylı profilleri.',
      },
    ];
  }

  return listingCtas.map((link) => ({
    href: link.href,
    label: link.label,
    description: link.description,
  }));
}

// Author Bio Component - Inline
function AuthorBioSection({ author, basePath }: { author: string; basePath: string }) {
  const authorInitial = author ? author.charAt(0).toUpperCase() : 'K';

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006AFF] to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#006AFF]/20">
            {authorInitial}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{author || 'Karasu Emlak'}</h3>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
              Doğrulanmış
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Karasu ve Kocaali bölgesinde 15 yılı aşkın deneyime sahip emlak uzmanı.
            Gayrimenkul yatırımı, bölge analizi ve emlak değerleme konularında uzman içerikler sunuyoruz.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${basePath}/blog/yazar/${(author || 'karasu-emlak').toLowerCase().replace(/\s+/g, '-')}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#006AFF] dark:text-blue-400 hover:text-[#0052CC] dark:hover:text-blue-300 transition-colors"
            >
              <User className="h-4 w-4" />
              Tüm yazıları
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`${basePath}/karasu-emlak-ofisi`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Hakkımızda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleBodyComponent({
  article,
  basePath,
  locale,
  faqs,
  readingTime,
  wordCount,
  contextualLinks,
}: ArticleBodyProps) {
  const ctaLinks = getPrimaryCtas(contextualLinks, basePath);

  return (
    <div className="w-full">
      {/* Mobile Table of Contents - Collapsible */}
      <div className="lg:hidden mb-8">
        <Suspense fallback={null}>
          <TableOfContents
            content={article.content}
            articleId={article.id}
            articleTitle={article.title}
            className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
          />
        </Suspense>
      </div>

      {/* Main Article Content */}
      <ArticleContent
        article={article}
        faqs={faqs}
        basePath={basePath}
        contextualLinks={contextualLinks}
      />

      {/* Author Bio Section */}
      <AuthorBioSection author={article.author || 'Karasu Emlak'} basePath={basePath} />

      {/* Related Listings CTA - Soft Approach */}
      {ctaLinks.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">İlgili İlanlar</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Bu konuyla ilişkili fırsatlar</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ctaLinks.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 dark:from-slate-800 to-white dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {cta.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cta.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup - Clean */}
      <section className="mt-12 print:hidden">
        <Suspense fallback={null}>
          <NewsletterSignup />
        </Suspense>
      </section>

      {/* Comments Section */}
      <section id="yorumlar" className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Yorumlar</h2>
        </div>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          }
        >
          <CommentsSection contentId={article.id} locale={locale} />
        </Suspense>
      </section>
    </div>
  );
}

export const ArticleBody = memo(ArticleBodyComponent);
