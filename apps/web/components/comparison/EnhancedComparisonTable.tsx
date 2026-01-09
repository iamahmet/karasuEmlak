'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getComparisonProperties, removeFromComparison, clearComparison } from '@/lib/comparison';
import { ThumbnailImage } from '@/components/images';
import { generateComparisonImageAlt } from '@/lib/seo/image-alt-generator';
import { 
  X, 
  Scale, 
  Download, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  MapPin,
  Home,
  Square,
  Bed,
  Bath,
  Building2,
  CheckCircle2,
  XCircle,
  Star,
  Image as ImageIcon,
  Phone,
  Mail,
  MessageCircle,
  Printer,
} from 'lucide-react';
import { cn } from '@karasu/lib';
import type { Listing } from '@/lib/supabase/queries';
import { toast } from 'sonner';

interface EnhancedComparisonTableProps {
  allListings: Listing[];
  basePath?: string;
}

interface ComparisonStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  minSize: number;
  maxSize: number;
  avgSize: number;
  bestValue: Listing | null; // Best price per m²
}

export function EnhancedComparisonTable({ allListings, basePath = '' }: EnhancedComparisonTableProps) {
  const [comparisonListings, setComparisonListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  useEffect(() => {
    function loadComparison() {
      const listings = getComparisonProperties(allListings);
      setComparisonListings(listings);
      calculateStats(listings);
    }

    loadComparison();

    window.addEventListener('comparison-updated', loadComparison);
    window.addEventListener('storage', loadComparison);

    return () => {
      window.removeEventListener('comparison-updated', loadComparison);
      window.removeEventListener('storage', loadComparison);
    };
  }, [allListings]);

  const calculateStats = (listings: Listing[]) => {
    if (listings.length === 0) {
      setStats(null);
      return;
    }

    const prices = listings
      .map(l => Number(l.price_amount) || 0)
      .filter(p => p > 0);
    
    const sizes = listings
      .map(l => Number(l.features?.sizeM2) || 0)
      .filter(s => s > 0);

    const pricePerM2 = listings
      .map(l => {
        const price = Number(l.price_amount) || 0;
        const size = Number(l.features?.sizeM2) || 0;
        return size > 0 ? price / size : 0;
      })
      .filter(p => p > 0);

    const bestValueListing = listings.reduce((best, current) => {
      const bestPrice = Number(best.price_amount) || 0;
      const bestSize = Number(best.features?.sizeM2) || 0;
      const currentPrice = Number(current.price_amount) || 0;
      const currentSize = Number(current.features?.sizeM2) || 0;
      
      const bestRatio = bestSize > 0 ? bestPrice / bestSize : Infinity;
      const currentRatio = currentSize > 0 ? currentPrice / currentSize : Infinity;
      
      return currentRatio < bestRatio ? current : best;
    }, listings[0]);

    setStats({
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      minSize: Math.min(...sizes),
      maxSize: Math.max(...sizes),
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      bestValue: bestValueListing,
    });
  };

  const handleRemove = (listingId: string) => {
    removeFromComparison(listingId);
    setComparisonListings(prev => prev.filter(l => l.id !== listingId));
    toast.success('İlan karşılaştırmadan kaldırıldı');
  };

  const handleClear = () => {
    clearComparison();
    setComparisonListings([]);
    setStats(null);
    toast.info('Karşılaştırma listesi temizlendi');
  };

  const handleShare = async () => {
    const comparisonIds = comparisonListings.map(l => l.id).join(',');
    const shareUrl = `${window.location.origin}${basePath}/karsilastir?ids=${comparisonIds}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emlak Karşılaştırması',
          text: `${comparisonListings.length} ilanı karşılaştırıyorum`,
          url: shareUrl,
        });
        toast.success('Karşılaştırma paylaşıldı');
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Karşılaştırma linki kopyalandı');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV data
    const headers = ['Özellik', ...comparisonListings.map(l => l.title)];
    const rows: string[][] = [
      ['Fiyat', ...comparisonListings.map(l => 
        l.price_amount ? `₺${new Intl.NumberFormat('tr-TR').format(Number(l.price_amount))}` : '-'
      )],
      ['Metrekare', ...comparisonListings.map(l => 
        l.features?.sizeM2 ? `${l.features.sizeM2} m²` : '-'
      )],
      ['Oda Sayısı', ...comparisonListings.map(l => 
        l.features?.rooms ? `${l.features.rooms}` : '-'
      )],
      ['Banyo', ...comparisonListings.map(l => 
        l.features?.bathrooms ? `${l.features.bathrooms}` : '-'
      )],
      ['Konum', ...comparisonListings.map(l => 
        `${l.location_neighborhood}, ${l.location_district}`
      )],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emlak-karsilastirma-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Karşılaştırma CSV olarak indirildi');
  };

  const getPricePerM2 = (listing: Listing): number => {
    const price = Number(listing.price_amount) || 0;
    const size = Number(listing.features?.sizeM2) || 0;
    return size > 0 ? price / size : 0;
  };

  const getBestValue = (field: 'price' | 'size' | 'pricePerM2'): Listing | null => {
    if (comparisonListings.length === 0) return null;

    if (field === 'price') {
      return comparisonListings.reduce((best, current) => {
        const bestPrice = Number(best.price_amount) || Infinity;
        const currentPrice = Number(current.price_amount) || Infinity;
        return currentPrice < bestPrice ? current : best;
      });
    }

    if (field === 'size') {
      return comparisonListings.reduce((best, current) => {
        const bestSize = Number(best.features?.sizeM2) || 0;
        const currentSize = Number(current.features?.sizeM2) || 0;
        return currentSize > bestSize ? current : best;
      });
    }

    if (field === 'pricePerM2') {
      return comparisonListings.reduce((best, current) => {
        const bestRatio = getPricePerM2(best);
        const currentRatio = getPricePerM2(current);
        return currentRatio < bestRatio && currentRatio > 0 ? current : best;
      });
    }

    return null;
  };

  if (comparisonListings.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200">
        <Scale className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Karşılaştırma listesi boş</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          İlan kartlarındaki karşılaştırma butonuna tıklayarak ilanları ekleyebilirsiniz (maksimum 4 ilan).
        </p>
        <Link href={`${basePath}/satilik`}>
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            İlanları Görüntüle
          </Button>
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
  const bestPriceListing = getBestValue('price');
  const bestSizeListing = getBestValue('size');
  const bestValueListing = getBestValue('pricePerM2');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {comparisonListings.length} İlan Karşılaştırması
            </h2>
            <p className="text-sm text-slate-600">
              İlanları yan yana karşılaştırın ve en uygun seçeneği bulun
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Paylaş
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Yazdır
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            İndir (CSV)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Temizle
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-slate-600">Fiyat Aralığı</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ₺{new Intl.NumberFormat('tr-TR').format(stats.minPrice)} - ₺{new Intl.NumberFormat('tr-TR').format(stats.maxPrice)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Ortalama: ₺{new Intl.NumberFormat('tr-TR').format(stats.avgPrice)}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Square className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Metrekare Aralığı</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.minSize} - {stats.maxSize} m²
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Ortalama: {Math.round(stats.avgSize)} m²
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-slate-600">En İyi Değer</span>
            </div>
            {stats.bestValue && (
              <div className="text-sm">
                <div className="font-semibold text-slate-900 line-clamp-1">
                  {stats.bestValue.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  ₺{new Intl.NumberFormat('tr-TR').format(Math.round(getPricePerM2(stats.bestValue)))} / m²
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider sticky left-0 bg-inherit z-10">
                Özellik
              </th>
              {comparisonListings.map((listing, index) => (
                <th 
                  key={listing.id} 
                  scope="col" 
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider relative min-w-[280px]",
                    bestPriceListing?.id === listing.id && "bg-green-50/50",
                    bestValueListing?.id === listing.id && "bg-amber-50/50"
                  )}
                >
                  <button
                    onClick={() => handleRemove(listing.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <Link 
                    href={`${basePath}/ilan/${listing.slug}`} 
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {listing.images?.[0] ? (
                        <ThumbnailImage
                          publicId={listing.images[0].public_id}
                          alt={listing.images[0].alt || generateComparisonImageAlt(listing.title, listing.location_neighborhood)}
                          className="w-full h-full object-cover"
                          sizes="280px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {bestPriceListing?.id === listing.id && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          En Ucuz
                        </div>
                      )}
                      {bestValueListing?.id === listing.id && (
                        <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          En İyi Değer
                        </div>
                      )}
                      {listing.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          ⭐ Öne Çıkan
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-base mb-1 line-clamp-2 text-slate-900 hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location_neighborhood}, {listing.location_district}
                    </p>
                    {listing.price_amount && (
                      <p className="text-xl font-bold text-blue-600 mb-2">
                        ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                        {listing.status === 'kiralik' && (
                          <span className="text-xs text-slate-500 font-normal">/ay</span>
                        )}
                      </p>
                    )}
                    {getPricePerM2(listing) > 0 && (
                      <p className="text-xs text-slate-500">
                        ₺{new Intl.NumberFormat('tr-TR').format(Math.round(getPricePerM2(listing)))} / m²
                      </p>
                    )}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {/* Basic Info Rows */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                Durum
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    listing.status === 'satilik' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  )}>
                    {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                Emlak Tipi
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm capitalize font-medium">
                  {listing.property_type}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                Konum
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-700">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {listing.location_neighborhood}, {listing.location_district}
                  </div>
                </td>
              ))}
            </tr>

            {/* Price Row - Highlighted */}
            <tr 
              className="hover:bg-blue-50/30 transition-colors bg-blue-50/20"
              onMouseEnter={() => setHighlightedField('price')}
              onMouseLeave={() => setHighlightedField(null)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50 sticky left-0 z-10 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Fiyat
              </td>
              {comparisonListings.map((listing) => {
                const price = Number(listing.price_amount) || 0;
                const isBest = bestPriceListing?.id === listing.id;
                return (
                  <td 
                    key={listing.id} 
                    className={cn(
                      "px-6 py-4 text-sm font-bold",
                      isBest && "bg-green-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-blue-600">
                        ₺{new Intl.NumberFormat('tr-TR').format(price)}
                      </span>
                      {isBest && (
                        <Award className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {listing.status === 'kiralik' && (
                      <span className="text-xs text-slate-500">/ay</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Size Row */}
            <tr 
              className="hover:bg-slate-50/50 transition-colors"
              onMouseEnter={() => setHighlightedField('size')}
              onMouseLeave={() => setHighlightedField(null)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10 flex items-center gap-2">
                <Square className="h-4 w-4 text-slate-600" />
                Metrekare
              </td>
              {comparisonListings.map((listing) => {
                const size = Number(listing.features?.sizeM2) || 0;
                const isBest = bestSizeListing?.id === listing.id;
                return (
                  <td 
                    key={listing.id} 
                    className={cn(
                      "px-6 py-4 text-sm font-semibold",
                      isBest && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base text-slate-900">
                        {size > 0 ? `${size} m²` : '-'}
                      </span>
                      {isBest && (
                        <Award className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Price per m² Row */}
            <tr 
              className="hover:bg-amber-50/30 transition-colors bg-amber-50/10"
              onMouseEnter={() => setHighlightedField('pricePerM2')}
              onMouseLeave={() => setHighlightedField(null)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-amber-50/50 sticky left-0 z-10 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                m² Başına Fiyat
              </td>
              {comparisonListings.map((listing) => {
                const pricePerM2 = getPricePerM2(listing);
                const isBest = bestValueListing?.id === listing.id;
                return (
                  <td 
                    key={listing.id} 
                    className={cn(
                      "px-6 py-4 text-sm font-semibold",
                      isBest && "bg-amber-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base text-amber-700">
                        {pricePerM2 > 0 ? `₺${new Intl.NumberFormat('tr-TR').format(Math.round(pricePerM2))}` : '-'}
                      </span>
                      {isBest && (
                        <Star className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Rooms */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10 flex items-center gap-2">
                <Bed className="h-4 w-4 text-slate-600" />
                Oda Sayısı
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  {listing.features?.rooms ? (
                    <span className="font-medium text-slate-900">{listing.features.rooms}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10 flex items-center gap-2">
                <Bath className="h-4 w-4 text-slate-600" />
                Banyo Sayısı
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  {listing.features?.bathrooms ? (
                    <span className="font-medium text-slate-900">{listing.features.bathrooms}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Floor */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                Kat
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  {listing.features?.floor ? (
                    <span className="font-medium text-slate-900">{listing.features.floor}. Kat</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Building Age */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                Bina Yaşı
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4 text-sm">
                  {listing.features?.buildingAge ? (
                    <span className="font-medium text-slate-900">{listing.features.buildingAge} yıl</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Features */}
            {[
              { key: 'balcony', label: 'Balkon', icon: Home },
              { key: 'parking', label: 'Otopark', icon: Building2 },
              { key: 'elevator', label: 'Asansör', icon: Building2 },
              { key: 'seaView', label: 'Deniz Manzarası', icon: MapPin },
              { key: 'furnished', label: 'Eşyalı', icon: Home },
            ].map((feature) => (
              <tr key={feature.key} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10 flex items-center gap-2">
                  {feature.label}
                </td>
                {comparisonListings.map((listing) => {
                  const value = listing.features?.[feature.key as keyof typeof listing.features];
                  const hasFeature = typeof value === 'boolean' ? value : !!value;
                  return (
                    <td key={listing.id} className="px-6 py-4 text-sm">
                      {hasFeature ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-300 inline" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Contact Actions */}
            <tr className="bg-slate-50/30">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-50/50 sticky left-0 z-10">
                İletişim
              </td>
              {comparisonListings.map((listing) => (
                <td key={listing.id} className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {listing.agent_phone && (
                      <a
                        href={`tel:${listing.agent_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Ara
                      </a>
                    )}
                    {listing.agent_whatsapp && (
                      <a
                        href={`https://wa.me/${listing.agent_whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    <Link
                      href={`${basePath}/ilan/${listing.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Detaylar
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      {stats && comparisonListings.length >= 2 && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Öneriler
          </h3>
          <div className="space-y-3">
            {bestPriceListing && (
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">En Uygun Fiyat</div>
                    <div className="text-sm text-slate-600">
                      <Link href={`${basePath}/ilan/${bestPriceListing.slug}`} className="text-blue-600 hover:underline">
                        {bestPriceListing.title}
                      </Link>
                      {' '}en düşük fiyata sahip ({new Intl.NumberFormat('tr-TR').format(Number(bestPriceListing.price_amount))} ₺)
                    </div>
                  </div>
                </div>
              </div>
            )}
            {bestValueListing && (
              <div className="p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">En İyi Değer</div>
                    <div className="text-sm text-slate-600">
                      <Link href={`${basePath}/ilan/${bestValueListing.slug}`} className="text-blue-600 hover:underline">
                        {bestValueListing.title}
                      </Link>
                      {' '}m² başına en uygun fiyata sahip (₺{new Intl.NumberFormat('tr-TR').format(Math.round(getPricePerM2(bestValueListing)))} / m²)
                    </div>
                  </div>
                </div>
              </div>
            )}
            {bestSizeListing && bestSizeListing.id !== bestValueListing?.id && (
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Square className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">En Büyük Alan</div>
                    <div className="text-sm text-slate-600">
                      <Link href={`${basePath}/ilan/${bestSizeListing.slug}`} className="text-blue-600 hover:underline">
                        {bestSizeListing.title}
                      </Link>
                      {' '}en büyük metrekareye sahip ({bestSizeListing.features?.sizeM2} m²)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
