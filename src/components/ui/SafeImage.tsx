'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  fallbackSrc = '/images/placeholder.svg'
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    };

  // Validate and normalize URL before rendering
  let validSrc = imgSrc;
  try {
    if (imgSrc) {
      // Handle local files that don't start with /
      if (!imgSrc.startsWith('data:') && !imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
        validSrc = fallbackSrc;
      }
      // Test if it's a valid URL for external links
      else if (imgSrc.startsWith('http')) {
        new URL(imgSrc); // This will throw if invalid
        }
    } else {
      validSrc = fallbackSrc;
    }
  } catch (error) {
    validSrc = fallbackSrc;
  }

  if (fill) {
    return (
      <Image
        src={validSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      src={validSrc}
      alt={alt}
      width={width || 500}
      height={height || 500}
      className={className}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
