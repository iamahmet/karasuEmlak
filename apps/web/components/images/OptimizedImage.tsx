'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedCloudinaryUrl, generateBlurPlaceholder, generateSizes, IMAGE_SIZES } from '@/lib/cloudinary/optimization';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number | 'auto';
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

/**
 * OptimizedImage Component
 * 
 * Automatically optimizes Cloudinary images with:
 * - Automatic format selection (WebP/AVIF)
 * - Responsive sizing
 * - Lazy loading
 * - Blur placeholders
 * - Error handling
 */
export function OptimizedImage({
  publicId,
  alt,
  width = 800,
  height = width * (9 / 16), // Default to 16:9 aspect ratio if height not provided
  className,
  priority = false,
  loading = 'lazy',
  quality = 'auto',
  sizes,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallback,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Early return if publicId is missing
  if (!publicId) {
    if (fallback) {
      return (
        <div 
          className={cn('relative overflow-hidden', className)} 
          style={!className?.includes('w-') && !className?.includes('h-') ? { width, height: height || width } : undefined}
        >
          <Image
            src={fallback}
            alt={alt}
            fill
            className={cn(
              'transition-opacity duration-300',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
            )}
            priority={priority}
            unoptimized={true}
          />
        </div>
      );
    }
    return (
      <div 
        className={cn('relative overflow-hidden bg-muted flex items-center justify-center', className)} 
        style={!className?.includes('w-') && !className?.includes('h-') ? { width, height: height || width } : undefined}
      >
        <span className="text-muted-foreground text-sm">Görsel yok</span>
      </div>
    );
  }

  // Check if publicId is an external URL (starts with "placeholder:", "http://", or "https://")
  // ALL URLs (including Cloudinary URLs) should use unoptimized to avoid config issues
  const isExternalUrl = publicId.startsWith('placeholder:') || publicId.startsWith('http://') || publicId.startsWith('https://');
  const actualPublicId = isExternalUrl ? publicId.replace('placeholder:', '') : publicId;

  // For external URLs, use them directly with unoptimized flag
  // For Cloudinary IDs, generate optimized URL
  let imageUrl: string;
  if (isExternalUrl) {
    imageUrl = actualPublicId; // Direct URL for external images (including full Cloudinary URLs)
  } else {
    try {
      const optimizedUrl = getOptimizedCloudinaryUrl(actualPublicId, {
        width,
        height,
        quality,
        format: 'auto',
      });
      
      // Validate URL
      if (!optimizedUrl || optimizedUrl.trim() === '') {
        imageUrl = fallback || '';
      } else {
        imageUrl = optimizedUrl;
      }
    } catch (error) {
      // If URL generation fails, use fallback or empty
      imageUrl = fallback || '';
    }
  }
  
  // If no valid URL, mark as error
  if (!imageUrl || imageUrl.trim() === '') {
    // Will be handled by error state check below
  }

  // ALL images use unoptimized to avoid Next.js config issues
  // Cloudinary handles optimization via URL parameters
  const shouldUseUnoptimized = true; // Always use unoptimized
  const effectivePlaceholder = isExternalUrl ? 'empty' : placeholder;
  const effectiveBlurDataURL = isExternalUrl ? undefined : (blurDataURL || generateBlurPlaceholder(actualPublicId, 20, height ? Math.round((20 / width) * height) : undefined));

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || generateSizes('100vw', {
    '640px': '100vw',
    '768px': '50vw',
    '1024px': '33vw',
  });

  // Handle image load - use setTimeout to avoid state update during render
  const handleLoad = () => {
    // Use setTimeout to defer state update and avoid render warnings
    setTimeout(() => {
      setIsLoading(false);
      onLoad?.();
    }, 0);
  };

  // Handle image error - gracefully fallback
  const handleError = () => {
    // Use setTimeout to defer state update and avoid render warnings
    setTimeout(() => {
      setImageError(true);
      setIsLoading(false);
      onError?.();
    }, 0);
  };

  // If error, show fallback or placeholder
  if (imageError) {
    // Try fallback image if provided
    if (fallback) {
      return (
        <div 
          className={cn('relative overflow-hidden', className)} 
          style={!className?.includes('w-') && !className?.includes('h-') ? { width, height: height || width } : undefined}
        >
          <Image
            src={fallback}
            alt={alt}
            fill
            className={cn(
              'transition-opacity duration-300',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
              objectFit === 'fill' && 'object-fill',
              objectFit === 'none' && 'object-none',
              objectFit === 'scale-down' && 'object-scale-down'
            )}
            priority={priority}
            unoptimized={true}
            onError={() => {
              // If fallback also fails, it will be handled by the error state
            }}
          />
        </div>
      );
    }
    
    // No fallback, show placeholder
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center',
          className
        )}
        style={!className?.includes('w-') && !className?.includes('h-') ? { width, height: height || width } : undefined}
      >
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium block">Görsel yüklenemedi</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('relative overflow-hidden', className)} 
      style={!className?.includes('w-') && !className?.includes('h-') ? { width, height: height || width } : undefined}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        priority={priority}
        loading={priority ? undefined : loading} // Don't use loading when priority is true
        placeholder={effectivePlaceholder}
        blurDataURL={effectivePlaceholder === 'blur' ? effectiveBlurDataURL : undefined}
        sizes={responsiveSizes}
        unoptimized={shouldUseUnoptimized} // Always unoptimized - Cloudinary handles optimization
        onLoad={handleLoad}
        onError={handleError}
        quality={typeof quality === 'number' ? quality : undefined}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

/**
 * Pre-configured image components for common use cases
 */
export const ListingImage = (props: Omit<OptimizedImageProps, 'width' | 'height'>) => (
  <OptimizedImage
    {...props}
    width={IMAGE_SIZES.listing.width}
    height={IMAGE_SIZES.listing.height}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);

export const CardImage = (props: Omit<OptimizedImageProps, 'width' | 'height'>) => (
  <OptimizedImage
    {...props}
    width={IMAGE_SIZES.card.width}
    height={IMAGE_SIZES.card.height}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);

export const HeroImage = (props: Omit<OptimizedImageProps, 'width' | 'height'>) => (
  <OptimizedImage
    {...props}
    width={IMAGE_SIZES.hero.width}
    height={IMAGE_SIZES.hero.height}
    priority
    sizes="100vw"
  />
);

export const ThumbnailImage = (props: Omit<OptimizedImageProps, 'width' | 'height'>) => (
  <OptimizedImage
    {...props}
    width={IMAGE_SIZES.thumbnail.width}
    height={IMAGE_SIZES.thumbnail.height}
    sizes="150px"
  />
);

export const GalleryImage = (props: Omit<OptimizedImageProps, 'width' | 'height'>) => (
  <OptimizedImage
    {...props}
    width={IMAGE_SIZES.gallery.width}
    height={IMAGE_SIZES.gallery.height}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
  />
);

