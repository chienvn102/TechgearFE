'use client';

import { useState, useEffect } from 'react';
import { getProductImageUrl } from '@/utils/cloudinary';

interface SafeImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  onError?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  width = 200,
  height = 200,
  fallbackSrc = '/images/placeholder-product.svg',
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    if (src && src.trim()) {
      setImageSrc(src);
      setHasError(false);
    } else {
      setImageSrc(fallbackSrc);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  // Optimize image URL với Cloudinary nếu có thể (chỉ cho product images, không cho placeholder)
  const optimizedSrc = imageSrc && imageSrc.trim() && !hasError && !imageSrc.includes('placeholder-product')
    ? getProductImageUrl(imageSrc, width, height, 'fill')
    : imageSrc;

  // Ensure we always have a valid src
  const finalSrc = optimizedSrc && optimizedSrc.trim() ? optimizedSrc : fallbackSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
