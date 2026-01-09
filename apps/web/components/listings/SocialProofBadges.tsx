"use client";

import { Clock, TrendingUp, Eye, Star } from 'lucide-react';
import { cn } from '@karasu/lib';
import type { Listing } from '@/lib/supabase/queries';

interface SocialProofBadgesProps {
  listing: Listing;
  className?: string;
}

export function SocialProofBadges({ listing, className }: SocialProofBadgesProps) {
  const badges = [];

  // Yeni eklenen (son 24 saat)
  const createdAt = listing.created_at ? new Date(listing.created_at) : null;
  const now = new Date();
  const hoursSinceCreation = createdAt 
    ? Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    : null;

  if (hoursSinceCreation !== null && hoursSinceCreation < 24) {
    badges.push({
      icon: Clock,
      label: hoursSinceCreation < 1 ? 'Yeni Eklendi' : `${hoursSinceCreation} saat önce eklendi`,
      color: 'bg-green-100 text-green-700 border-green-200',
    });
  }

  // Öne çıkan
  if (listing.featured) {
    badges.push({
      icon: Star,
      label: 'Öne Çıkan İlan',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    });
  }

  // Popüler (görüntülenme sayısı - eğer varsa)
  // Bu veri şu an yok ama gelecekte eklenebilir
  // if (listing.view_count && listing.view_count > 100) {
  //   badges.push({
  //     icon: Eye,
  //     label: `${listing.view_count}+ görüntüleme`,
  //     color: 'bg-blue-100 text-blue-700 border-blue-200',
  //   });
  // }

  // Fiyat düşmüş (eğer price_history varsa)
  // Bu veri şu an yok ama gelecekte eklenebilir

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
              badge.color
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}
