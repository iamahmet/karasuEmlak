"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import {
  Home,
  MapPin,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import { formatCurrency } from "@karasu/lib/utils";

interface SimilarListing {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  location_neighborhood: string;
  area_sqm: number;
  room_count: number;
  images: string[];
  views: number;
  published_at: string;
  priceDifference: number;
  similarity: number;
}

interface SimilarListingsProps {
  listing: {
    property_type: string;
    location_neighborhood: string;
    price_amount: number | null;
    area_sqm?: number;
    room_count?: number;
  };
  onSelect?: (listingId: string) => void;
  className?: string;
}

export function SimilarListings({ listing, onSelect, className }: SimilarListingsProps) {
  const [loading, setLoading] = useState(true);
  const [similarListings, setSimilarListings] = useState<SimilarListing[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchSimilarListings();
  }, [listing]);

  const fetchSimilarListings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data - in production, fetch from API
      const mockListings: SimilarListing[] = [
        {
          id: "1",
          title: "Denize Sıfır 3+1 Daire",
          price_amount: 1850000,
          price_currency: "TRY",
          location_neighborhood: listing.location_neighborhood,
          area_sqm: listing.area_sqm || 120,
          room_count: listing.room_count || 3,
          images: [],
          views: 342,
          published_at: "2024-01-15",
          priceDifference: 150000,
          similarity: 0.92,
        },
        {
          id: "2",
          title: "Merkez Konumda 3+1 Daire",
          price_amount: 1650000,
          price_currency: "TRY",
          location_neighborhood: listing.location_neighborhood,
          area_sqm: (listing.area_sqm || 120) - 10,
          room_count: listing.room_count || 3,
          images: [],
          views: 287,
          published_at: "2024-01-20",
          priceDifference: -50000,
          similarity: 0.88,
        },
        {
          id: "3",
          title: "Geniş 3+1 Daire, Deniz Manzaralı",
          price_amount: 1950000,
          price_currency: "TRY",
          location_neighborhood: listing.location_neighborhood,
          area_sqm: (listing.area_sqm || 120) + 15,
          room_count: listing.room_count || 3,
          images: [],
          views: 456,
          published_at: "2024-01-10",
          priceDifference: 250000,
          similarity: 0.85,
        },
      ];

      setSimilarListings(mockListings);
    } catch (error) {
      console.error("Similar listings fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedListings = showAll ? similarListings : similarListings.slice(0, 3);

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Benzer İlanlar
          </CardTitle>
          {similarListings.length > 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="h-7 px-2 text-xs"
            >
              {showAll ? "Daha Az Göster" : `+${similarListings.length - 3} Daha Fazla`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-design-light" />
          </div>
        ) : similarListings.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-design-gray dark:text-gray-400">
              Benzer ilan bulunamadı
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedListings.map((similar) => (
              <div
                key={similar.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-design-light hover:bg-design-light/5 transition-all cursor-pointer group"
                onClick={() => onSelect?.(similar.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-design-dark dark:text-white group-hover:text-design-light transition-colors">
                        {similar.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          similar.similarity >= 0.9
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                            : similar.similarity >= 0.8
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
                            : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        %{Math.round(similar.similarity * 100)} benzer
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-design-gray dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {similar.location_neighborhood}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {similar.area_sqm} m²
                      </span>
                      <span>{similar.room_count}+1</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-design-dark dark:text-white">
                          {formatCurrency(similar.price_amount)}
                        </span>
                        {similar.priceDifference !== 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              similar.priceDifference > 0
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                            )}
                          >
                            {similar.priceDifference > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                            )}
                            {Math.abs(similar.priceDifference).toLocaleString("tr-TR")} TRY
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-design-gray dark:text-gray-400">
                      <Eye className="h-3 w-3" />
                      {similar.views}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/listings/${similar.id}`, "_blank");
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
