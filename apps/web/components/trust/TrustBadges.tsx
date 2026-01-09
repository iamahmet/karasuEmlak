'use client';

import { Shield, Star, CheckCircle } from 'lucide-react';
import { cn } from '@karasu/lib';

interface TrustBadgesProps {
  verified?: boolean;
  featured?: boolean;
  agentVerified?: boolean;
  className?: string;
}

export default function TrustBadges({ 
  verified = false, 
  featured = false,
  agentVerified = false,
  className = '' 
}: TrustBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {verified && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
          <Shield className="w-4 h-4" />
          Doğrulanmış İlan
        </span>
      )}
      {featured && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
          <Star className="w-4 h-4" />
          Öne Çıkan
        </span>
      )}
      {agentVerified && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Doğrulanmış Emlakçı
        </span>
      )}
    </div>
  );
}

