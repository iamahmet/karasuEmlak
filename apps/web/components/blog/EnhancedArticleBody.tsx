'use client';

import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Share2, MessageSquare, ThumbsUp, Printer, AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import { siteConfig } from '@karasu-emlak/config';
import { cn } from '@karasu/lib';

// Dynamic imports for non-critical components
const ShareButtons = dynamic(() => import('@/components/share/ShareButtons'), { ssr: false });
const ArticleEngagement = dynamic(
  () => import('@/components/blog/ArticleEngagement').then((mod) => ({ default: mod.ArticleEngagement })),
  { ssr: false }
);
const CommentsSection = dynamic(
  () => import('@/components/comments/CommentsSection').then((mod) => ({ default: mod.CommentsSection })),
  { ssr: false, loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-xl" /> }
);

interface EnhancedArticleBodyProps {
  article: {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    meta_description?: string | null;
    tags?: string[] | null;
    slug: string;
    author?: string | null;
    published_at?: string | null;
  };
  faqs: Array<{ question: string; answer: string }>;
  basePath: string;
  locale: string;
}

// Process content to add IDs to headings and enhance formatting
function processContent(html: string): string {
  if (typeof document === 'undefined') return html;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Add IDs to headings
  const headings = tempDiv.querySelectorAll('h2, h3, h4');
  headings.forEach((heading, index) => {
    if (!heading.id) {
      const text = heading.textContent?.trim() || '';
      heading.id =
        text
          .toLowerCase()
          .replace(/[^a-z0-9\u00C0-\u017F]+/gi, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 50) || `heading-${index}`;
    }

    // Add anchor link
    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'heading-anchor';
    anchor.setAttribute('aria-hidden', 'true');
    anchor.innerHTML = '#';
    heading.appendChild(anchor);
  });

  // Add target="_blank" to external links
  const links = tempDiv.querySelectorAll('a');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('http') && !href.includes(siteConfig.url)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Add loading="lazy" to images
  const images = tempDiv.querySelectorAll('img');
  images.forEach((img) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  return tempDiv.innerHTML;
}

// Generate internal links based on content
function generateInternalLinks(
  content: string,
  basePath: string
): Array<{ href: string; label: string; description: string }> {
  const text = content.toLowerCase();
  const links: Array<{ href: string; label: string; description: string }> = [];

  // Karasu links
  if (text.includes('karasu')) {
    links.push({
      href: `${basePath}/karasu-satilik-ev`,
      label: 'Karasu Satılık Ev',
      description: 'Karasu\'da satılık ev ilanları',
    });

    // Karasu satılık daire link (high priority for "karasu satılık daire" keyword)
    if (text.includes('daire')) {
      if (text.includes('satılık') || text.includes('satilik')) {
        links.push({
          href: `${basePath}/karasu-satilik-daire`,
          label: 'Karasu Satılık Daire',
          description: 'Karasu\'da satılık daire ilanları ve rehber',
        });
      }
      if (text.includes('kiralık') || text.includes('kiralik')) {
        links.push({
          href: `${basePath}/karasu-kiralik-daire`,
          label: 'Karasu Kiralık Daire',
          description: 'Karasu\'da kiralık daire ilanları ve rehber',
        });
      }
    }

    // Karasu satılık villa link
    if (text.includes('villa')) {
      links.push({
        href: `${basePath}/karasu-satilik-villa`,
        label: 'Karasu Satılık Villa',
        description: 'Karasu\'da satılık villa ilanları ve rehber',
      });
    }

    // Karasu satılık yazlık link
    if (text.includes('yazlık') || text.includes('yazlik')) {
      links.push({
        href: `${basePath}/karasu-satilik-yazlik`,
        label: 'Karasu Satılık Yazlık',
        description: 'Karasu\'da satılık yazlık ilanları ve rehber',
      });
    }

    if (text.includes('merkez')) {
      links.push({
        href: `${basePath}/karasu-merkez-satilik-ev`,
        label: 'Merkez Satılık Ev',
        description: 'Merkez bölgede satılık evler',
      });
    }

    if (text.includes('deniz') || text.includes('sahil')) {
      links.push({
        href: `${basePath}/karasu-denize-yakin-satilik-ev`,
        label: 'Denize Yakın Evler',
        description: 'Sahil bölgesinde satılık evler',
      });
    }

    if (text.includes('yatırım')) {
      links.push({
        href: `${basePath}/karasu-yatirimlik-satilik-ev`,
        label: 'Yatırımlık Evler',
        description: 'Yatırım amaçlı emlak seçenekleri',
      });
    }
  }

  // Kocaali links
  if (text.includes('kocaali')) {
    links.push({
      href: `${basePath}/kocaali-satilik-ev`,
      label: 'Kocaali Satılık Ev',
      description: 'Kocaali\'de satılık ev ilanları',
    });
  }

  // Guide links
  if (text.includes('kredi') || text.includes('mortgage')) {
    links.push({
      href: `${basePath}/kredi-hesaplayici`,
      label: 'Kredi Hesaplayıcı',
      description: 'Konut kredisi hesaplama aracı',
    });
  }

  if (text.includes('yatırım') && !links.some((l) => l.href.includes('yatirim'))) {
    links.push({
      href: `${basePath}/yatirim-hesaplayici`,
      label: 'Yatırım Hesaplayıcı',
      description: 'ROI ve kira getirisi hesaplama',
    });
  }

  // Fallback links
  if (links.length === 0) {
    links.push(
      {
        href: `${basePath}/satilik`,
        label: 'Satılık İlanlar',
        description: 'Tüm satılık emlak ilanları',
      },
      {
        href: `${basePath}/kiralik`,
        label: 'Kiralık İlanlar',
        description: 'Tüm kiralık emlak ilanları',
      }
    );
  }

  return links.slice(0, 4);
}

export function EnhancedArticleBody({
  article,
  faqs,
  basePath,
  locale,
}: EnhancedArticleBodyProps) {
  const processedContent = useMemo(() => processContent(article.content), [article.content]);
  const internalLinks = useMemo(
    () => generateInternalLinks(article.content, basePath),
    [article.content, basePath]
  );

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-b border-gray-100 print:hidden">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Paylaş:
          </span>
          <ShareButtons
            url={`${siteConfig.url}${basePath}/blog/${article.slug}`}
            title={article.title}
            description={article.excerpt || article.meta_description || undefined}
            articleId={article.id}
            articleSlug={article.slug}
          />
        </div>

        <div className="flex items-center gap-3">
          <ArticleEngagement
            articleId={article.id}
            articleSlug={article.slug}
            articleTitle={article.title}
          />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Yazdır"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Yazdır</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article
        className="blog-content-editorial prose prose-lg prose-gray max-w-none
          prose-headings:scroll-mt-24 prose-headings:font-bold
          prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4
          prose-h4:text-lg prose-h4:md:text-xl prose-h4:mt-8 prose-h4:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-ul:my-6 prose-ol:my-6
          prose-li:text-gray-700 prose-li:mb-2
          prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
          prose-img:rounded-xl prose-img:shadow-lg
          prose-pre:bg-gray-900 prose-pre:rounded-xl
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 print:hidden">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Etiketler</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`${basePath}/blog/etiket/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Internal Links */}
      {internalLinks.length > 0 && (
        <section className="mt-12 print:hidden">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">İlgili Sayfalar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {internalLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="group block p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-primary/30 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="mt-16 print:hidden" id="sss">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary" />
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <summary className="cursor-pointer flex items-center justify-between gap-4 p-5">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                  <p className="text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="mt-16 print:hidden" id="yorumlar">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          Yorumlar
        </h2>
        <CommentsSection contentId={article.id} locale={locale} />
      </section>
    </div>
  );
}
