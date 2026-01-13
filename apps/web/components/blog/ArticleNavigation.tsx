import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
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
      className={cn('', className)}
      aria-label="Makale navigasyonu"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Article */}
        {previousArticle ? (
          <Link
            href={`${basePath}/blog/${previousArticle.slug}`}
            className="group flex items-start gap-5 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 rounded-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-xl"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary transition-all border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                Önceki Yazı
              </span>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
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
            className="group flex items-start gap-5 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 rounded-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:shadow-xl md:text-right md:flex-row-reverse"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary transition-all border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                Sonraki Yazı
              </span>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-2">
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
