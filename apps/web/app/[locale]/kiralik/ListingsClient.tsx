"use client";

import { useState, Fragment } from 'react';
import { Button, Grid as GridComponent } from '@karasu/ui';
import { Grid, List, MapPin, Square, Home, Building2, Map, Info, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { CardImage, ListingImage } from '@/components/images';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { ListingSort } from '@/components/listings/ListingSort';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [quickViewListing, setQuickViewListing] = useState<Listing | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const limit = 18;
  const totalPages = Math.ceil(total / limit);

  return (
    <Fragment>
      <MobileFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        neighborhoods={neighborhoods}
      />
      <div className="min-h-screen bg-white pb-20 md:pb-0">
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
                onClick={() => setFiltersOpen(true)}
                className="w-full h-12 rounded-xl font-semibold bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-[#006AFF]/40 flex items-center justify-center gap-2 shadow-sm"
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
          
          {/* Toolbar - Corporate Style */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 lg:mb-10">
            <div className="flex items-center gap-3">
              <ListingSort />
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    setViewMode('grid');
                    trackViewModeChange('grid');
                  }}
                  className="h-9 w-9"
                  aria-label="Grid görünümü"
                  title="Grid görünümü"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    setViewMode('list');
                    trackViewModeChange('list');
                  }}
                  className="h-9 w-9"
                  aria-label="Liste görünümü"
                  title="Liste görünümü"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => {
                    setViewMode('map');
                    trackViewModeChange('map');
                  }}
                  className="h-9 w-9"
                  aria-label="Harita görünümü"
                  title="Harita görünümü"
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
                      status: l.status || 'kiralik',
                      property_type: l.property_type || '',
                      images: l.images || [],
                      features: l.features || {},
                    }))}
                    basePath={basePath}
                    height="600px"
                  />
                </div>
              ) : viewMode === 'grid' ? (
                <GridComponent variant="default" className="gap-6 lg:gap-8">
                  {listings.map((listing) => {
                    const mainImage = listing.images?.[0];
                    return (
                      <div key={listing.id} className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm">
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
                                alt={listing.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                loading="lazy"
                              />
                            )}
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {/* Status Badge - Apple Quality */}
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-[#00A862]/90 text-white px-3 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg">
                                Kiralık
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
                                <p className="text-2xl font-bold text-[#00A862] tracking-tight">
                                  ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}/ay
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Clickable Link Overlay - Base layer */}
                          <Link 
                            href={`${basePath}/ilan/${listing.slug}`}
                            className="absolute inset-0 z-10"
                            aria-label={`${listing.title} - ${listing.location_neighborhood}, ${listing.location_district}`}
                            onClick={() => trackListingClick(listing.id, listing.title, 'card')}
                            prefetch={true}
                          />
                          {/* Quick View Button - Above link, clickable */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 z-20 pointer-events-none">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewListing(listing);
                                trackQuickView(listing.id, listing.title);
                              }}
                              className="gap-2 bg-white text-slate-900 hover:bg-slate-50 shadow-lg pointer-events-auto"
                              size="lg"
                            >
                              <Eye className="h-4 w-4" />
                              Hızlı Görüntüle
                            </Button>
                          </div>
                        </div>
                    );
                  })}
                </GridComponent>
              ) : (
                <div className="space-y-6">
                  {listings.map((listing) => {
                    const mainImage = listing.images?.[0];
                    const imageAlt = mainImage?.alt || generatePropertyImageAlt({
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
                    }, listing.title);
                    
                    return (
                      <Link key={listing.id} href={`${basePath}/ilan/${listing.slug}`} prefetch={true}>
                        <div className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 flex flex-col md:flex-row shadow-sm">
                          <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative flex-shrink-0 overflow-hidden">
                            {mainImage?.public_id || mainImage?.url ? (
                              mainImage.url ? (
                                <img
                                  src={mainImage.url}
                                  alt={imageAlt}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              ) : (
                                <ListingImage
                                  publicId={mainImage.public_id!}
                                  alt={imageAlt}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 768px) 100vw, 256px"
                                  fallback={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                                />
                              )
                            ) : (
                              <img
                                src={getPropertyPlaceholder(listing.property_type, listing.status, listing.location_neighborhood, 800, 600)}
                                alt={listing.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-[#00A862]/90 text-white px-3 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg">
                                Kiralık
                              </div>
                            </div>
                            {listing.featured && (
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-lg text-[13px] font-semibold tracking-[-0.01em] backdrop-blur-sm shadow-lg z-10">
                                ⭐ Öne Çıkan
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex-1">
                            <div className="mb-3">
                              <SocialProofBadges listing={listing} className="mb-2" />
                              <h3 className="font-semibold text-lg text-slate-900 group-hover:text-[#006AFF] transition-colors mb-2">
                                {listing.title}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                              {listing.location_neighborhood}, {listing.location_district}
                            </p>
                            {listing.features.sizeM2 && (
                              <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                <span className="flex items-center gap-1.5 font-semibold">
                                  <Square className="h-4 w-4 text-slate-400" />
                                  {listing.features.sizeM2} m²
                                </span>
                                {listing.features.rooms && (
                                  <span className="flex items-center gap-1.5 font-semibold">
                                    <Home className="h-4 w-4 text-slate-400" />
                                    {listing.features.rooms} Oda
                                  </span>
                                )}
                                {listing.features.bathrooms && (
                                  <span className="font-semibold">{listing.features.bathrooms} Banyo</span>
                                )}
                              </div>
                            )}
                            {listing.description_short && (
                              <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                {listing.description_short}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              {listing.price_amount && (
                                <p className="text-2xl font-bold text-[#00A862] tracking-tight">
                                  ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}/ay
                                </p>
                              )}
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setQuickViewListing(listing);
                                  trackQuickView(listing.id, listing.title);
                                }}
                                variant="outline"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Hızlı Görüntüle
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination - Corporate Style */}
              {totalPages > 1 && (
                <div className="mt-12 lg:mt-16 flex justify-center">
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
                        return `${basePath}/kiralik${queryString ? `?${queryString}` : ''}`;
                      };

                      return (
                        <Fragment key="pagination">
                          <Link href={buildUrl(currentPage - 1)} prefetch={currentPage > 1}>
                            <Button 
                              variant="outline" 
                              disabled={currentPage === 1}
                              className="h-10 px-5 rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 text-slate-700 hover:text-slate-900"
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
                                    "h-10 w-10 rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200",
                                    isActive 
                                      ? "bg-[#006AFF] text-white shadow-lg hover:shadow-xl hover:bg-[#0052CC] active:scale-95 border-0" 
                                      : "hover:bg-slate-50 active:scale-95 hover:border-[#006AFF]/40 border-slate-300 text-slate-700 hover:text-slate-900"
                                  )}
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
                              className="h-10 px-5 rounded-lg text-[15px] font-semibold tracking-tight transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 text-slate-700 hover:text-slate-900"
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
            </Fragment>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={Building2}
                title="Aradığınız kriterlere uygun ilan bulunamadı"
                description="Şu anda aradığınız kriterlere uygun kiralık ilan bulunmuyor. Filtreleri değiştirerek veya arama kriterlerinizi genişleterek tekrar deneyebilirsiniz."
                action={{
                  label: "Tüm İlanları Gör",
                  onClick: () => {
                    window.location.href = `${basePath}/kiralik`;
                  },
                  variant: "default",
                }}
              />
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        listing={quickViewListing}
        isOpen={!!quickViewListing}
        onClose={() => setQuickViewListing(null)}
        basePath={basePath}
      />
    </div>
    </Fragment>
  );
}
