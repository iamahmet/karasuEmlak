"use client";

import { useState } from 'react';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function HomeSearch() {
  const router = useRouter();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search in both satilik and kiralik
      router.push(`${basePath}/satilik?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col md:flex-row gap-4 bg-background border rounded-lg p-4 shadow-lg">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Lokasyon, mahalle veya ilan no ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Ara
        </Button>
      </div>
    </form>
  );
}

