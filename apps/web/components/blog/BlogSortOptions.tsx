'use client';

import { ArrowUpDown, Calendar, TrendingUp, Star, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { cn } from '@karasu/lib';

export type SortOption = 'newest' | 'oldest' | 'popular' | 'trending' | 'reading-time';

interface BlogSortOptionsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

const sortOptions: Array<{ value: SortOption; label: string; icon: React.ElementType }> = [
  { value: 'newest', label: 'En Yeni', icon: Calendar },
  { value: 'oldest', label: 'En Eski', icon: Clock },
  { value: 'popular', label: 'En Popüler', icon: Star },
  { value: 'trending', label: 'Trend', icon: TrendingUp },
  { value: 'reading-time', label: 'Okuma Süresi', icon: Clock },
];

/**
 * Blog Sort Options Component
 * Allows users to sort articles by different criteria
 */
export function BlogSortOptions({
  currentSort,
  onSortChange,
  className,
}: BlogSortOptionsProps) {
  const currentOption = sortOptions.find(opt => opt.value === currentSort);
  const Icon = currentOption?.icon || ArrowUpDown;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sırala" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <OptionIcon className="h-4 w-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
