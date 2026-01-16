"use client";

import { useState, Fragment } from 'react';
import { Button, Grid as GridComponent } from '@karasu/ui';
import { Grid, List, MapPin, Square, Home, Building2, Map, Info, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardImage, ListingImage } from '@/components/images';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { ListingSort } from '@/components/listings/ListingSort';
import { AdvancedFilters, type SortOption } from '@/components/listings/AdvancedFilters';
import type { ListingFilters as ListingFiltersType } from '@/components/listings/ListingFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@karasu/lib';
import type { Listing } from '@/lib/supabase/queries';
import dynamic from 'next/dynamic';
import { QuickViewModal } from '@/components/listings/QuickViewModal';
import { SocialProofBadges } from '@/components/listings/SocialProofBadges';
import { trackQuickView, trackViewModeChange, trackListingClick } from '@/lib/analytics/listings-events';
import { MobileFiltersSheet } from '@/components/listings/MobileFiltersSheet';
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { hapticButtonPress, hapticSuccess } from '@/lib/mobile/haptics';
import { InfiniteScrollListings } from '@/components/listings/InfiniteScrollListings';
import { SwipeableListingCard } from '@/components/listings/SwipeableListingCard';

// Lazy load map component
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3 animate-pulse" />
        <p className="text-slate-600 text-sm">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

interface ListingsClientProps {
  initialListings: Listing[];
  total: number;
  basePath: string;
  neighborhoods: string[];
  searchParams: {
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minSize?: string;
    maxSize?: string;
    rooms?: string;
    propertyType?: string;
    neighborhood?: string;
    balcony?: string;
    parking?: string;
    elevator?: string;
    seaView?: string;
    furnished?: string;
    buildingAge?: string;
    floor?: string;
    sort?: string;
  };
}

export function ListingsClient({
  initialListings: listings,
  total,
  basePath,
  neighborhoods,
  searchParams,
}: ListingsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [quickViewListing, setQuickViewListing] = useState<Listing | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ListingFiltersType>({});
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>({
    field: 'created_at',
    order: 'desc',
    label: 'En Yeni',
  });
  const currentPage = parseInt(searchParams.page || '1', 10);
  const limit = 18;
  const totalPages = Math.ceil(total / limit);

  const handleRefresh = async () => {
    router.refresh();
  };

  // Helper function to render listing card content
  const renderListingCard = (listing: Listing, mainImage: Listing['images'][0] | undefined) => {
    return (
      <>
        <div className="h-56 bg-slate-100 relative overflow-hidden">
          {mainImage?.public_id || mainImage?.url ? (
            mainImage.url ? (
              <img
                src={mainImage.url}
                alt={mainImage.alt || listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <ListingImage
                publicId={mainImage.public_id!}
                alt={mainImage.alt || listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
              />
            )
          ) : (
            <img
              src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
              alt={generatePropertyImageAlt({
                propertyType: listing.property_type as any,
                status: listing.status,
                location: {
                  neighborhood: listing.location_neighborhood,
                  district: listing.location_district,
                  city: 'Karasu',
                },
                features: {
                  rooms: listing.features?.rooms,
                  sizeM2: listing.features?.sizeM2,
                  seaView: listing.features?.seaView,
                  furnished: listing.features?.furnished,
                },
                price: listing.price_amount,
              }, listing.title)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-[#006AFF]/90 text-white px-3 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg">
              Satılık
            </div>
          </div>
          {listing.featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg z-10 badge-pulse">
              ⭐ Öne Çıkan
            </div>
          )}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-background/80 text-foreground px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.01em] backdrop-blur-sm shadow-lg">
              {listing.images.length} Fotoğraf
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-3">
            <SocialProofBadges listing={listing} className="mb-2" />
            <h3 className="font-semibold line-clamp-2 text-[17px] text-slate-900 group-hover:text-[#006AFF] transition-colors leading-snug tracking-[-0.022em]">
              {listing.title}
            </h3>
          </div>
          <p className="text-[15px] text-slate-600 mb-4 flex items-center gap-2 font-medium tracking-[-0.011em]">
            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={2} />
            {listing.location_neighborhood}, {listing.location_district}
          </p>
          {listing.features.sizeM2 && (
            <div className="flex items-center gap-5 text-[13px] text-slate-600 mb-6 pb-5 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-semibold tracking-tight text-slate-700">
                <Square className="h-4 w-4 text-slate-400" strokeWidth={2} />
                {listing.features.sizeM2} m²
              </span>
              {listing.features.rooms && (
                <span className="flex items-center gap-1.5 font-semibold tracking-tight text-slate-700">
                  <Home className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  {listing.features.rooms} Oda
                </span>
              )}
              {listing.features.bathrooms && (
                <span className="font-semibold tracking-tight text-slate-700">{listing.features.bathrooms} Banyo</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            {listing.price_amount && (
              <p className="text-2xl font-bold text-[#006AFF] tracking-tight">
                ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
              </p>
            )}
          </div>
        </div>
        <Link 
          href={`${basePath}/ilan/${listing.slug}`}
          className="absolute inset-0 z-10 touch-manipulation"
          aria-label={`${listing.title} - ${listing.location_neighborhood}, ${listing.location_district}`}
          onClick={() => trackListingClick(listing.id, listing.title, 'card')}
          prefetch={true}
          style={{ touchAction: 'manipulation' }}
        />
        <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 z-20 pointer-events-none">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewListing(listing);
              trackQuickView(listing.id, listing.title);
            }}
            className="gap-2 bg-white text-slate-900 hover:bg-slate-50 shadow-lg pointer-events-auto touch-manipulation min-h-[44px]"
            size="lg"
            style={{ touchAction: 'manipulation' }}
          >
            <Eye className="h-4 w-4" />
            Hızlı Görüntüle
          </Button>
        </div>
      </>
    );
  };

  // Convert searchParams to ListingFilters format
  const listingFilters: ListingFiltersType = {
    ...(searchParams.minPrice && { minPrice: Number(searchParams.minPrice) }),
    ...(searchParams.maxPrice && { maxPrice: Number(searchParams.maxPrice) }),
    ...(searchParams.minSize && { minSize: Number(searchParams.minSize) }),
    ...(searchParams.maxSize && { maxSize: Number(searchParams.maxSize) }),
    ...(searchParams.rooms && { rooms: searchParams.rooms.split(',').map(Number) }),
    ...(searchParams.propertyType && { propertyType: searchParams.propertyType.split(',') }),
    ...(searchParams.neighborhood && { neighborhood: searchParams.neighborhood.split(',') }),
    ...(searchParams.q && { query: searchParams.q }),
    ...(searchParams.balcony === 'true' && { features: { ...filters.features, balcony: true } }),
    ...(searchParams.parking === 'true' && { features: { ...filters.features, parking: true } }),
    ...(searchParams.elevator === 'true' && { features: { ...filters.features, elevator: true } }),
    ...(searchParams.seaView === 'true' && { features: { ...filters.features, seaView: true } }),
    ...(searchParams.furnished === 'true' && { features: { ...filters.features, furnished: true } }),
  };

  return (
    <Fragment>
      <MobileFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        neighborhoods={neighborhoods}
      />
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-white pb-20 md:pb-0">
        <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Search Bar - Enhanced */}
        <div className="mb-8 lg:mb-12">
          <div className="max-w-3xl mx-auto">
            <ListingSearch placeholder="Lokasyon, mahalle veya ilan no ara..." className="w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filters Sidebar - Hidden on mobile, shown via sheet */}
          <div className="hidden lg:block lg:col-span-1">
            <ListingFilters neighborhoods={neighborhoods} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => {
                  hapticButtonPress();
                  setFiltersOpen(true);
                }}
                className="w-full h-12 min-h-[48px] rounded-xl font-semibold bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#006AFF]/40 active:scale-95 flex items-center justify-center gap-2 shadow-sm touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                <Filter className="h-5 w-5" />
                Filtreler
              </Button>
            </div>
          {/* Results Header - Corporate Style */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-2 tracking-tight">
              {total > 0 ? `${total} İlan Bulundu` : 'İlan Bulunamadı'}
            </h2>
            <p className="text-slate-600 text-[15px] font-normal tracking-[-0.011em]">
              {total > 0 ? 'Filtreleri kullanarak arama sonuçlarını daraltabilirsiniz' : 'Farklı kriterlerle tekrar deneyin'}
            </p>
          </div>
          
          {/* Advanced Filters & Sort */}
          <div className="mb-8">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters((prev) => ({ ...prev, ...newFilters }));
                // Update URL with new filters
                const params = new URLSearchParams();
                Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
                  if (value !== undefined && value !== null) {
                    // Skip empty strings only if value is actually a string type
                    if (typeof value === 'string' && value.length === 0) {
                      return;
                    }
                    if (Array.isArray(value)) {
                      params.set(key, value.join(','));
                    } else if (typeof value === 'object' && value !== null) {
                      Object.entries(value).forEach(([subKey, subValue]) => {
                        if (subValue) params.set(subKey, 'true');
                      });
                    } else {
                      params.set(key, String(value));
                    }
                  }
                });
                if (currentSort.field !== 'created_at' || currentSort.order !== 'desc') {
                  params.set('sort', `${currentSort.field}-${currentSort.order}`);
                }
                window.history.pushState({}, '', `${basePath}/satilik?${params.toString()}`);
              }}
              onSortChange={(sort) => {
                setCurrentSort(sort);
                const params = new URLSearchParams(window.location.search);
                params.set('sort', `${sort.field}-${sort.order}`);
                window.location.href = `${basePath}/satilik?${params.toString()}`;
              }}
              currentSort={currentSort}
            />
          </div>

          {/* Toolbar - Corporate Style */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 lg:mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              <ListingSort />
              {/* Infinite Scroll Toggle - Mobile Only */}
              <div className="lg:hidden flex items-center gap-2">
                <label className="text-sm text-slate-600 font-medium">Sonsuz kaydırma:</label>
                <Button
                  variant={useInfiniteScroll ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    hapticButtonPress();
                    setUseInfiniteScroll(!useInfiniteScroll);
                  }}
                  className="h-8 px-3 touch-manipulation min-h-[32px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  {useInfiniteScroll ? 'Açık' : 'Kapalı'}
                </Button>
              </div>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    hapticButtonPress();
                    setViewMode('grid');
                    trackViewModeChange('grid');
                  }}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation active:scale-95"
                  aria-label="Grid görünümü"
                  title="Grid görünümü"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    hapticButtonPress();
                    setViewMode('list');
                    trackViewModeChange('list');
                  }}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation active:scale-95"
                  aria-label="Liste görünümü"
                  title="Liste görünümü"
                  style={{ touchAction: 'manipulation' }}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    hapticButtonPress();
                    setViewMode('map');
                    trackViewModeChange('map');
                  }}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] touch-manipulation active:scale-95"
                  aria-label="Harita görünümü"
                  title="Harita görünümü"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Property Grid/List/Map */}
          {listings.length > 0 ? (
            <Fragment>
              {viewMode === 'map' ? (
                <div className="w-full">
                  <InteractiveMap
                    listings={listings.map(l => ({
                      id: l.id,
                      title: l.title,
                      slug: l.slug,
                      location_neighborhood: l.location_neighborhood || '',
                      location_district: l.location_district || '',
                      coordinates_lat: String(l.coordinates_lat || '41.0965'),
                      coordinates_lng: String(l.coordinates_lng || '30.7860'),
                      price_amount: String(l.price_amount || ''),
                      status: l.status || 'satilik',
                      property_type: l.property_type || '',
                      images: l.images?.map(img => ({
                        public_id: img.public_id || '',
                        url: img.url,
                        alt: img.alt,
                      })) || [],
                      features: l.features || {},
                    }))}
                    basePath={basePath}
                    height="600px"
                  />
                </div>
              ) : viewMode === 'grid' ? (
                useInfiniteScroll ? (
                  <InfiniteScrollListings
                    initialListings={listings}
                    initialTotal={total}
                    filters={listingFilters}
                    sort={currentSort}
                    basePath={basePath}
                    limit={limit}
                    renderListing={(listing, index) => {
                      const mainImage = listing.images?.[0];
                      return (
                        <SwipeableListingCard
                          key={listing.id}
                          listing={listing}
                          basePath={basePath}
                          onFavorite={async (listingId) => {
                            // Favorite logic handled by FavoriteButton
                            hapticButtonPress();
                          }}
                          onShare={async (listing) => {
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: listing.title,
                                  text: `${listing.title} - ${listing.location_neighborhood}`,
                                  url: `${basePath}/ilan/${listing.slug}`,
                                });
                                hapticSuccess();
                              } catch (err) {
                                // User cancelled
                              }
                            }
                          }}
                          className="md:hidden"
                        >
                          <div className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm relative">
                            {renderListingCard(listing, mainImage)}
                          </div>
                        </SwipeableListingCard>
                      );
                    }}
                  />
                ) : (
                  <GridComponent variant="default" className="gap-6 lg:gap-8">
                    {listings.map((listing) => {
                      const mainImage = listing.images?.[0];
                      const cardContent = renderListingCard(listing, mainImage);

                      // Use SwipeableListingCard on mobile, regular div on desktop
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        return (
                          <SwipeableListingCard
                            key={listing.id}
                            listing={listing}
                            basePath={basePath}
                            onFavorite={async () => {
                              hapticButtonPress();
                            }}
                            onShare={async (listing) => {
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: listing.title,
                                    text: `${listing.title} - ${listing.location_neighborhood}`,
                                    url: `${basePath}/ilan/${listing.slug}`,
                                  });
                                  hapticSuccess();
                                } catch (err) {
                                  // User cancelled
                                }
                              }
                            }}
                            className="md:hidden"
                          >
                            <div className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm relative">
                              {cardContent}
                            </div>
                          </SwipeableListingCard>
                        );
                      }

                      return (
                        <div key={listing.id} className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm relative">
                          {cardContent}
                        </div>
                      );
                    })}
                  </GridComponent>
                )
              ) : (
                <div className="space-y-6">
                  {listings.map((listing) => {
                    const mainImage = listing.images?.[0];
                    return (
                      <Link key={listing.id} href={`${basePath}/ilan/${listing.slug}`} prefetch={true}>
                        <div className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 flex flex-col md:flex-row shadow-sm">
                          <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative flex-shrink-0 overflow-hidden">
                            {mainImage?.public_id || mainImage?.url ? (
                              mainImage.url ? (
                                <img
                                  src={mainImage.url}
                                  alt={mainImage.alt || listing.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                  loading="lazy"
                                />
                              ) : (
                                <ListingImage
                                  publicId={mainImage.public_id!}
                                  alt={mainImage.alt || listing.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                                />
                              )
                            ) : (
                              <img
                                src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                                alt={generatePropertyImageAlt({
                                  propertyType: listing.property_type as any,
                                  status: listing.status,
                                  location: {
                                    neighborhood: listing.location_neighborhood,
                                    district: listing.location_district,
                                    city: 'Karasu',
                                  },
                                  features: {
                                    rooms: listing.features?.rooms,
                                    sizeM2: listing.features?.sizeM2,
                                    seaView: listing.features?.seaView,
                                    furnished: listing.features?.furnished,
                                  },
                                  price: listing.price_amount,
                                }, listing.title)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                loading="lazy"
                              />
                            )}
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {/* Status Badge - Apple Quality */}
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-[#006AFF]/90 text-white px-3 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg">
                                Satılık
                              </div>
                            </div>
                            {listing.featured && (
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg z-10 badge-pulse">
                                ⭐ Öne Çıkan
                              </div>
                            )}
                            {/* Image count badge - Apple Quality */}
                            {listing.images && listing.images.length > 1 && (
                              <div className="absolute bottom-3 right-3 bg-background/80 text-foreground px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.01em] backdrop-blur-sm shadow-lg">
                                {listing.images.length} Fotoğraf
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="mb-3">
                              <SocialProofBadges listing={listing} className="mb-2" />
                              <h3 className="font-semibold line-clamp-2 text-[17px] text-slate-900 group-hover:text-[#006AFF] transition-colors leading-snug tracking-[-0.022em]">
                                {listing.title}
                              </h3>
                            </div>
                            <p className="text-[15px] text-slate-600 mb-4 flex items-center gap-2 font-medium tracking-[-0.011em]">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" strokeWidth={2} />
                              {listing.location_neighborhood}, {listing.location_district}
                            </p>
                            {listing.features.sizeM2 && (
                              <div className="flex items-center gap-5 text-[13px] text-slate-600 mb-6 pb-5 border-b border-slate-100">
                                <span className="flex items-center gap-1.5 font-semibold tracking-tight text-slate-700">
                                  <Square className="h-4 w-4 text-slate-400" strokeWidth={2} />
                                  {listing.features.sizeM2} m²
                                </span>
                                {listing.features.rooms && (
                                  <span className="flex items-center gap-1.5 font-semibold tracking-tight text-slate-700">
                                    <Home className="h-4 w-4 text-slate-400" strokeWidth={2} />
                                    {listing.features.rooms} Oda
                                  </span>
                                )}
                                {listing.features.bathrooms && (
                                  <span className="font-semibold tracking-tight text-slate-700">{listing.features.bathrooms} Banyo</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              {listing.price_amount && (
                                <p className="text-2xl font-bold text-[#006AFF] tracking-tight">
                                  ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Quick View Button - Above link, clickable (desktop only) */}
                          <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 z-20 pointer-events-none">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewListing(listing);
                                trackQuickView(listing.id, listing.title);
                              }}
                              className="gap-2 bg-white text-slate-900 hover:bg-slate-50 shadow-lg pointer-events-auto touch-manipulation min-h-[44px]"
                              size="lg"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Eye className="h-4 w-4" />
                              Hızlı Görüntüle
                            </Button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Fragment>
          ) : null}

          {/* Pagination - Apple Quality */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const buildUrl = (page: number) => {
                        const params = new URLSearchParams();
                        Object.entries(searchParams).forEach(([key, value]) => {
                          if (key !== 'page' && value) {
                            params.set(key, String(value));
                          }
                        });
                        if (page > 1) params.set('page', String(page));
                        const queryString = params.toString();
                        return `${basePath}/satilik${queryString ? `?${queryString}` : ''}`;
                      };

                      return (
                        <Fragment key="pagination">
                          <Link href={buildUrl(currentPage - 1)} prefetch={currentPage > 1}>
                            <Button 
                              variant="outline" 
                              disabled={currentPage === 1}
                              className="h-12 min-h-[48px] px-5 rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 text-slate-700 hover:text-slate-900 touch-manipulation"
                              style={{ touchAction: 'manipulation' }}
                            >
                              Önceki
                            </Button>
                          </Link>
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                            if (pageNum > totalPages) return null;
                            const isActive = currentPage === pageNum;
                            return (
                              <Link key={pageNum} href={buildUrl(pageNum)} prefetch={!isActive && Math.abs(pageNum - currentPage) <= 1}>
                                <Button 
                                  variant={isActive ? 'default' : 'outline'}
                                  className={cn(
                                    "h-12 w-12 min-h-[48px] min-w-[48px] rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200 touch-manipulation",
                                    isActive 
                                      ? "bg-[#006AFF] text-white shadow-lg hover:shadow-xl hover:bg-[#0052CC] active:scale-95 border-0" 
                                      : "hover:bg-slate-50 active:scale-95 hover:border-[#006AFF]/40 border-slate-300 text-slate-700 hover:text-slate-900"
                                  )}
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  {pageNum}
                                </Button>
                              </Link>
                            );
                          })}
                          <Link href={buildUrl(currentPage + 1)} prefetch={currentPage < totalPages}>
                            <Button 
                              variant="outline" 
                              disabled={currentPage >= totalPages}
                              className="h-12 min-h-[48px] px-5 rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 text-slate-700 hover:text-slate-900 touch-manipulation"
                              style={{ touchAction: 'manipulation' }}
                            >
                              Sonraki
                            </Button>
                          </Link>
                        </Fragment>
                      );
                    })()}
                  </div>
                </div>
              )}
          </div>
        </div>
        </div>
      </PullToRefresh>

      {/* Quick View Modal */}
      <QuickViewModal
        listing={quickViewListing}
        isOpen={!!quickViewListing}
        onClose={() => setQuickViewListing(null)}
        basePath={basePath}
      />
    </Fragment>
  );
}

