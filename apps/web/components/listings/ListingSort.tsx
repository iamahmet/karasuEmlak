"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface ListingSortProps {
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Yeni Eklenenler' },
  { value: 'created_at-asc', label: 'Eski Eklenenler' },
  { value: 'price_amount-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_amount-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'updated_at-desc', label: 'Son Güncellenenler' },
];

export function ListingSort({ className }: ListingSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'created_at-desc';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'created_at-desc') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    params.delete('page'); // Reset to first page on sort change
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={className}>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-[200px] min-h-[48px] touch-manipulation" style={{ touchAction: 'manipulation' }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="min-h-[44px] touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

