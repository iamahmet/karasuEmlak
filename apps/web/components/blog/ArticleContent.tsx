'use client';

import { useState, useMemo, memo, useEffect } from 'react';
import {
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Hash,
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { siteConfig } from '@karasu-emlak/config';
import Link from 'next/link';
import { cn } from '@karasu/lib';
import type { ContextualLink } from './contextual-links';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { detectLowQualityContent } from '@/lib/utils/content-quality-checker';

const ShareButtons = dynamic(
  () => import('@/components/share/ShareButtons').then((mod) => ({ default: mod.default })),
  { ssr: false }
);


interface ArticleContentProps {
  article: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    meta_description?: string | null;
    tags?: string[] | null;
    slug: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  basePath: string;
  contextualLinks: ContextualLink[];
}

function ArticleContentComponent({ article, faqs, basePath, contextualLinks }: ArticleContentProps) {
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const articleUrl = useMemo(
    () => `${siteConfig.url}${basePath}/blog/${article.slug}`,
    [basePath, article.slug]
  );

  const resourceLinks = useMemo(() => contextualLinks.slice(0, 4), [contextualLinks]);

  // Debug: Log content status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const content = article.content;
      const hasContent = content && 
        typeof content === 'string' && 
        content.length > 0 &&
        content.replace(/<[^>]*>/g, '').trim().length > 0;
      
      if (!hasContent) {
        console.warn(`[ArticleContent] Article "${article.title}" has no content.`, {
          type: typeof content,
          length: content?.length || 0,
          textLength: content?.replace(/<[^>]*>/g, '').trim().length || 0,
          isNull: content === null,
          isUndefined: content === undefined,
        });
      } else {
        console.log(`[ArticleContent] Article "${article.title}" has content.`, {
          length: content.length,
          textLength: content.replace(/<[^>]*>/g, '').trim().length,
          firstChars: content.substring(0, 100),
        });
      }
    }
  }, [article.content, article.title]);

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <div className="w-full">
      {/* Share & Actions Bar - Modern */}
      <div className="mb-10 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Paylaş</div>
              <ShareButtons
                url={articleUrl}
                title={article.title}
                description={article.excerpt || article.meta_description || undefined}
                articleId={article.id}
                articleSlug={article.slug}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                copied
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
              )}
              title="Linki Kopyala"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-all duration-200"
              title="Yazdır"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Content - Premium Editorial Typography */}
      <article className="relative w-full prose prose-lg prose-gray dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:scroll-mt-24
        prose-h3:text-2xl prose-h3:md:text-3xl prose-h3:mt-10 prose-h3:mb-4
        prose-h4:text-xl prose-h4:md:text-2xl prose-h4:mt-8 prose-h4:mb-3
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[1.75] prose-p:mb-6 prose-p:text-base md:prose-p:text-lg prose-p:antialiased hyphens-auto
        prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:transition-all
        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
        prose-ul:my-6 prose-ol:my-6
        prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-3 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-transparent dark:prose-blockquote:from-primary/10 dark:prose-blockquote:to-transparent prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:shadow-sm
        prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:rounded-2xl prose-pre:shadow-xl prose-pre:border prose-pre:border-gray-700
        prose-code:text-primary prose-code:bg-primary/10 dark:prose-code:bg-primary/20 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:font-semibold prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-table:w-full prose-table:my-8 prose-table:border-collapse
        prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:p-4 prose-th:font-bold prose-th:text-left
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-4" id="article-content">
        {(() => {
          // More robust content check - handle HTML content
          const content = article.content;
          
          // Check if content exists and has actual text
          const hasContent = content && 
            typeof content === 'string' && 
            content.length > 0;
          
          // Extract text from HTML to check if there's actual content
          const textContent = hasContent ? content.replace(/<[^>]*>/g, '').trim() : '';
          const hasTextContent = textContent.length > 0;
          
          if (!hasContent || !hasTextContent) {
            return (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-[#006AFF] rounded-full animate-spin" />
                  <p className="text-lg font-medium">İçerik yükleniyor...</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Lütfen bekleyin</p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">
                      Debug: Content type={typeof content}, 
                      length={content?.length || 0}, 
                      textLength={textContent.length},
                      isNull={content === null}, 
                      isUndefined={content === undefined}
                    </p>
                  )}
                </div>
              </div>
            );
          }
          
          // Use ContentRenderer for consistent rendering
          // This handles: format detection, HTML entity decoding, sanitization, image processing
          return (
            <ContentRenderer
              content={content}
              format="auto"
              sanitize={true}
              allowImages={true}
              allowTables={true}
              allowCode={true}
              processImages={true}
              imageTitle={article.title}
              prose={true}
              proseSize="lg"
              className="article-prose"
            />
          );
        })()}
      </article>

      {/* Tags Section - Modern Chips */}
      {article.tags && article.tags.length > 0 && (
        <section className="mt-12 md:mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`${basePath}/blog/etiket/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary hover:border-primary dark:hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Resources - Modern Grid */}
      {resourceLinks.length > 0 && (
        <section className="mt-12 md:mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700 print:hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">İlgili Rehberler</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bu konuyla bağlantılı kaynaklar</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {resourceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {link.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{link.description}</p>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section - Modern Accordion */}
      {faqs.length > 0 && (
        <section className="mt-12 md:mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700 print:hidden" id="sss">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sık Sorulan Sorular</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bu konuyla ilgili merak edilenler</p>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaqs.has(index);
              return (
                <div
                  key={index}
                  className={cn(
                    'bg-white dark:bg-gray-800 border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm',
                    isExpanded ? 'border-primary dark:border-primary/50 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isExpanded ? 'true' : 'false'}
                  >
                    <span
                      className={cn(
                        'text-base md:text-lg font-bold leading-snug transition-colors',
                        isExpanded ? 'text-primary dark:text-primary' : 'text-gray-900 dark:text-white'
                      )}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        isExpanded
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rotate-180'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <ContentRenderer
                          content={faq.answer}
                          format="auto"
                          sanitize={true}
                          prose={false}
                          className="text-base leading-relaxed text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Comments CTA - Modern */}
      <div className="mt-12 md:mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700 print:hidden">
        <a
          href="#yorumlar"
          className="group flex items-center gap-5 p-6 bg-gradient-to-r from-primary/5 via-white to-primary/5 dark:from-primary/10 dark:via-gray-900 dark:to-primary/10 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary dark:hover:border-primary/50 hover:shadow-xl transition-all duration-300"
        >
          <div className="p-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl group-hover:border-primary dark:group-hover:border-primary/50 transition-all shadow-sm">
            <MessageCircle className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors mb-1">
              Yorumlar
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bu yazı hakkındaki düşüncelerinizi paylaşın
            </p>
          </div>
          <ArrowUpRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      </div>
    </div>
  );
}

export const ArticleContent = memo(ArticleContentComponent);
