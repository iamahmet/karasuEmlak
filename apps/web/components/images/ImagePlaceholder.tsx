'use client';

import { generateBlurPlaceholder } from '@/lib/cloudinary/optimization';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ImagePlaceholderProps {
  publicId?: string;
  width: number;
  height: number;
  className?: string;
  showBlur?: boolean;
}

/**
 * ImagePlaceholder Component
 * 
 * Shows a blur placeholder while image is loading
 * Automatically generates blur placeholder from Cloudinary
 */
export function ImagePlaceholder({
  publicId,
  width,
  height,
  className,
  showBlur = true,
}: ImagePlaceholderProps) {
  if (!publicId || !showBlur) {
    return (
      <div
        className={cn('bg-muted animate-pulse', className)}
        style={{ width, height }}
      />
    );
  }

  const blurUrl = generateBlurPlaceholder(publicId, 20, Math.round((20 / width) * height));

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      <Image
        src={blurUrl}
        alt=""
        width={20}
        height={Math.round((20 / width) * height)}
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-150"
        aria-hidden="true"
        unoptimized
      />
      <div className="absolute inset-0 bg-muted/50" />
    </div>
  );
}

