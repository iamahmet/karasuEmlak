'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getComparisonProperties, removeFromComparison } from '@/lib/comparison';
import { ThumbnailImage } from '@/components/images';
import { X, Scale } from 'lucide-react';
import type { Listing } from '@/lib/supabase/queries';

interface ComparisonTableProps {
  allListings: Listing[];
  basePath?: string;
}


export function ComparisonTable({ allListings, basePath = '' }: ComparisonTableProps) {
  const [comparisonListings, setComparisonListings] = useState<Listing[]>([]);

  useEffect(() => {
    function loadComparison() {
      const listings = getComparisonProperties(allListings);
      setComparisonListings(listings);
    }

    loadComparison();

    window.addEventListener('comparison-updated', loadComparison);
    window.addEventListener('storage', loadComparison);

    return () => {
      window.removeEventListener('comparison-updated', loadComparison);
      window.removeEventListener('storage', loadComparison);
    };
  }, [allListings]);

  const handleRemove = (listingId: string) => {
    removeFromComparison(listingId);
    setComparisonListings(prev => prev.filter(l => l.id !== listingId));
  };

  if (comparisonListings.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/50 rounded-lg border">
        <Scale className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Karşılaştırma listesi boş</h3>
        <p className="text-muted-foreground mb-6">
          İlan kartlarındaki karşılaştırma butonuna tıklayarak ilanları ekleyebilirsiniz.
        </p>
        <Link href={`${basePath}/satilik`}>
          <Button>İlanları Görüntüle</Button>
        </Link>
      </div>
    );
  }

  // Get all unique features for comparison
  const allFeatures = new Set<string>();
  comparisonListings.forEach(listing => {
    if (listing.features) {
      Object.keys(listing.features).forEach(key => allFeatures.add(key));
    }
  });

  const featureKeys = Array.from(allFeatures);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-border bg-background rounded-lg border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Özellik
              </th>
              {comparisonListings.map((listing) => (
                <th key={listing.id} scope="col" className="px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider relative min-w-[200px]">
                  <button
                    onClick={() => handleRemove(listing.id)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link href={`${basePath}/ilan/${listing.slug}`} className="block hover:opacity-80 transition-opacity">
                    <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden bg-muted">
                      {listing.images?.[0] ? (
                        <ThumbnailImage
                          publicId={listing.images[0].public_id || listing.images[0].url}
                          alt={listing.images[0].alt || listing.title}
                          className="w-full h-full object-cover"
                          sizes="200px"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Görsel yok</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{listing.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {listing.location_neighborhood}, {listing.location_district}
                    </p>
                    {listing.price_amount && (
                      <p className="text-lg font-bold text-primary">
                        ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                        {listing.status === 'kiralik' && <span className="text-xs text-muted-foreground">/ay</span>}
                      </p>
                    )}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Status */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">Durum</td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    listing.status === 'satilik' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Property Type */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">Emlak Tipi</td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-4 py-3 text-sm capitalize">
                  {listing.property_type}
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">Konum</td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-4 py-3 text-sm">
                  {listing.location_neighborhood}, {listing.location_district}
                </td>
              ))}
            </tr>

            {/* Features */}
            {featureKeys.map((featureKey) => {
              const featureLabel: Record<string, string> = {
                rooms: 'Oda Sayısı',
                bathrooms: 'Banyo Sayısı',
                sizeM2: 'Metrekare',
                floor: 'Kat',
                buildingAge: 'Bina Yaşı',
                heating: 'Isıtma',
                furnished: 'Eşyalı',
                balcony: 'Balkon',
                parking: 'Otopark',
                elevator: 'Asansör',
                seaView: 'Deniz Manzarası',
              };

              return (
                <tr key={featureKey}>
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    {featureLabel[featureKey] || featureKey}
                  </td>
                  {comparisonListings.map((listing) => {
                    const value = listing.features?.[featureKey as keyof typeof listing.features];
                    return (
                      <td key={listing.id} className="px-4 py-3 text-sm">
                        {typeof value === 'boolean' ? (value ? 'Var' : 'Yok') : value || '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

