'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, memo } from 'react';
import { ArrowRight, User, Building2, MessageCircle } from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import type { ContextualLink } from './contextual-links';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { ArticleAudioReader } from './ArticleAudioReader';
import { ArticleImageFallback } from './ArticleImageFallback';

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

// Author Bio Component - Enhanced (using new AuthorBox)
import { AuthorBox } from './AuthorBox';

function AuthorBioSection({
  author,
  authorData,
  basePath
}: {
  author: string;
  authorData?: any;
  basePath: string;
}) {
  // Use new author system if available
  if (authorData) {
    return <AuthorBox author={authorData} basePath={basePath} />;
  }

  // Fallback to legacy author display
  const authorInitial = author ? author.charAt(0).toUpperCase() : 'K';

  return (
    <section className="mt-12 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 p-6 md:p-8 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30 border-2 border-white dark:border-gray-800">
            {authorInitial}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{author || 'Karasu Emlak'}</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Doğrulanmış
            </span>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Karasu ve Kocaali bölgesinde 15 yılı aşkın deneyime sahip emlak uzmanı.
            Gayrimenkul yatırımı, bölge analizi ve emlak değerleme konularında uzman içerikler sunuyoruz.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${basePath}/blog/yazar/${(author || 'karasu-emlak').toLowerCase().replace(/\s+/g, '-')}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 dark:bg-primary/20 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all border border-primary/20 dark:border-primary/30"
            >
              <User className="h-4 w-4" />
              Tüm yazıları
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${basePath}/karasu-emlak-ofisi`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
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
      {/* CSP-compliant image error fallback (no inline onerror) */}
      <ArticleImageFallback />
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

      {/* Article Audio Reader */}
      <ArticleAudioReader title={article.title} content={article.content} />

      {/* TL;DR / Özet Kutusu - Premium excerpt summary */}
      {(article.excerpt || article.meta_description) && (
        <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-primary/5 via-white/80 to-blue-50/50 dark:from-primary/10 dark:via-gray-800/80 dark:to-blue-900/10 backdrop-blur-md rounded-3xl border border-primary/20 dark:border-primary/30 shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl shadow-inner border border-primary/20 dark:border-primary/30">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-primary-light">
              ÖZET & ÖNEMLİ NOKTALAR
            </h3>
          </div>
          <div className="relative z-10 text-base md:text-lg text-slate-700 dark:text-slate-300 leading-[1.8] font-medium border-l-4 border-primary/40 pl-5 ml-2">
            <ContentRenderer
              content={article.excerpt || article.meta_description}
              format="auto"
              sanitize={true}
              allowImages={false}
              allowTables={false}
              allowCode={false}
              prose={false}
              className="[&_p]:m-0 [&_p]:text-inherit [&_p]:leading-inherit [&_strong]:font-bold [&_strong]:text-gray-900 dark:[&_strong]:text-white"
            />
          </div>
        </div>
      )}

      {/* Main Article Content */}
      <ArticleContent
        article={article}
        faqs={faqs}
        basePath={basePath}
        contextualLinks={contextualLinks}
      />

      {/* Author Bio Section */}
      <AuthorBioSection author={article.author || 'Karasu Emlak'} basePath={basePath} />

      {/* Related Listings CTA - Modern */}
      {ctaLinks.length > 0 && (
        <section className="mt-12 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">İlgili İlanlar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bu konuyla ilişkili fırsatlar</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ctaLinks.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="group flex items-center justify-between gap-4 p-5 md:p-6 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2">
                    {cta.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{cta.description}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
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
      <section id="yorumlar" className="mt-12 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yorumlar</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Düşüncelerinizi paylaşın</p>
          </div>
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
