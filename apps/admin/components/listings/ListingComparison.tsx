"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  DollarSign,
  Ruler,
  Eye,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import { formatCurrency } from "@karasu/lib/utils";

interface ListingComparisonProps {
  currentListing: {
    title: string;
    price_amount: number | null;
    area_sqm?: number;
    room_count?: number;
    images: string[];
    views?: number;
  };
  similarListings: Array<{
    id: string;
    title: string;
    price_amount: number;
    area_sqm: number;
    room_count: number;
    images: string[];
    views: number;
  }>;
  className?: string;
}

export function ListingComparison({ currentListing, similarListings, className }: ListingComparisonProps) {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selected = similarListings.find(l => l.id === selectedListing);

  const getComparison = (field: string, current: any, compare: any) => {
    if (field === "price") {
      const diff = current - compare;
      const percent = ((diff / compare) * 100).toFixed(1);
      return { diff, percent, better: diff < 0 };
    }
    if (field === "area") {
      const diff = (current || 0) - compare;
      const percent = ((diff / compare) * 100).toFixed(1);
      return { diff, percent, better: diff > 0 };
    }
    if (field === "views") {
      const diff = (current || 0) - compare;
      const percent = ((diff / compare) * 100).toFixed(1);
      return { diff, percent, better: diff > 0 };
    }
    return { diff: 0, percent: "0", better: false };
  };

  if (similarListings.length === 0) {
    return (
      <Card className={cn("card-professional", className)}>
        <CardContent className="text-center py-8">
          <p className="text-sm text-design-gray dark:text-gray-400">
            Karşılaştırma için benzer ilan bulunamadı
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          İlan Karşılaştırması
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select Listing */}
        <div>
          <label className="text-xs font-semibold text-design-gray dark:text-gray-400 mb-2 block">
            Karşılaştırılacak İlan
          </label>
          <div className="grid grid-cols-1 gap-2">
            {similarListings.slice(0, 3).map((listing) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => setSelectedListing(listing.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  selectedListing === listing.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-design-dark dark:text-white mb-1">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-design-gray dark:text-gray-400">
                      <span>{formatCurrency(listing.price_amount)}</span>
                      <span>{listing.area_sqm} m²</span>
                      <span>{listing.room_count}+1</span>
                    </div>
                  </div>
                  {selectedListing === listing.id && (
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selected && currentListing.price_amount && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">
                Detaylı Karşılaştırma
              </h4>
              <div className="space-y-3">
                {/* Price Comparison */}
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0a3d35]">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold">Fiyat</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-design-gray dark:text-gray-400">
                      {formatCurrency(currentListing.price_amount)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-design-gray dark:text-gray-400">
                      {formatCurrency(selected.price_amount)}
                    </span>
                    {(() => {
                      const comp = getComparison("price", currentListing.price_amount, selected.price_amount);
                      return (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            comp.better
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                          )}
                        >
                          {comp.better ? (
                            <TrendingDown className="h-3 w-3 mr-1 inline" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1 inline" />
                          )}
                          %{comp.percent}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>

                {/* Area Comparison */}
                {currentListing.area_sqm && (
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0a3d35]">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold">Alan</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-design-gray dark:text-gray-400">
                        {currentListing.area_sqm} m²
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-design-gray dark:text-gray-400">
                        {selected.area_sqm} m²
                      </span>
                      {(() => {
                        const comp = getComparison("area", currentListing.area_sqm, selected.area_sqm);
                        return (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              comp.better
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                            )}
                          >
                            {comp.better ? (
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                            )}
                            %{comp.percent}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Views Comparison */}
                {currentListing.views !== undefined && (
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0a3d35]">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-semibold">Görüntülenme</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-design-gray dark:text-gray-400">
                        {currentListing.views.toLocaleString()}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-design-gray dark:text-gray-400">
                        {selected.views.toLocaleString()}
                      </span>
                      {(() => {
                        const comp = getComparison("views", currentListing.views, selected.views);
                        return (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              comp.better
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                            )}
                          >
                            {comp.better ? (
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                            )}
                            %{comp.percent}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Images Comparison */}
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0a3d35]">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-semibold">Fotoğraf</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-design-gray dark:text-gray-400">
                      {currentListing.images.length}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-design-gray dark:text-gray-400">
                      {selected.images.length}
                    </span>
                    {currentListing.images.length < selected.images.length && (
                      <Badge variant="outline" className="text-[10px] bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300">
                        <XCircle className="h-3 w-3 mr-1 inline" />
                        Daha az
                      </Badge>
                    )}
                    {currentListing.images.length >= selected.images.length && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        Yeterli
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Öneriler
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                {currentListing.price_amount > selected.price_amount && (
                  <li>• Fiyatınız rakip ilandan yüksek, gözden geçirin</li>
                )}
                {currentListing.images.length < selected.images.length && (
                  <li>• Daha fazla fotoğraf ekleyin (en az {selected.images.length} önerilir)</li>
                )}
                {currentListing.views !== undefined && currentListing.views < selected.views && (
                  <li>• Görüntülenme sayınız düşük, SEO'yu iyileştirin</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {!selected && (
          <div className="text-center py-8">
            <p className="text-sm text-design-gray dark:text-gray-400">
              Karşılaştırma yapmak için bir ilan seçin
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
