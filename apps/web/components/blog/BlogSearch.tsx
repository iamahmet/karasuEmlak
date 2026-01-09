'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@karasu/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@karasu/lib';

interface BlogSearchProps {
  basePath?: string;
  className?: string;
}

export function BlogSearch({ basePath = '', className }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = useCallback((searchQuery: string) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    const queryString = params.toString();
    router.push(`${basePath}/blog${queryString ? `?${queryString}` : ''}`);
  }, [router, basePath]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    router.push(`${basePath}/blog`);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Blog yazılarında ara..."
          className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Temizle"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        className="mt-3 w-full sm:w-auto"
        size="lg"
      >
        <Search className="h-4 w-4 mr-2" />
        Ara
      </Button>
    </form>
  );
}
