"use client";

import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@karasu/lib";

interface PropertyHighlightsProps {
  features: {
    rooms?: number;
    bathrooms?: number;
    sizeM2?: number;
    floor?: number;
    buildingAge?: number;
    heating?: string;
    furnished?: boolean;
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    seaView?: boolean;
  };
  propertyType: string;
  status: 'satilik' | 'kiralik';
  neighborhood: string;
  className?: string;
}

export function PropertyHighlights({ features, propertyType, status, neighborhood, className }: PropertyHighlightsProps) {
  const highlights: string[] = [];

  // Generate highlights based on features
  if (features.seaView) {
    highlights.push('Deniz Manzaralı');
  }

  if (features.buildingAge && features.buildingAge < 5) {
    highlights.push('Sıfır veya Az Kullanılmış');
  }

  if (features.furnished) {
    highlights.push('Tam Eşyalı');
  }

  if (features.parking) {
    highlights.push('Otopark Mevcut');
  }

  if (features.elevator) {
    highlights.push('Asansörlü Bina');
  }

  if (features.balcony) {
    highlights.push('Geniş Balkonlu');
  }

  if (features.heating === 'Kombi') {
    highlights.push('Ekonomik Isınma');
  }

  if (neighborhood === 'Sahil') {
    highlights.push('Sahile Yürüme Mesafesinde');
    highlights.push('Yüksek Kira Getirisi');
  }

  if (neighborhood === 'Merkez') {
    highlights.push('Merkezi Konum');
    highlights.push('Ulaşım Kolaylığı');
  }

  if (propertyType === 'villa' || propertyType === 'yazlik') {
    highlights.push('Müstakil Kullanım');
    highlights.push('Bahçe Kullanım Hakkı');
  }

  if (propertyType === 'daire' && features.sizeM2 && features.sizeM2 > 150) {
    highlights.push('Geniş Yaşam Alanı');
  }

  if (status === 'satilik') {
    highlights.push('Tapu Devri Hazır');
    highlights.push('Krediye Uygun');
  }

  // Ensure at least 6 highlights
  const defaultHighlights = [
    'Güvenli Lokasyon',
    'Yatırıma Uygun',
    'Anında Görülebilir',
    'Net Fiyat',
    'Profesyonel Danışmanlık',
    'Hızlı İşlem',
  ];

  const allHighlights = [...new Set([...highlights, ...defaultHighlights])].slice(0, 8);

  return (
    <div className={cn("bg-gradient-to-br from-[#006AFF]/5 via-blue-50/30 to-slate-50 rounded-2xl border-2 border-[#006AFF]/20 p-6 md:p-8 shadow-lg", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-[#006AFF] to-blue-600 rounded-xl shadow-md">
          <Star className="h-6 w-6 text-white fill-white" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Öne Çıkan Özellikler</h3>
          <p className="text-sm text-slate-600">Bu ilanı özel kılan avantajlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {allHighlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-[#006AFF]/40 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-[#006AFF] transition-colors">{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

