'use client';

import { memo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { HeroImage, ExternalImage } from '@/components/images';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';

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
    ? new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
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
  const publishedDate = formatDate(article.published_at);
  const relativeDate = formatRelativeDate(article.published_at);
  const updatedDate = article.updated_at && article.updated_at !== article.published_at
    ? formatDate(article.updated_at)
    : null;
  const isRecent = article.published_at &&
    (new Date().getTime() - new Date(article.published_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <header className="relative mb-10 md:mb-12">
      {/* Category Badge - Minimal */}
      {article.category && (
        <div className="mb-5">
          <Link
            href={`${basePath}/blog/kategori/${article.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="inline-flex items-center px-3 py-1.5 bg-[#006AFF]/10 text-[#006AFF] text-xs font-semibold rounded-full hover:bg-[#006AFF]/15 transition-colors"
          >
            {article.category}
          </Link>
        </div>
      )}

      {/* Title - Premium Editorial Typography */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1] mb-6">
        {article.title}
      </h1>

      {/* Excerpt - Clean Introduction */}
      {article.excerpt && (
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-none">
          {article.excerpt}
        </p>
      )}

      {/* Meta Information Row - Minimal, Single Line */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
        {publishedDate && (
          <time dateTime={article.published_at || undefined} className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{relativeDate || publishedDate}</span>
          </time>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{readingTime} dk okuma</span>
        </div>
        {updatedDate && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Güncellendi: {updatedDate}
          </span>
        )}
      </div>

      {/* Featured Image - Clean, Single Image with Fallback */}
      <figure className="relative mt-8">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          {imageUrl && imageUrl.trim() !== '' ? (
            imageType === 'cloudinary' && article.featured_image ? (
              <HeroImage
                publicId={article.featured_image}
                alt={generateBlogImageAlt(article.title, article.category || undefined, 'Karasu')}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 760px"
                priority
                fallback="/images/placeholder-article.jpg"
              />
            ) : imageUrl.startsWith('http') ? (
              <ExternalImage
                src={imageUrl}
                alt={generateBlogImageAlt(article.title, article.category || undefined, 'Karasu')}
                className="w-full h-full object-cover"
                width={760}
                height={428}
                priority
              />
            ) : null
          ) : (
            // Fallback placeholder when no image is available
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Görsel yok</p>
              </div>
            </div>
          )}
        </div>
      </figure>
    </header>
  );
}

export const ArticleHero = memo(ArticleHeroComponent);
