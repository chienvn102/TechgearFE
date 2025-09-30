'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  PhotoIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface CloudinaryImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  transformation?: 'thumbnail' | 'medium' | 'large' | 'original';
  fallbackSrc?: string;
  showCloudinaryBadge?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  transformation = 'medium',
  fallbackSrc,
  showCloudinaryBadge = false,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const getTransformedUrl = (originalUrl: string, transform: string): string => {
    if (!originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Extract the public ID from Cloudinary URL
    const urlParts = originalUrl.split('/');
    const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
    if (versionIndex === -1) return originalUrl;

    const beforeVersion = urlParts.slice(0, versionIndex);
    const afterVersion = urlParts.slice(versionIndex);

    // Define transformations
    const transformations = {
      thumbnail: 'c_thumb,w_200,h_200,g_face',
      medium: 'c_fit,w_500,h_500,q_auto,f_auto',
      large: 'c_fit,w_1000,h_1000,q_auto,f_auto',
      original: ''
    };

    const transformString = transformations[transform as keyof typeof transformations];
    
    if (transformString) {
      beforeVersion.push(transformString);
    }

    return [...beforeVersion, ...afterVersion].join('/');
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    
    // Try fallback source
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageError(false);
      setImageLoading(true);
      return;
    }
    
    onError?.();
  };

  const handleRetry = () => {
    setImageError(false);
    setImageLoading(true);
    setCurrentSrc(src);
  };

  if (!src && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg ${className}`}
        style={{ width, height: height || width }}
      >
        <PhotoIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const finalSrc = currentSrc ? getTransformedUrl(currentSrc, transformation) : undefined;

  return (
    <div className={`relative ${className}`} style={{ width, height: height || width }}>
      {/* Loading State */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="h-6 w-6 text-gray-400" />
          </motion.div>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
          <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 text-center mb-2">
            Không thể tải ảnh
          </p>
          <button
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Actual Image */}
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          width={width}
          height={height || width}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`
            w-full h-full object-cover rounded-lg transition-opacity duration-300
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
            ${imageError ? 'hidden' : 'block'}
          `}
        />
      )}

      {/* Cloudinary Badge */}
      {showCloudinaryBadge && currentSrc?.includes('cloudinary.com') && !imageLoading && !imageError && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white px-1.5 py-0.5 rounded text-xs flex items-center">
          <CloudIcon className="h-3 w-3 mr-1" />
          Cloudinary
        </div>
      )}
    </div>
  );
};
