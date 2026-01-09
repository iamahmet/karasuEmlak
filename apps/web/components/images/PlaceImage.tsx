"use client";

import { useState } from 'react';

interface PlaceImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSeed?: string;
}

export function PlaceImage({ src, alt, className = "", fallbackSeed = "default" }: PlaceImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(`https://picsum.photos/seed/${fallbackSeed}/800/600`);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
}
