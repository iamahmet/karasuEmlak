'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Clock, Eye, Share2, Bookmark, BookmarkCheck, ChevronRight, Tag } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { HeroImage, ExternalImage } from '@/components/images';
import Link from 'next/link';
import { cn } from '@karasu/lib';

interface EnhancedArticleHeroProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    category?: string | null;
    author?: string | null;
    published_at?: string | null;
    updated_at?: string | null;
    featured_image?: string | null;
    tags?: string[] | null;
  };
  imageUrl: string | null;
  imageType: 'cloudinary' | 'external';
  readingTime: number;
  wordCount: number;
  basePath: string;
  viewCount?: number;
}

export function EnhancedArticleHero({
  article,
  imageUrl,
  imageType,
  readingTime,
  wordCount,
  basePath,
  viewCount = 0,
}: EnhancedArticleHeroProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Check bookmark status on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('articleBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(article.id));
  }, [article.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('articleBookmarks') || '[]');
    let newBookmarks: string[];

    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== article.id);
    } else {
      newBookmarks = [...bookmarks, article.id];
    }

    localStorage.setItem('articleBookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  // Format dates
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const updatedDate = article.updated_at && article.updated_at !== article.published_at
    ? new Date(article.updated_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Schema.org date format
  const schemaPublishedDate = article.published_at
    ? new Date(article.published_at).toISOString()
    : undefined;

  const hasImage = !!imageUrl;

  const breadcrumbItems = [
    { label: 'Ana Sayfa', href: basePath || '/' },
    { label: 'Blog', href: `${basePath}/blog` },
    ...(article.category ? [{ label: article.category, href: `${basePath}/blog/kategori/${article.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
    { label: article.title },
  ];

  // Render with image
  if (hasImage) {
    return (
      <header className="relative w-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {imageType === 'cloudinary' ? (
            <HeroImage
              publicId={article.featured_image!}
              alt={article.title}
              className="w-full h-full object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <ExternalImage
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              fill
              priority
            />
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-14 lg:pb-16 max-w-5xl">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center flex-wrap gap-1.5 text-sm">
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-white/50" />
                    )}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-white/80 hover:text-white transition-colors line-clamp-1"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white/60 line-clamp-1 max-w-[200px] md:max-w-[300px]">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Category Badge */}
            {article.category && (
              <Link
                href={`${basePath}/blog/kategori/${article.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md text-white rounded-full text-xs font-semibold border border-white/25 hover:bg-white/25 transition-all mb-5"
              >
                <Tag className="h-3 w-3" />
                {article.category}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6 max-w-3xl line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/90 mb-6">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium">{article.author || 'Karasu Emlak'}</span>
              </div>

              {/* Published Date */}
              {publishedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-white/70" />
                  <time dateTime={schemaPublishedDate}>{publishedDate}</time>
                </div>
              )}

              {/* Reading Time */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-white/70" />
                <span>{readingTime} dk okuma</span>
              </div>

              {/* View Count */}
              {viewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-white/70" />
                  <span>{viewCount.toLocaleString('tr-TR')} görüntüleme</span>
                </div>
              )}
            </div>

            {/* Updated Notice */}
            {updatedDate && (
              <p className="text-xs text-white/70 mb-6">
                Son güncelleme: {updatedDate}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/25 hover:bg-white/25 transition-all"
                aria-label="Paylaş"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Paylaş</span>
                {showShareTooltip && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap">
                    Link kopyalandı!
                  </span>
                )}
              </button>

              <button
                onClick={toggleBookmark}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all',
                  isBookmarked
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/15 backdrop-blur-md text-white border-white/25 hover:bg-white/25'
                )}
                aria-label={isBookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Kaydedildi</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Render without image
  return (
    <header className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16 max-w-5xl">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1.5 text-sm">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-gray-400" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-400 line-clamp-1 max-w-[200px] md:max-w-[300px]">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Category Badge */}
        {article.category && (
          <Link
            href={`${basePath}/blog/kategori/${article.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-all mb-5"
          >
            <Tag className="h-3 w-3" />
            {article.category}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
            {article.excerpt}
          </p>
        )}

        {/* Meta Info Bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-600 mb-6">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">{article.author || 'Karasu Emlak'}</span>
          </div>

          {/* Published Date */}
          {publishedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <time dateTime={schemaPublishedDate}>{publishedDate}</time>
            </div>
          )}

          {/* Reading Time */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{readingTime} dk okuma</span>
          </div>

          {/* View Count */}
          {viewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-gray-400" />
              <span>{viewCount.toLocaleString('tr-TR')} görüntüleme</span>
            </div>
          )}
        </div>

        {/* Updated Notice */}
        {updatedDate && (
          <p className="text-xs text-gray-500 mb-6">
            Son güncelleme: {updatedDate}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
            aria-label="Paylaş"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Paylaş</span>
            {showShareTooltip && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
                Link kopyalandı!
              </span>
            )}
          </button>

          <button
            onClick={toggleBookmark}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
              isBookmarked
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            aria-label={isBookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Kaydedildi</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
