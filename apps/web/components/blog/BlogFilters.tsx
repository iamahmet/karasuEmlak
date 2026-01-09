'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Calendar, ArrowUpDown } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface BlogFiltersProps {
  basePath?: string;
  categories?: Array<{ name: string; slug: string; count: number }>;
  className?: string;
}

export function BlogFilters({ basePath = '', categories = [], className }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category');
  const currentSort = searchParams.get('sort') || 'newest';
  const currentTag = searchParams.get('tag');

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset to first page
    router.push(`${basePath}/blog${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.delete('page'); // Reset to first page
    router.push(`${basePath}/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`${basePath}/blog`);
  };

  const hasActiveFilters = currentCategory || currentTag || currentSort !== 'newest';

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4 md:p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Filtrele ve Sırala</h3>
            <p className="text-xs text-gray-600">İstediğiniz içeriği bulun</p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-2" />
            Temizle
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Sort Options */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sıralama
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'newest', label: 'En Yeni' },
              { value: 'oldest', label: 'En Eski' },
              { value: 'popular', label: 'En Popüler' },
              { value: 'views', label: 'En Çok Okunan' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  currentSort === option.value
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Kategori
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryChange(null)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  !currentCategory
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                )}
              >
                Tümü
              </button>
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
                    currentCategory === category.slug
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                  )}
                >
                  {category.name}
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    currentCategory === category.slug
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Aktif Filtreler:</span>
              {currentCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  Kategori: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                    aria-label="Kategori filtresini kaldır"
                    title="Kategori filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {currentTag && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  Etiket: {currentTag}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('tag');
                      router.push(`${basePath}/blog?${params.toString()}`);
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                    aria-label="Etiket filtresini kaldır"
                    title="Etiket filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {currentSort !== 'newest' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  Sıralama: {
                    { newest: 'En Yeni', oldest: 'En Eski', popular: 'En Popüler', views: 'En Çok Okunan' }[currentSort] || currentSort
                  }
                  <button
                    onClick={() => handleSortChange('newest')}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                    aria-label="Sıralama filtresini kaldır"
                    title="Sıralama filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
