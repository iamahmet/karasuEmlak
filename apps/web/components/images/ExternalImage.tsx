/**
 * External Image Component
 * 
 * Optimized image component for external URLs (e.g., from RSS feeds)
 * Uses Next.js Image with unoptimized flag for external domains
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@karasu/lib';

interface ExternalImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  fallback?: string;
}

/**
 * External Image Component
 * Handles external images from RSS feeds or other sources
 */
export function ExternalImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  priority = false,
  fill = false,
  fallback,
}: ExternalImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Early return if no src or error
  if (error || !src || src.trim() === '') {
    // Try fallback if provided
    if (fallback && !fallbackError) {
      return (
        <Image
          src={fallback}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width || 800}
          height={fill ? undefined : height || 600}
          className={className}
          sizes={sizes}
          priority={priority}
          unoptimized={true}
          onError={() => setFallbackError(true)}
        />
      );
    }
    
    return (
      <div className={cn('bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center', className, fill && 'absolute inset-0')}>
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium block">Görsel yüklenemedi</span>
        </div>
      </div>
    );
  }

  // Validate URL format
  let isValidUrl = false;
  try {
    const url = new URL(src);
    isValidUrl = url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    isValidUrl = false;
  }

  // If invalid URL, show placeholder or fallback
  if (!isValidUrl) {
    if (fallback && !fallbackError) {
      return (
        <Image
          src={fallback}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width || 800}
          height={fill ? undefined : height || 600}
          className={className}
          sizes={sizes}
          priority={priority}
          unoptimized={true}
          onError={() => setFallbackError(true)}
        />
      );
    }
    
    return (
      <div className={cn('bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center', className, fill && 'absolute inset-0')}>
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium block">Geçersiz görsel URL</span>
        </div>
      </div>
    );
  }

  // Handle error with fallback
  const handleError = () => {
    setError(true);
    // If fallback is provided, it will be shown in the error state check above
  };

  // For external images, we need to use unoptimized or configure domains
  // Using unoptimized for now to avoid Next.js image optimization issues
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized={true} // External images may not support Next.js optimization
        onError={handleError}
        onLoad={() => {
          // Image loaded successfully
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={true} // External images may not support Next.js optimization
      onError={handleError}
      onLoad={() => {
        // Image loaded successfully
      }}
    />
  );
}

