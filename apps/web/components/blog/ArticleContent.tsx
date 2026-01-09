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
      {/* Share & Actions Bar - Minimal */}
      <div className="mb-8 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Share2 className="h-4 w-4 text-slate-500" />
            <ShareButtons
              url={articleUrl}
              title={article.title}
              description={article.excerpt || article.meta_description || undefined}
              articleId={article.id}
              articleSlug={article.slug}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                copied
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
              )}
              title="Linki Kopyala"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              title="Yazdır"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content - Premium Editorial Typography */}
      <article className="relative w-full" id="article-content">
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
        <section className="mt-12 md:mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Hash className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`${basePath}/blog/etiket/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-[#006AFF]/5 dark:hover:bg-blue-500/10 hover:text-[#006AFF] dark:hover:text-blue-400 hover:border-[#006AFF]/30 dark:hover:border-blue-400/40 transition-all duration-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Resources - Clean Grid */}
      {resourceLinks.length > 0 && (
        <section className="mt-12 md:mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#006AFF]/10 dark:bg-blue-500/20 rounded-xl">
              <BookOpen className="h-5 w-5 text-[#006AFF] dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">İlgili Rehberler</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Bu konuyla bağlantılı kaynaklar</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {resourceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#006AFF]/40 dark:hover:border-blue-400/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {link.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{link.description}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-[#006AFF] dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section - Modern Accordion */}
      {faqs.length > 0 && (
        <section className="mt-12 md:mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 print:hidden" id="sss">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sık Sorulan Sorular</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Bu konuyla ilgili merak edilenler</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaqs.has(index);
              return (
                <div
                  key={index}
                  className={cn(
                    'bg-white dark:bg-gray-800 border rounded-xl overflow-hidden transition-all duration-200',
                    isExpanded ? 'border-[#006AFF]/40 dark:border-blue-400/40 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isExpanded ? 'true' : 'false'}
                  >
                    <span
                      className={cn(
                        'text-base font-semibold leading-snug transition-colors',
                        isExpanded ? 'text-[#006AFF] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                      )}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                        isExpanded
                          ? 'bg-[#006AFF]/10 dark:bg-blue-500/20 text-[#006AFF] dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <ContentRenderer
                          content={faq.answer}
                          format="auto"
                          sanitize={true}
                          prose={false}
                          className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
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

      {/* Comments CTA - Clean & Minimal */}
      <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200 print:hidden">
        <a
          href="#yorumlar"
          className="group flex items-center gap-4 p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:border-[#006AFF]/40 hover:shadow-md transition-all duration-200"
        >
          <div className="p-3 bg-white border border-slate-200 rounded-xl group-hover:border-[#006AFF]/40 transition-colors">
            <MessageCircle className="h-6 w-6 text-slate-500 group-hover:text-[#006AFF] transition-colors" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 group-hover:text-[#006AFF] transition-colors">
              Yorumlar
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Bu yazı hakkındaki düşüncelerinizi paylaşın
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-[#006AFF] transition-colors" />
        </a>
      </div>
    </div>
  );
}

export const ArticleContent = memo(ArticleContentComponent);
