"use client";

import { useState, useEffect } from 'react';
import { X, MapPin, Square, Home, Bath, Car, Waves, ArrowRight, Phone, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@karasu/ui';
import { Dialog, DialogContent } from '@karasu/ui';
import { ListingImage } from '@/components/images';
import { FavoriteButton } from './FavoriteButton';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';
import Link from 'next/link';
import type { Listing } from '@/lib/supabase/queries';
import { cn } from '@karasu/lib';
import { napData } from '@karasu-emlak/config/nap';

interface QuickViewModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  basePath: string;
}

export function QuickViewModal({ listing, isOpen, onClose, basePath }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && listing) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, listing]);

  if (!listing) return null;

  const mainImage = listing.images?.[currentImageIndex] || listing.images?.[0];
  const features = listing.features || {};

  const handlePrevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.images!.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === listing.images!.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0 bg-white">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>

          {/* Image Gallery */}
          <div className="relative h-[300px] md:h-[400px] bg-slate-100 overflow-hidden">
            {mainImage ? (
              <>
                <ListingImage
                  publicId={mainImage.public_id}
                  alt={mainImage.alt || listing.title}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                {/* Image Navigation */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-colors z-10"
                      aria-label="Önceki fotoğraf"
                    >
                      <ArrowRight className="h-5 w-5 text-slate-700 rotate-180" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-colors z-10"
                      aria-label="Sonraki fotoğraf"
                    >
                      <ArrowRight className="h-5 w-5 text-slate-700" />
                    </button>
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm font-medium backdrop-blur-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                    {/* Image Dots */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {listing.images.slice(0, 5).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            index === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/50 hover:bg-white/75"
                          )}
                          aria-label={`Fotoğraf ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-400 text-sm">Görsel yok</span>
              </div>
            )}
            {/* Action Buttons Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <FavoriteButton listingId={listing.id} listingTitle={listing.title} variant="card" />
              <ComparisonButton listingId={listing.id} variant="card" />
              {listing.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg">
                  ⭐ Öne Çıkan
                </div>
              )}
            </div>
            {/* Status Badge */}
            <div className="absolute top-4 right-16 z-10">
              <div className="bg-[#006AFF]/90 text-white px-3 py-1 rounded-lg text-sm font-semibold backdrop-blur-sm shadow-lg">
                {listing.status === 'satilik' ? 'Satılık' : 'Kiralık'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title & Location */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
                {listing.title}
              </h2>
              <p className="text-slate-600 flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <span>{listing.location_neighborhood}, {listing.location_district}</span>
              </p>
            </div>

            {/* Price */}
            {listing.price_amount && (
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-[#006AFF] tracking-tight">
                    ₺{new Intl.NumberFormat('tr-TR').format(Number(listing.price_amount))}
                  </span>
                  {listing.status === 'kiralik' && (
                    <span className="text-lg text-slate-500 font-medium">/ay</span>
                  )}
                </div>
                {features.sizeM2 && (
                  <p className="text-sm text-slate-500 mt-2">
                    m² başına: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(Number(listing.price_amount) / features.sizeM2))}
                  </p>
                )}
              </div>
            )}

            {/* Features Grid */}
            {features && (
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.sizeM2 && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Square className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Alan</div>
                        <div className="text-sm font-semibold text-slate-900">{features.sizeM2} m²</div>
                      </div>
                    </div>
                  )}
                  {features.rooms && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Home className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Oda</div>
                        <div className="text-sm font-semibold text-slate-900">{features.rooms}</div>
                      </div>
                    </div>
                  )}
                  {features.bathrooms && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Bath className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Banyo</div>
                        <div className="text-sm font-semibold text-slate-900">{features.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {features.parking && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Car className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Otopark</div>
                        <div className="text-sm font-semibold text-slate-900">Var</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description_short && (
              <div className="mb-6">
                <p className="text-slate-700 leading-relaxed line-clamp-3">
                  {listing.description_short}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`${basePath}/ilan/${listing.slug}`} className="flex-1">
                <Button className="w-full gap-2" size="lg">
                  <Eye className="h-5 w-5" />
                  Detaylı İncele
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                  window.open(`https://wa.me/${napData.contact.whatsapp.replace(/[^0-9]/g, '')}?text=Merhaba, ${listing.title} hakkında bilgi almak istiyorum.`, '_blank');
                }}
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => {
                  window.location.href = `tel:${napData.contact.phone}`;
                }}
              >
                <Phone className="h-5 w-5" />
                Ara
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
