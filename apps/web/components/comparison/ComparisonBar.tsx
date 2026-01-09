'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { getComparisonCount, clearComparison } from '@/lib/comparison';
import { Scale, X } from 'lucide-react';

interface ComparisonBarProps {
  basePath?: string;
}

export function ComparisonBar({ basePath = '' }: ComparisonBarProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateCount() {
      const comparisonCount = getComparisonCount();
      setCount(comparisonCount);
      setIsVisible(comparisonCount > 0);
    }

    updateCount();

    // Listen for comparison updates
    window.addEventListener('comparison-updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('comparison-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg animate-in slide-in-from-bottom">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {count} ilan karşılaştırmada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              aria-label="Karşılaştırmayı temizle"
            >
              <X className="h-4 w-4 mr-1" />
              Temizle
            </Button>
            <Link href={`${basePath}/karsilastir`}>
              <Button size="sm">
                Karşılaştır
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

