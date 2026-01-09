'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { isInComparison, toggleComparison } from '@/lib/comparison';
import { Scale } from 'lucide-react';

interface ComparisonButtonProps {
  listingId: string;
  variant?: 'card' | 'detail';
  className?: string;
}

export function ComparisonButton({ listingId, variant = 'card', className }: ComparisonButtonProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsComparing(isInComparison(listingId));
  }, [listingId]);

  useEffect(() => {
    const handleComparisonUpdate = () => {
      setIsComparing(isInComparison(listingId));
    };

    window.addEventListener('comparison-updated', handleComparisonUpdate);
    return () => window.removeEventListener('comparison-updated', handleComparisonUpdate);
  }, [listingId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      const success = toggleComparison(listingId);
      if (success) {
        setIsComparing(!isComparing);
      } else if (!isComparing) {
        // Maximum items reached
        alert('Maksimum 4 ilan karşılaştırabilirsiniz. Lütfen önce listeden bir ilanı kaldırın.');
      }
    } catch (error) {
      console.error('Failed to toggle comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          isComparing
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        } ${className}`}
        aria-label={isComparing ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
        title={isComparing ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
      >
        <Scale className={`h-4 w-4 ${isComparing ? 'fill-current' : ''}`} />
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isComparing ? 'default' : 'outline'}
      size="sm"
      className={className}
    >
      <Scale className={`h-4 w-4 mr-2 ${isComparing ? 'fill-current' : ''}`} />
      {isComparing ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
    </Button>
  );
}

