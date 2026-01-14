'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, FileText } from 'lucide-react';
import { cn } from '@karasu/lib';

interface RelatedGuide {
  id: string;
  title: string;
  href: string;
  description?: string;
  category?: string;
}

interface RelatedGuidesProps {
  guides: RelatedGuide[];
  title?: string;
  basePath?: string;
  className?: string;
  limit?: number;
}

export function RelatedGuides({
  guides,
  title = 'İlgili Rehberler',
  basePath = '',
  className,
  limit = 6,
}: RelatedGuidesProps) {
  const filteredGuides = guides.slice(0, limit);

  if (filteredGuides.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-8 md:py-12', className)}>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <Link
          href={`${basePath}/rehber`}
          className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          Tüm Rehberler
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Link
            key={guide.id}
            href={guide.href}
            className="group block bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {guide.title}
                </h3>
                {guide.category && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {guide.category}
                  </span>
                )}
              </div>
            </div>
            {guide.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{guide.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              <span>Detaylı Bilgi</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
