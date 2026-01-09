"use client";

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Checkbox } from '@karasu/ui';
import { Slider } from '@karasu/ui';
import { X, SlidersHorizontal, Save, Bookmark } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@karasu/lib';
import { getSavedSearches, saveSearch, deleteSavedSearch, loadSavedSearch, type SavedSearch } from '@/lib/saved-searches';
import { trackFilterUsage } from '@/lib/analytics/listings-events';
import { toast } from 'sonner';

export interface ListingFilters {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minPricePerM2?: number;
  maxPricePerM2?: number;
  rooms?: number[];
  propertyType?: string[];
  neighborhood?: string[];
  features?: {
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    seaView?: boolean;
    furnished?: boolean;
  };
  buildingAge?: number;
  floor?: number;
  orientation?: string[]; // Kuzey, Güney, Doğu, Batı
  heatingType?: string[]; // Kombi, Merkezi, Klima
  // Advanced filters
  dateRange?: '7days' | '30days' | '90days';
  minImages?: number;
  hasVideo?: boolean;
  hasVirtualTour?: boolean;
  hasFloorPlan?: boolean;
  isNewBuilding?: boolean;
  priceChange?: 'price-dropped' | 'price-increased' | 'new-listing';
}

interface ListingFiltersProps {
  neighborhoods?: string[];
  onFiltersChange?: (filters: ListingFilters) => void;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: 'daire', label: 'Daire' },
  { value: 'villa', label: 'Villa' },
  { value: 'ev', label: 'Ev' },
  { value: 'yazlik', label: 'Yazlık' },
  { value: 'arsa', label: 'Arsa' },
  { value: 'isyeri', label: 'İşyeri' },
  { value: 'dukkan', label: 'Dükkan' },
];

const ROOM_OPTIONS = [
  { value: 1, label: '1+0' },
  { value: 2, label: '1+1' },
  { value: 3, label: '2+1' },
  { value: 4, label: '3+1' },
  { value: 5, label: '4+1' },
  { value: 6, label: '5+1' },
  { value: 7, label: '6+1+' },
];

export function ListingFilters({ neighborhoods = [], onFiltersChange, className }: ListingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [filters, setFilters] = useState<ListingFilters>(() => {
    // Initialize from URL params
    const params: ListingFilters = {};
    if (searchParams.get('minPrice')) params.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) params.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('minSize')) params.minSize = Number(searchParams.get('minSize'));
    if (searchParams.get('maxSize')) params.maxSize = Number(searchParams.get('maxSize'));
    if (searchParams.get('rooms')) {
      params.rooms = searchParams.get('rooms')!.split(',').map(Number);
    }
    if (searchParams.get('propertyType')) {
      params.propertyType = searchParams.get('propertyType')!.split(',');
    }
    if (searchParams.get('neighborhood')) {
      params.neighborhood = searchParams.get('neighborhood')!.split(',');
    }
    if (searchParams.get('balcony') === 'true') {
      params.features = { ...params.features, balcony: true };
    }
    if (searchParams.get('parking') === 'true') {
      params.features = { ...params.features, parking: true };
    }
    if (searchParams.get('elevator') === 'true') {
      params.features = { ...params.features, elevator: true };
    }
    if (searchParams.get('seaView') === 'true') {
      params.features = { ...params.features, seaView: true };
    }
    if (searchParams.get('furnished') === 'true') {
      params.features = { ...params.features, furnished: true };
    }
    if (searchParams.get('buildingAge')) {
      params.buildingAge = Number(searchParams.get('buildingAge'));
    }
    if (searchParams.get('floor')) {
      params.floor = Number(searchParams.get('floor'));
    }
    if (searchParams.get('minPricePerM2')) {
      params.minPricePerM2 = Number(searchParams.get('minPricePerM2'));
    }
    if (searchParams.get('maxPricePerM2')) {
      params.maxPricePerM2 = Number(searchParams.get('maxPricePerM2'));
    }
    if (searchParams.get('orientation')) {
      params.orientation = searchParams.get('orientation')!.split(',');
    }
    if (searchParams.get('heatingType')) {
      params.heatingType = searchParams.get('heatingType')!.split(',');
    }
    return params;
  });

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // Load saved searches
  useEffect(() => {
    setSavedSearches(getSavedSearches());
    
    const handleUpdate = () => {
      setSavedSearches(getSavedSearches());
    };
    
    window.addEventListener('saved-searches-updated', handleUpdate);
    return () => window.removeEventListener('saved-searches-updated', handleUpdate);
  }, []);

  const updateFilters = (newFilters: Partial<ListingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice && filters.maxPrice < 10000000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minSize) params.set('minSize', filters.minSize.toString());
    if (filters.maxSize && filters.maxSize < 1000) params.set('maxSize', filters.maxSize.toString());
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));
    if (filters.propertyType?.length) params.set('propertyType', filters.propertyType.join(','));
    if (filters.neighborhood?.length) params.set('neighborhood', filters.neighborhood.join(','));
    if (filters.features?.balcony) params.set('balcony', 'true');
    if (filters.features?.parking) params.set('parking', 'true');
    if (filters.features?.elevator) params.set('elevator', 'true');
    if (filters.features?.seaView) params.set('seaView', 'true');
    if (filters.features?.furnished) params.set('furnished', 'true');
    if (filters.buildingAge) params.set('buildingAge', filters.buildingAge.toString());
    if (filters.floor) params.set('floor', filters.floor.toString());
    if (filters.minPricePerM2) params.set('minPricePerM2', filters.minPricePerM2.toString());
    if (filters.maxPricePerM2) params.set('maxPricePerM2', filters.maxPricePerM2.toString());
    if (filters.orientation?.length) params.set('orientation', filters.orientation.join(','));
    if (filters.heatingType?.length) params.set('heatingType', filters.heatingType.join(','));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({});
    router.push('?', { scroll: false });
  };

  const handleSaveSearch = async () => {
    if (!saveName.trim()) return;
    
    // Try to save to Supabase first, fallback to localStorage
    try {
      // Get email from localStorage or prompt
      let email = localStorage.getItem('user-email');
      if (!email) {
        email = prompt('E-posta adresinizi girin (bildirimler için):');
        if (!email) {
          toast.error('E-posta adresi gereklidir');
          return;
        }
        localStorage.setItem('user-email', email);
      }

      const response = await fetch('/api/searches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: saveName.trim(),
          filters: {
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            min_size: filters.minSize,
            max_size: filters.maxSize,
            property_type: filters.propertyType?.[0],
            location: 'Karasu',
            neighborhood: filters.neighborhood?.[0],
            rooms: filters.rooms,
            features: filters.features,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Arama kaydedildi! Yeni ilanlar bulunduğunda size bildirim göndereceğiz.');
        setSavedSearches(getSavedSearches());
        setShowSaveDialog(false);
        setSaveName('');
      } else {
        throw new Error(data.error || 'Arama kaydedilemedi');
      }
    } catch (error: any) {
      // Fallback to localStorage
      console.warn('Failed to save to Supabase, using localStorage:', error);
      const success = saveSearch(saveName.trim(), filters);
      if (success) {
        setSavedSearches(getSavedSearches());
        setShowSaveDialog(false);
        setSaveName('');
        toast.success('Arama kaydedildi (yerel)');
      } else {
        toast.error('Arama kaydedilemedi');
      }
    }
  };

  const handleLoadSearch = (searchId: string) => {
    const searchFilters = loadSavedSearch(searchId);
    if (searchFilters) {
      setFilters(searchFilters as ListingFilters);
      updateURL();
    }
  };

  const handleDeleteSearch = (searchId: string) => {
    deleteSavedSearch(searchId);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || 
    filters.rooms?.length || 
    filters.propertyType?.length || 
    filters.neighborhood?.length ||
    filters.features;

  const activeFilterCount = [
    filters.minPrice || filters.maxPrice,
    filters.minSize || filters.maxSize,
    filters.rooms?.length,
    filters.propertyType?.length,
    filters.neighborhood?.length,
    filters.features,
    filters.buildingAge,
    filters.floor,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtrele
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={cn(
        "space-y-6 border-2 border-border rounded-lg p-6 lg:p-8 bg-card",
        !isOpen && "hidden lg:block"
      )}>
        {/* Price Range */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Fiyat Aralığı</Label>
          <div className="space-y-4">
            {/* Price Slider */}
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
              min={0}
              max={10000000}
              step={100000}
              onValueChange={(values) => {
                updateFilters({ minPrice: values[0], maxPrice: values[1] });
                updateURL();
                if (values[0] > 0) trackFilterUsage('minPrice', values[0]);
                if (values[1] < 10000000) trackFilterUsage('maxPrice', values[1]);
              }}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Min (₺)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    updateFilters({ minPrice: value });
                    updateURL();
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Max (₺)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    updateFilters({ maxPrice: value });
                    updateURL();
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {new Intl.NumberFormat('tr-TR').format(filters.minPrice || 0)} ₺ - {new Intl.NumberFormat('tr-TR').format(filters.maxPrice || 10000000)} ₺
            </div>
          </div>
        </div>

        {/* Size Range */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">m² Aralığı</Label>
          <div className="space-y-4">
            {/* Size Slider */}
            <Slider
              value={[filters.minSize || 0, filters.maxSize || 1000]}
              min={0}
              max={1000}
              step={10}
              onValueChange={(values) => {
                updateFilters({ minSize: values[0], maxSize: values[1] });
                updateURL();
              }}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minSize" className="text-xs text-muted-foreground">Min (m²)</Label>
                <Input
                  id="minSize"
                  type="number"
                  placeholder="Min"
                  value={filters.minSize || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    updateFilters({ minSize: value });
                    updateURL();
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxSize" className="text-xs text-muted-foreground">Max (m²)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  placeholder="Max"
                  value={filters.maxSize || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    updateFilters({ maxSize: value });
                    updateURL();
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {filters.minSize || 0} m² - {filters.maxSize || 1000} m²
            </div>
          </div>
        </div>

        {/* Room Count */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Oda Sayısı</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${option.value}`}
                  checked={filters.rooms?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentRooms = filters.rooms || [];
                    const newRooms = checked
                      ? [...currentRooms, option.value]
                      : currentRooms.filter((r) => r !== option.value);
                    updateFilters({ rooms: newRooms.length > 0 ? newRooms : undefined });
                    updateURL();
                  }}
                />
                <Label
                  htmlFor={`room-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Emlak Tipi</Label>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.propertyType?.includes(type.value) || false}
                  onCheckedChange={(checked) => {
                    const currentTypes = filters.propertyType || [];
                    const newTypes = checked
                      ? [...currentTypes, type.value]
                      : currentTypes.filter((t) => t !== type.value);
                    updateFilters({ propertyType: newTypes.length > 0 ? newTypes : undefined });
                    updateURL();
                    if (checked) trackFilterUsage('propertyType', type.label);
                  }}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        {neighborhoods.length > 0 && (
          <div>
            <Label className="text-sm font-semibold mb-4 block text-foreground">Mahalle</Label>
            <Select
              value={filters.neighborhood?.[0] || 'all'}
              onValueChange={(value) => {
                updateFilters({ neighborhood: value && value !== 'all' ? [value] : undefined });
                updateURL();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mahalle seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Features */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Özellikler</Label>
          <div className="space-y-2">
            {[
              { key: 'balcony', label: 'Balkon' },
              { key: 'parking', label: 'Otopark' },
              { key: 'elevator', label: 'Asansör' },
              { key: 'seaView', label: 'Deniz Manzarası' },
              { key: 'furnished', label: 'Eşyalı' },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature.key}`}
                  checked={filters.features?.[feature.key as keyof typeof filters.features] || false}
                  onCheckedChange={(checked) => {
                    updateFilters({
                      features: {
                        ...filters.features,
                        [feature.key]: checked || undefined,
                      },
                    });
                    updateURL();
                  }}
                />
                <Label
                  htmlFor={`feature-${feature.key}`}
                  className="text-sm cursor-pointer"
                >
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Building Age */}
        <div>
          <Label htmlFor="buildingAge" className="text-sm font-semibold mb-4 block text-foreground">
            Bina Yaşı (Max)
          </Label>
          <Input
            id="buildingAge"
            type="number"
            placeholder="Örn: 10"
            value={filters.buildingAge || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              updateFilters({ buildingAge: value });
              updateURL();
            }}
          />
        </div>

        {/* Floor */}
        <div>
          <Label htmlFor="floor" className="text-sm font-semibold mb-4 block text-foreground">
            Kat
          </Label>
          <Input
            id="floor"
            type="number"
            placeholder="Örn: 3"
            value={filters.floor || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              updateFilters({ floor: value });
              updateURL();
            }}
          />
        </div>

        {/* Price per m² */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">
            m² Başına Fiyat
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="minPricePerM2" className="text-xs text-muted-foreground mb-1 block">
                Min (₺/m²)
              </Label>
              <Input
                id="minPricePerM2"
                type="number"
                placeholder="Örn: 10000"
                value={filters.minPricePerM2 || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  updateFilters({ minPricePerM2: value });
                  updateURL();
                }}
              />
            </div>
            <div>
              <Label htmlFor="maxPricePerM2" className="text-xs text-muted-foreground mb-1 block">
                Max (₺/m²)
              </Label>
              <Input
                id="maxPricePerM2"
                type="number"
                placeholder="Örn: 50000"
                value={filters.maxPricePerM2 || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  updateFilters({ maxPricePerM2: value });
                  updateURL();
                }}
              />
            </div>
          </div>
        </div>

        {/* Orientation */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Cephe (Yön)</Label>
          <div className="space-y-2">
            {[
              { value: 'kuzey', label: 'Kuzey' },
              { value: 'guney', label: 'Güney' },
              { value: 'dogu', label: 'Doğu' },
              { value: 'bati', label: 'Batı' },
            ].map((orientation) => (
              <div key={orientation.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`orientation-${orientation.value}`}
                  checked={filters.orientation?.includes(orientation.value) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.orientation || [];
                    const updated = checked
                      ? [...current, orientation.value]
                      : current.filter((o) => o !== orientation.value);
                    updateFilters({ orientation: updated.length > 0 ? updated : undefined });
                    updateURL();
                  }}
                />
                <Label
                  htmlFor={`orientation-${orientation.value}`}
                  className="text-sm cursor-pointer"
                >
                  {orientation.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Heating Type */}
        <div>
          <Label className="text-sm font-semibold mb-4 block text-foreground">Isıtma Tipi</Label>
          <div className="space-y-2">
            {[
              { value: 'kombi', label: 'Kombi' },
              { value: 'merkezi', label: 'Merkezi' },
              { value: 'klima', label: 'Klima' },
              { value: 'soba', label: 'Soba' },
            ].map((heating) => (
              <div key={heating.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`heating-${heating.value}`}
                  checked={filters.heatingType?.includes(heating.value) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.heatingType || [];
                    const updated = checked
                      ? [...current, heating.value]
                      : current.filter((h) => h !== heating.value);
                    updateFilters({ heatingType: updated.length > 0 ? updated : undefined });
                    updateURL();
                  }}
                />
                <Label
                  htmlFor={`heating-${heating.value}`}
                  className="text-sm cursor-pointer"
                >
                  {heating.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div>
            <Label className="text-sm font-semibold mb-3 block flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Kayıtlı Aramalar
              </span>
            </Label>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                  <button
                    onClick={() => handleLoadSearch(search.id)}
                    className="flex-1 text-left text-sm"
                  >
                    {search.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="p-1 hover:text-destructive"
                    aria-label="Sil"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Search */}
        {hasActiveFilters && (
          <div className="space-y-2">
            {showSaveDialog ? (
              <div className="space-y-2">
                <Input
                  placeholder="Arama adı..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSearch();
                    if (e.key === 'Escape') {
                      setShowSaveDialog(false);
                      setSaveName('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSearch} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveName('');
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Aramayı Kaydet
              </Button>
            )}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Filtreleri Temizle
          </Button>
        )}
      </div>
    </div>
  );
}

