"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Card, CardContent } from '@karasu/ui';
import { Search, X, Grid, List } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingSort } from '@/components/listings/ListingSort';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import type { Listing } from '@/lib/supabase/queries';
import { generateSlug } from '@/lib/utils';

interface AramaClientProps {
  initialListings: Listing[];
  total: number;
  initialQuery?: string;
  initialType?: string;
  initialProperty?: string;
  initialMahalle?: string;
  basePath: string;
}

const ITEMS_PER_PAGE = 18;

export function AramaClient({
  initialListings,
  total,
  initialQuery = '',
  initialType = '',
  initialProperty = '',
  initialMahalle = '',
  basePath,
}: AramaClientProps) {
  const router = useRouter();
  
  const [query, setQuery] = useState(initialQuery);
  const [listingType, setListingType] = useState(initialType);
  const [propertyType, setPropertyType] = useState(initialProperty);
  const [mahalle, setMahalle] = useState(initialMahalle);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter listings based on search criteria
  const filteredListings = useMemo(() => {
    let filtered = [...initialListings];

    // Filter by listing type
    if (listingType) {
      filtered = filtered.filter((l) => l.status === listingType);
    }

    // Filter by property type
    if (propertyType) {
      filtered = filtered.filter((l) => l.property_type === propertyType);
    }

    // Filter by mahalle
    if (mahalle) {
      const mahalleSlug = generateSlug(mahalle);
      filtered = filtered.filter((l) => {
        if (!l.location_neighborhood) return false;
        const neighborhoodSlug = generateSlug(l.location_neighborhood);
        return neighborhoodSlug.includes(mahalleSlug) || mahalleSlug.includes(neighborhoodSlug);
      });
    }

    // Filter by query
    if (query) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter((l) => {
        const title = l.title?.toLowerCase() || '';
        const desc = l.description_short?.toLowerCase() || '';
        const neighborhood = l.location_neighborhood?.toLowerCase() || '';
        const propertyType = l.property_type?.toLowerCase() || '';
        
        return (
          title.includes(queryLower) ||
          desc.includes(queryLower) ||
          neighborhood.includes(queryLower) ||
          propertyType.includes(queryLower)
        );
      });
    }

    return filtered;
  }, [initialListings, query, listingType, propertyType, mahalle]);

  // Sort listings
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price_amount || 0) - (b.price_amount || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price_amount || 0) - (a.price_amount || 0));
      case 'size-asc':
        return sorted.sort((a, b) => {
          const sizeA = (a.features as any)?.sizeM2 || 0;
          const sizeB = (b.features as any)?.sizeM2 || 0;
          return sizeA - sizeB;
        });
      case 'size-desc':
        return sorted.sort((a, b) => {
          const sizeA = (a.features as any)?.sizeM2 || 0;
          const sizeB = (b.features as any)?.sizeM2 || 0;
          return sizeB - sizeA;
        });
      case 'date-desc':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
    }
  }, [filteredListings, sortBy]);

  // Paginate listings
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedListings.slice(start, end);
  }, [sortedListings, currentPage]);

  const totalPages = Math.ceil(sortedListings.length / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (listingType) params.set('type', listingType);
    if (propertyType) params.set('propertyType', propertyType);
    if (mahalle) params.set('neighborhood', mahalle);
    router.push(`${basePath}/arama?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery('');
    setListingType('');
    setPropertyType('');
    setMahalle('');
    router.push(`${basePath}/arama`);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Lokasyon, mahalle veya ilan no ara..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="listing-type" className="text-sm font-medium mb-2 block">İlan Tipi</label>
                <select
                  id="listing-type"
                  title="İlan tipi seçin"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  aria-label="İlan tipi seçin"
                >
                  <option value="">Tümü</option>
                  <option value="satilik">Satılık</option>
                  <option value="kiralik">Kiralık</option>
                </select>
              </div>

              <div>
                <label htmlFor="property-type" className="text-sm font-medium mb-2 block">Gayrimenkul Tipi</label>
                <select
                  id="property-type"
                  title="Gayrimenkul tipi seçin"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  aria-label="Gayrimenkul tipi seçin"
                >
                  <option value="">Tümü</option>
                  <option value="daire">Daire</option>
                  <option value="villa">Villa</option>
                  <option value="yazlik">Yazlık</option>
                  <option value="arsa">Arsa</option>
                  <option value="isyeri">İşyeri</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mahalle</label>
                <Input
                  type="text"
                  placeholder="Mahalle adı..."
                  value={mahalle}
                  onChange={(e) => setMahalle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Ara
              </Button>
              {(query || listingType || propertyType || mahalle) && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Temizle
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {sortedListings.length} sonuç bulundu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ListingSort />
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {paginatedListings.length > 0 ? (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {paginatedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
                basePath={basePath}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="İlan bulunamadı"
          description="Aradığınız kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz."
          action={
            (query || listingType || propertyType || mahalle)
              ? {
                  label: "Filtreleri Temizle",
                  onClick: clearFilters,
                  variant: "outline",
                }
              : undefined
          }
          variant="compact"
        />
      )}
    </div>
  );
}

