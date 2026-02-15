'use client';

import Link from 'next/link';
import { Hash, TrendingUp } from 'lucide-react';
import { cn } from '@karasu/lib';

interface BlogTagsSectionProps {
  tags: Array<{ name: string; count: number; slug: string }>;
  basePath?: string;
  className?: string;
}

export function BlogTagsSection({ tags, basePath = '', className }: BlogTagsSectionProps) {
  if (tags.length === 0) return null;

  return (
    <section className={cn('bg-white rounded-lg p-5 border border-gray-200 shadow-sm', className)}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Hash className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Popüler Etiketler</h2>
          <p className="text-xs text-gray-600 mt-0.5">En çok kullanılan konu etiketleri</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            // Prefer SEO-friendly tag archive route. Blog page still supports ?tag=... for backwards compatibility.
            href={`${basePath}/blog/etiket/${encodeURIComponent(tag.slug)}`}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary/10 border border-gray-200 hover:border-primary rounded-lg transition-all"
          >
            <Hash className="h-3.5 w-3.5 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors">
              {tag.name}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-200 group-hover:bg-primary/20 rounded-full text-gray-600 group-hover:text-primary transition-colors">
              {tag.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
