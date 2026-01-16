"use client";

import { useState } from 'react';
import { Button } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Checkbox } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { 
  ArrowUpDown, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Image as ImageIcon,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@karasu/lib';
import type { ListingFilters } from './ListingFilters';

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

export interface AdvancedFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: Partial<ListingFilters>) => void;
  onSortChange: (sort: SortOption) => void;
  currentSort?: SortOption;
  className?: string;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'created_at', order: 'desc', label: 'En Yeni' },
  { field: 'created_at', order: 'asc', label: 'En Eski' },
  { field: 'price_amount', order: 'asc', label: 'Fiyat: Düşük → Yüksek' },
  { field: 'price_amount', order: 'desc', label: 'Fiyat: Yüksek → Düşük' },
  { field: 'features->sizeM2', order: 'desc', label: 'm²: Büyük → Küçük' },
  { field: 'features->sizeM2', order: 'asc', label: 'm²: Küçük → Büyük' },
  { field: 'updated_at', order: 'desc', label: 'Son Güncellenen' },
];

const QUICK_FILTERS = [
  {
    id: 'new',
    label: 'Yeni İlanlar',
    icon: Clock,
    filters: { dateRange: '7days' as const },
  },
  {
    id: 'price-low',
    label: 'En Ucuz',
    icon: TrendingDown,
    filters: { sortBy: 'price-asc' as const },
  },
  {
    id: 'price-high',
    label: 'En Pahalı',
    icon: TrendingUp,
    filters: { sortBy: 'price-desc' as const },
  },
  {
    id: 'large',
    label: 'En Büyük',
    icon: Sparkles,
    filters: { sortBy: 'size-desc' as const },
  },
  {
    id: 'with-photos',
    label: 'Fotoğraflı',
    icon: ImageIcon,
    filters: { minImages: 3 },
  },
];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onSortChange,
  currentSort,
  className,
}: AdvancedFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const handleQuickFilter = (quickFilter: typeof QUICK_FILTERS[0]) => {
    if (activeQuickFilter === quickFilter.id) {
      // Deactivate
      setActiveQuickFilter(null);
      if (quickFilter.filters.dateRange) {
        onFiltersChange({ dateRange: undefined });
      }
      if (quickFilter.filters.sortBy) {
        // Reset to default sort
        onSortChange(SORT_OPTIONS[0]);
      }
      if (quickFilter.filters.minImages) {
        onFiltersChange({ minImages: undefined });
      }
    } else {
      // Activate
      setActiveQuickFilter(quickFilter.id);
      
      if (quickFilter.filters.dateRange) {
        onFiltersChange({ dateRange: quickFilter.filters.dateRange });
      }
      
      if (quickFilter.filters.sortBy) {
        if (quickFilter.filters.sortBy === 'price-asc') {
          onSortChange({ field: 'price_amount', order: 'asc', label: 'Fiyat: Düşük → Yüksek' });
        } else if (quickFilter.filters.sortBy === 'price-desc') {
          onSortChange({ field: 'price_amount', order: 'desc', label: 'Fiyat: Yüksek → Düşük' });
        } else if (quickFilter.filters.sortBy === 'size-desc') {
          onSortChange({ field: 'features->sizeM2', order: 'desc', label: 'm²: Büyük → Küçük' });
        }
      }
      
      if (quickFilter.filters.minImages) {
        onFiltersChange({ minImages: quickFilter.filters.minImages });
      }
    }
  };

  const handleSortChange = (value: string) => {
    const sort = SORT_OPTIONS.find(s => `${s.field}-${s.order}` === value);
    if (sort) {
      onSortChange(sort);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sort and Quick Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-sm font-medium whitespace-nowrap">Sırala:</Label>
          <Select
            value={currentSort ? `${currentSort.field}-${currentSort.order}` : 'created_at-desc'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-[250px] min-h-[48px] touch-manipulation" style={{ touchAction: 'manipulation' }}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sıralama seçin" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem 
                  key={`${option.field}-${option.order}`} 
                  value={`${option.field}-${option.order}`}
                  className="min-h-[44px] touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {QUICK_FILTERS.map((quickFilter) => {
            const Icon = quickFilter.icon;
            const isActive = activeQuickFilter === quickFilter.id;
            return (
              <Button
                key={quickFilter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(quickFilter)}
                className={cn(
                  "gap-2 min-h-[44px] touch-manipulation active:scale-95",
                  isActive && "bg-primary text-primary-foreground"
                )}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className="h-4 w-4" />
                {quickFilter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2 min-h-[44px] touch-manipulation active:scale-95"
          style={{ touchAction: 'manipulation' }}
        >
          <Zap className="h-4 w-4" />
          {showAdvanced ? 'Gelişmiş Filtreleri Gizle' : 'Gelişmiş Filtreler'}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          {/* Date Range Filter */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Tarih Aralığı</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: '7days', label: 'Son 7 Gün' },
                { value: '30days', label: 'Son 30 Gün' },
                { value: '90days', label: 'Son 3 Ay' },
                { value: 'all', label: 'Tümü' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onFiltersChange({ 
                      dateRange: option.value === 'all' ? undefined : option.value as any 
                    });
                  }}
                  className="w-full min-h-[44px] touch-manipulation active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Image Count Filter */}
          <div>
            <Label htmlFor="minImages" className="text-sm font-semibold mb-2 block">
              Minimum Fotoğraf Sayısı
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="minImages"
                type="number"
                min="0"
                max="20"
                placeholder="Örn: 3"
                value={filters.minImages || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  onFiltersChange({ minImages: value });
                }}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                {filters.minImages ? `${filters.minImages}+ fotoğraf` : 'Tümü'}
              </span>
            </div>
          </div>

          {/* Additional Features */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Ek Özellikler</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hasVideo', label: 'Video Tur' },
                { key: 'hasVirtualTour', label: 'Sanal Tur' },
                { key: 'hasFloorPlan', label: 'Kat Planı' },
                { key: 'isNewBuilding', label: 'Yeni Bina' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`advanced-${feature.key}`}
                    checked={Boolean(filters[feature.key as keyof ListingFilters])}
                    onCheckedChange={(checked) => {
                      onFiltersChange({ [feature.key]: checked || undefined });
                    }}
                  />
                  <Label
                    htmlFor={`advanced-${feature.key}`}
                    className="text-sm cursor-pointer"
                  >
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Change Indicator */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Fiyat Değişikliği</Label>
            <div className="space-y-2">
              {[
                { value: 'price-dropped', label: 'Fiyatı Düşen' },
                { value: 'price-increased', label: 'Fiyatı Artan' },
                { value: 'new-listing', label: 'Yeni İlan' },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`price-${option.value}`}
                    checked={filters.priceChange === option.value}
                    onCheckedChange={(checked) => {
                      onFiltersChange({ 
                        priceChange: checked ? (option.value as 'price-dropped' | 'price-increased' | 'new-listing') : undefined 
                      });
                    }}
                  />
                  <Label
                    htmlFor={`price-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
