import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Newspaper } from 'lucide-react';
import { cn } from '@karasu/lib';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { calculateReadingTime } from '@/lib/utils/reading-time';

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  category?: string | null;
  content?: string;
}

interface RelatedArticlesSectionProps {
  articles: RelatedArticle[];
  basePath: string;
  className?: string;
}

function getImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  if (isValidCloudinaryId(image)) {
    return getOptimizedCloudinaryUrl(image, {
      width: 400,
      height: 250,
      crop: 'fill',
      quality: 80,
      format: 'auto',
    });
  }
  return image;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function RelatedArticlesSection({
  articles,
  basePath,
  className,
}: RelatedArticlesSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className={cn('relative', className)}>
      {/* Section Header - Premium */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Newspaper className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              İlgili Yazılar
            </h2>
            <p className="text-sm text-gray-500 mt-1">Size önerilen içerikler</p>
          </div>
        </div>
        <Link
          href={`${basePath}/blog`}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-primary border border-gray-200 hover:border-primary/30 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
        >
          Tüm Yazılar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Articles Grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.slice(0, 4).map((article) => {
          const imageUrl = getImageUrl(article.featured_image);
          const readingTime = article.content
            ? calculateReadingTime(article.content)
            : 3;

          return (
            <Link
              key={article.id}
              href={`${basePath}/blog/${article.slug}`}
              className="group relative block bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              
              {/* Image */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
                    <Newspaper className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Category badge - Enhanced */}
                {article.category && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary/95 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg border border-white/20">
                    {article.category}
                  </span>
                )}

                {/* Reading time badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {readingTime} dk
                </div>
              </div>

              {/* Content - Enhanced */}
              <div className="p-5 relative z-20">
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3 text-base leading-snug">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {article.published_at && (
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(article.published_at)}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-primary text-xs font-semibold group-hover:gap-2 transition-all">
                    <span>Devamını Oku</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile "View All" link - Enhanced */}
      <div className="sm:hidden mt-8 text-center">
        <Link
          href={`${basePath}/blog`}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
        >
          Tüm Yazıları Görüntüle
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
