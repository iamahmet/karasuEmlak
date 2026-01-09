'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites } from '@/lib/favorites';
import { Button } from '@karasu/ui';
import { Heart, Home, Building2 } from 'lucide-react';
import { ListingImage } from '@/components/images';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Listing } from '@/lib/supabase/queries';

interface FavoritesClientProps {
  allListings: Listing[];
  basePath?: string;
}

export function FavoritesClient({ allListings, basePath = '' }: FavoritesClientProps) {
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true);
      try {
        const favoriteIds = await getFavorites();
        const favorites = allListings.filter(listing => favoriteIds.includes(listing.id));
        setFavoriteListings(favorites);
        setIsEmpty(favorites.length === 0);
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setIsEmpty(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [allListings]);

  // Refresh favorites when storage changes
  useEffect(() => {
    const handleStorageChange = async () => {
      const favoriteIds = await getFavorites();
      const favorites = allListings.filter(listing => favoriteIds.includes(listing.id));
      setFavoriteListings(favorites);
      setIsEmpty(favorites.length === 0);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favorites-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-updated', handleStorageChange);
    };
  }, [allListings]);

  if (isLoading) {
    return (
      <LoadingState
        message="Favoriler yükleniyor..."
        variant="skeleton"
        skeletonCount={6}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Heart}
        title="Henüz favori ilanınız yok"
        description="Beğendiğiniz ilanların kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz."
        action={{
          label: "Satılık İlanları Gör",
          onClick: () => {
            window.location.href = `${basePath}/satilik`;
          },
          variant: "default",
        }}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold mb-2">Favori İlanlarım</h2>
            <p className="text-muted-foreground">
              {favoriteListings.length} ilan favorilerinizde
            </p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteListings.map((listing) => {
          const mainImage = listing.images?.[0];
          
          return (
            <Link key={listing.id} href={`${basePath}/ilan/${listing.slug}`}>
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-muted relative">
                  {mainImage ? (
                    <ListingImage
                      publicId={mainImage.public_id}
                      alt={mainImage.alt || listing.title}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Görsel yok</span>
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    listing.status === 'satilik' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.location_neighborhood}, {listing.location_district}
                  </p>
                  {listing.features.sizeM2 && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {listing.features.sizeM2} m²
                      {listing.features.rooms && ` • ${listing.features.rooms} Oda`}
                    </p>
                  )}
                  {listing.price_amount && (
                    <p className="text-lg font-bold text-primary">
                      {listing.status === 'satilik' ? '₺' : '₺/ay '}
                      {new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA Section */}
      {favoriteListings.length > 0 && (
        <div className="mt-12 text-center bg-muted/50 rounded-lg p-8 border">
          <h3 className="text-2xl font-semibold mb-2">Daha fazla ilan görmek ister misiniz?</h3>
          <p className="text-muted-foreground mb-6">
            Karasu'da satılık ve kiralık geniş emlak seçeneklerimizi keşfedin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`${basePath}/satilik`}>
              <Button>
                Satılık İlanlar
              </Button>
            </Link>
            <Link href={`${basePath}/kiralik`}>
              <Button variant="outline">
                Kiralık İlanlar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

