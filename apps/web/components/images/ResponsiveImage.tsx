'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage Component
 * 
 * Optimized image component with:
 * - Cloudinary responsive srcset
 * - Blur placeholder (LQIP)
 * - Lazy loading
 * - Proper alt text handling
 * - Error fallback
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  blurDataURL,
  placeholder = 'blur',
  objectFit = 'cover',
  quality = 85,
  loading = 'lazy',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate blur placeholder if not provided
  useEffect(() => {
    if (!blurDataURL && placeholder === 'blur') {
      // Try to generate LQIP from Cloudinary
      if (src.includes('cloudinary.com')) {
        // Extract public_id from Cloudinary URL
        const publicIdMatch = src.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\?|$)/);
        if (publicIdMatch) {
          const publicId = publicIdMatch[1];
          // Generate blur placeholder URL
          const blurUrl = getOptimizedCloudinaryUrl(publicId, {
            width: 20,
            height: 20,
            quality: 20,
            blur: 100,
          });
          setImageSrc(blurUrl);
        }
      }
    }
  }, [src, blurDataURL, placeholder]);

  // Optimize Cloudinary URL
  const optimizedSrc = imageSrc.includes('cloudinary.com')
    ? getOptimizedCloudinaryUrl(imageSrc, {
        width: width || 1200,
        height: height,
        quality,
        format: 'auto',
      })
    : imageSrc;

  // Generate srcset for Cloudinary images
  const generateSrcSet = (): string | undefined => {
    if (!imageSrc.includes('cloudinary.com')) return undefined;

    const publicIdMatch = imageSrc.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\?|$)/);
    if (!publicIdMatch) return undefined;

    const publicId = publicIdMatch[1];
    const breakpoints = [480, 800, 1200, 1600, 1920];

    return breakpoints
      .map(bp => {
        const url = getOptimizedCloudinaryUrl(publicId, {
          width: bp,
          height: height ? Math.round((bp / (width || 1200)) * height) : undefined,
          quality,
          format: 'auto',
        });
        return `${url} ${bp}w`;
      })
      .join(', ');
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Görsel yüklenemedi</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width || 1200}
        height={height || 675}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          `object-${objectFit}`
        )}
        srcSet={generateSrcSet()}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={loading}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
}
