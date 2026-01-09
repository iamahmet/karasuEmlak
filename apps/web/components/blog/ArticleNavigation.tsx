import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@karasu/lib';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
}

interface ArticleNavigationProps {
  previousArticle?: Article | null;
  nextArticle?: Article | null;
  basePath: string;
  className?: string;
}

export function ArticleNavigation({
  previousArticle,
  nextArticle,
  basePath,
  className,
}: ArticleNavigationProps) {
  if (!previousArticle && !nextArticle) return null;

  return (
    <nav
      className={cn('border-t border-gray-200 pt-8', className)}
      aria-label="Makale navigasyonu"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Article */}
        {previousArticle ? (
          <Link
            href={`${basePath}/blog/${previousArticle.slug}`}
            className="group flex items-start gap-4 p-5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Önceki Yazı
              </span>
              <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm md:text-base">
                {previousArticle.title}
              </h4>
            </div>
          </Link>
        ) : (
          <div className="hidden md:block" /> // Placeholder for grid alignment
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link
            href={`${basePath}/blog/${nextArticle.slug}`}
            className="group flex items-start gap-4 p-5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 md:text-right md:flex-row-reverse"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Sonraki Yazı
              </span>
              <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-sm md:text-base">
                {nextArticle.title}
              </h4>
            </div>
          </Link>
        ) : (
          <div className="hidden md:block" /> // Placeholder for grid alignment
        )}
      </div>
    </nav>
  );
}
