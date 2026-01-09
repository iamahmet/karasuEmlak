'use client';

import { useState, useEffect } from 'react';
import { getOptimizedCloudinaryUrl, generateBlurPlaceholder } from '@/lib/cloudinary/optimization';

export interface UseImageOptimizationOptions {
  publicId: string;
  width: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif';
  enableBlur?: boolean;
}

export interface UseImageOptimizationReturn {
  imageUrl: string;
  blurPlaceholder: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * useImageOptimization Hook
 * 
 * Provides optimized image URL and blur placeholder
 * Handles loading states and errors
 */
export function useImageOptimization({
  publicId,
  width,
  height,
  quality = 'auto',
  format = 'auto',
  enableBlur = true,
}: UseImageOptimizationOptions): UseImageOptimizationReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const imageUrl = getOptimizedCloudinaryUrl(publicId, {
    width,
    height,
    quality,
    format,
  });

  const blurPlaceholder = enableBlur
    ? generateBlurPlaceholder(publicId, 20, height ? Math.round((20 / width) * height) : undefined)
    : '';

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Preload image
    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setError(new Error('Failed to load image'));
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return {
    imageUrl,
    blurPlaceholder,
    isLoading,
    error,
  };
}

