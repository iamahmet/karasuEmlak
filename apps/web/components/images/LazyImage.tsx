'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { OptimizedImage, OptimizedImageProps } from './OptimizedImage';
import { ImagePlaceholder } from './ImagePlaceholder';

export interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
  placeholder?: "empty" | "blur";
}

/**
 * LazyImage Component
 * 
 * Intersection Observer based lazy loading
 * Only loads image when it enters viewport
 */
export function LazyImage({
  publicId,
  alt,
  width = 800,
  height,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = "blur",
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = useCallback(() => {
    setHasLoaded(true);
    props.onLoad?.();
  }, [props.onLoad]);

  return (
    <div ref={imgRef} className="relative">
      {!isInView && placeholder !== undefined && (
        <ImagePlaceholder
          publicId={publicId}
          width={width}
          height={height || width}
          className={props.className}
        />
      )}
      {isInView && (
        <OptimizedImage
          {...props}
          publicId={publicId}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}

