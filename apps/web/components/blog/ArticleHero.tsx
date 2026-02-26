'use client';

import { memo, useEffect, useState } from 'react';
import { Calendar, Clock, User, Eye, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { HeroImage, ExternalImage } from '@/components/images';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';
import { cn } from '@karasu/lib';
import { ContentRenderer } from '@/components/content/ContentRenderer';

interface ArticleHeroProps {
  article: {
    title: string;
    excerpt?: string | null;
    category?: string | null;
    author?: string | null;
    published_at?: string | null;
    updated_at?: string | null;
    featured_image?: string | null;
    view_count?: number;
  };
  imageUrl: string | null;
  imageType: 'cloudinary' | 'external';
  readingTime: number;
  basePath: string;
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Istanbul',
    })
    : null;

const formatRelativeDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return formatDate(value);
};

function ArticleHeroComponent({ article, imageUrl, imageType, readingTime, basePath }: ArticleHeroProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const publishedDate = formatDate(article.published_at);
  const relativeDate = hasMounted ? formatRelativeDate(article.published_at) : null;
  const updatedDate = article.updated_at && article.updated_at !== article.published_at
    ? formatDate(article.updated_at)
    : null;
  const isRecent = hasMounted &&
    !!article.published_at &&
    (new Date().getTime() - new Date(article.published_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  // Clean up title (remove trailing " | Blog | Karasu Emlak" etc.)
  const formattedTitle = article.title
    .replace(/(?:\s*\|\s*(?:Blog|Karasu Emlak))+$/i, '')
    .replace(/\s*-\s*Karasu Emlak/i, '');

  return (
    <header className="relative mb-12 md:mb-16">
      {/* Category Badge - Modern */}
      {article.category && (
        <div className="mb-6">
          <Link
            href={`${basePath}/blog/kategori/${(article.category === 'Cornerstone' ? 'Rehber' : article.category).toLowerCase().replace(/\s+/g, '-')}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 dark:bg-black/60 backdrop-blur-md text-primary dark:text-primary-light text-sm font-bold uppercase tracking-wide rounded-2xl hover:bg-white dark:hover:bg-black transition-all border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <TrendingUp className="h-4 w-4" />
            {article.category === 'Cornerstone' ? 'Rehber' : article.category}
          </Link>
        </div>
      )}

      {/* Title - Premium Editorial Typography */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 leading-[1.2] mb-6 drop-shadow-sm break-words">
        {formattedTitle}
      </h1>

      {/* Excerpt - Clean Introduction */}
      {article.excerpt && (
        <div className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-[1.7] mb-10 max-w-4xl font-medium [&_p]:m-0 [&_p]:text-inherit [&_p]:leading-inherit [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_strong]:font-bold border-l-4 border-primary/40 pl-5 md:pl-6 ml-1">
          <ContentRenderer
            content={article.excerpt}
            format="auto"
            sanitize={true}
            allowImages={false}
            allowTables={false}
            allowCode={false}
            prose={false}
          />
        </div>
      )}

      {/* Meta Information Row - Premium Glassmorphism */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        {/* Author */}
        {article.author && (
          <div className="flex items-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {article.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Yazar</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{article.author}</div>
            </div>
          </div>
        )}

        {/* Date */}
        {publishedDate && (
          <div className="flex items-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Yayın Tarihi</div>
              <time dateTime={article.published_at || undefined} className="text-sm font-semibold text-gray-900 dark:text-white">
                <span suppressHydrationWarning>
                  {relativeDate || publishedDate}
                </span>
              </time>
            </div>
          </div>
        )}

        {/* Reading Time */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Okuma Süresi</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{readingTime} dakika</div>
          </div>
        </div>

        {/* Views */}
        {article.view_count && article.view_count > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Görüntülenme</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{article.view_count.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        )}

        {/* Recent Badge */}
        {isRecent && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">YENİ</span>
          </div>
        )}

        {/* Updated Badge */}
        {updatedDate && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
            <span className="text-xs font-semibold" suppressHydrationWarning>Güncellendi: {updatedDate}</span>
          </div>
        )}
      </div>

      {/* Featured Image - Premium with Ultra Overlay */}
      <figure className="relative mt-12 group perspective-1000">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-200/50 dark:border-gray-700/50 transform-gpu transition-all duration-700 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          {imageUrl && imageUrl.trim() !== '' ? (
            imageType === 'cloudinary' && article.featured_image ? (
              <HeroImage
                publicId={article.featured_image}
                alt={generateBlogImageAlt(article.title, article.category || undefined, 'Karasu')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 1200px"
                priority
                fallback="/images/placeholder-article.jpg"
              />
            ) : imageUrl.startsWith('http') ? (
              <ExternalImage
                src={imageUrl}
                alt={generateBlogImageAlt(article.title, article.category || undefined, 'Karasu')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                width={1200}
                height={675}
                priority
              />
            ) : null
          ) : (
            // Fallback placeholder when no image is available
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-gray-100 dark:from-primary/20 dark:via-primary/10 dark:to-gray-800">
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 dark:bg-primary/30 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 font-semibold">Görsel yok</p>
              </div>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </figure>
    </header>
  );
}

export const ArticleHero = memo(ArticleHeroComponent);
