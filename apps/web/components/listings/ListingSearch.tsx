"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from '@/lib/hooks/useDebounce';
import { trackSearch } from '@/lib/analytics/listings-events';
import { MobileSearch } from '@/components/search/MobileSearch';

interface ListingSearchProps {
  placeholder?: string;
  className?: string;
}

export function ListingSearch({ placeholder = "Lokasyon, mahalle veya ilan no ara...", className }: ListingSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    params.delete('page'); // Reset to first page on new search
    router.push(`?${params.toString()}`, { scroll: false });
  }, 300);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Use MobileSearch on mobile, regular search on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <MobileSearch
        placeholder={placeholder}
        className={className}
        basePath=""
        onSearch={(query) => {
          handleSearch(query);
        }}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10 min-h-[48px] text-base"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 min-h-[44px] min-w-[44px] touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

