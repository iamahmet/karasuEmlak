"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, MapPin, Bed, Bath, Square } from 'lucide-react';
import { CardImage } from '@/components/images';
import { LoadingState } from '@/components/ui/LoadingState';
import { cn } from '@karasu/lib';

interface Listing {
  id: string;
  slug: string;
  title: string;
  price_amount: number;
  status: 'satilik' | 'kiralik';
  property_type: string;
  location_neighborhood: string;
  features: {
    rooms?: number;
    bathrooms?: number;
    sizeM2?: number;
  };
  images?: Array<{
    public_id?: string;
    url?: string;
    alt?: string;
  }>;
}

interface PropertyRecommendationsProps {
  currentListingId: string;
  propertyType: string;
  status: 'satilik' | 'kiralik';
  neighborhood: string;
  priceRange?: { min: number; max: number };
  basePath?: string;
  className?: string;
}

export function PropertyRecommendations({
  currentListingId,
  propertyType,
  status,
  neighborhood,
  priceRange,
  basePath = '',
  className,
}: PropertyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    // For now, use mock data
    const mockRecommendations: Listing[] = [
      {
        id: 'rec-1',
        slug: 'sahil-satilik-3-1-daire',
        title: 'Denize Yakın 3+1 Daire',
        price_amount: 2850000,
        status: status,
        property_type: propertyType,
        location_neighborhood: neighborhood,
        features: { rooms: 3, bathrooms: 1, sizeM2: 125 },
        images: [{ url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop' }],
      },
      {
        id: 'rec-2',
        slug: 'merkez-satilik-2-1-daire',
        title: 'Merkezi Konum 2+1 Daire',
        price_amount: 2150000,
        status: status,
        property_type: propertyType,
        location_neighborhood: 'Merkez',
        features: { rooms: 2, bathrooms: 1, sizeM2: 95 },
        images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' }],
      },
      {
        id: 'rec-3',
        slug: 'camlik-satilik-4-1-villa',
        title: 'Müstakil Bahçeli Villa',
        price_amount: 4500000,
        status: status,
        property_type: 'villa',
        location_neighborhood: 'Çamlık',
        features: { rooms: 4, bathrooms: 2, sizeM2: 220 },
        images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop' }],
      },
    ].filter(rec => rec.id !== currentListingId);

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 500);
  }, [currentListingId, propertyType, status, neighborhood, priceRange]);

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <LoadingState variant="skeleton" skeletonCount={3} />
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
          <Sparkles className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Size Özel Öneriler</h3>
          <p className="text-sm text-gray-600">Beğeneceğinizi düşündüklerimiz</p>
        </div>
      </div>

      <div className="grid gap-4">
        {recommendations.map((listing) => (
          <Link
            key={listing.id}
            href={`${basePath}/ilan/${listing.slug}`}
            className="group flex gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200"
          >
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
              {listing.images?.[0]?.url ? (
                <img
                  src={listing.images[0].url}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1 mb-1">
                {listing.title}
              </h4>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>{listing.location_neighborhood}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                {listing.features.rooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    {listing.features.rooms}
                  </span>
                )}
                {listing.features.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    {listing.features.bathrooms}
                  </span>
                )}
                {listing.features.sizeM2 && (
                  <span className="flex items-center gap-1">
                    <Square className="h-3.5 w-3.5" />
                    {listing.features.sizeM2} m²
                  </span>
                )}
              </div>
              <div className="text-lg font-bold text-indigo-600">
                ₺{new Intl.NumberFormat('tr-TR').format(listing.price_amount)}
                {listing.status === 'kiralik' && <span className="text-sm text-gray-500 font-normal">/ay</span>}
              </div>
            </div>

            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 text-center">
        <Link
          href={`${basePath}/${status}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Tüm İlanları Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default PropertyRecommendations;

