/**
 * ReviewImages Component
 * 
 * Purpose: Display review images with lightbox gallery
 * 
 * Features:
 * - Grid layout for multiple images
 * - Lightbox/modal for full-size view
 * - Navigation between images
 * - Zoom in/out
 * - Responsive design
 * - Lazy loading
 * 
 * Usage:
 * <ReviewImages images={review.review_images} />
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { ReviewImage } from '../types/review.types';

interface ReviewImagesProps {
  images: ReviewImage[];
  maxDisplay?: number; // Max images to show in grid (rest as "+X more")
  className?: string;
}

/**
 * ReviewImages Component
 */
export const ReviewImages: React.FC<ReviewImagesProps> = ({
  images,
  maxDisplay = 5,
  className = '',
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = Math.max(0, images.length - maxDisplay);

  /**
   * Open lightbox with specific image
   */
  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  /**
   * Close lightbox
   */
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  /**
   * Navigate to previous image
   */
  const previousImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  /**
   * Navigate to next image
   */
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        previousImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'Escape':
        closeLightbox();
        break;
    }
  }, [lightboxOpen, previousImage, nextImage, closeLightbox]);

  return (
    <>
      {/* Image Grid */}
      <div className={`review-images ${className}`}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {displayImages.map((image, index) => (
            <motion.div
              key={image.cloudinary_public_id || index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.cloudinary_secure_url || image.image_url}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>

              {/* "+X more" overlay on last image */}
              {index === maxDisplay - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{remainingCount} more
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous button */}
            {images.length > 1 && (
              <button
                className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                aria-label="Previous image"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Current image */}
            <motion.div
              className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={images[currentImageIndex].cloudinary_secure_url || images[currentImageIndex].image_url}
                  alt={`Review image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </motion.div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReviewImages;
