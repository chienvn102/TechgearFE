/**
 * Custom Hook: useCreateReview
 * Purpose: Handle review creation and image upload
 * 
 * Features:
 * - Create review with validation
 * - Upload multiple images (max 5)
 * - Check purchase verification before allowing review
 * - Handle loading states for create and image upload
 * - Error handling with user-friendly messages
 * - Success callback for refetch
 * 
 * Usage:
 * const { 
 *   createReview, 
 *   uploadImages, 
 *   isSubmitting, 
 *   isUploadingImages,
 *   error,
 *   checkPurchase,
 *   purchaseVerification
 * } = useCreateReview({ 
 *   productId, 
 *   onSuccess: () => refetchReviews() 
 * });
 */

import { useState, useCallback, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import type { 
  CreateReviewData, 
  CreateReviewResponse,
  UploadImagesResponse,
  PurchaseVerification,
  UpdateReviewData,
  ReviewDetailResponse
} from '../types/review.types';

interface UseCreateReviewParams {
  productId: string;
  onSuccess?: () => void; // Callback after successful create + upload
  onError?: (error: string) => void; // Callback on error
}

interface UseCreateReviewReturn {
  // Create review
  createReview: (data: CreateReviewData) => Promise<string | null>; // Returns reviewId on success
  isSubmitting: boolean;
  
  // Upload images
  uploadImages: (reviewId: string, images: File[]) => Promise<boolean>;
  isUploadingImages: boolean;
  
  // Purchase verification
  checkPurchase: () => Promise<void>;
  purchaseVerification: PurchaseVerification | null;
  isCheckingPurchase: boolean;
  
  // Update review (for edit mode)
  updateReview: (reviewId: string, data: UpdateReviewData) => Promise<boolean>;
  isUpdating: boolean;
  
  // State
  error: string | null;
  success: boolean;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook để tạo review mới và upload ảnh
 */
export const useCreateReview = ({
  productId,
  onSuccess,
  onError,
}: UseCreateReviewParams): UseCreateReviewReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [purchaseVerification, setPurchaseVerification] = useState<PurchaseVerification | null>(null);

  /**
   * Check if customer has purchased this product
   */
  const checkPurchase = useCallback(async () => {
    if (!productId) {
      setError('Product ID is required');
      return;
    }

    setIsCheckingPurchase(true);
    setError(null);

    try {
      const verification = await reviewService.checkPurchase(productId);
      setPurchaseVerification(verification);

      if (!verification.hasPurchased) {
        setError('Bạn cần mua sản phẩm này trước khi có thể đánh giá');
      }

      if (verification.hasReviewed) {
        setError('Bạn đã đánh giá sản phẩm này rồi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify purchase';
      setError(errorMessage);
      console.error('[useCreateReview] Error checking purchase:', err);
      onError?.(errorMessage);
    } finally {
      setIsCheckingPurchase(false);
    }
  }, [productId, onError]);

  /**
   * Auto-check purchase on mount
   */
  useEffect(() => {
    if (productId) {
      checkPurchase();
    }
  }, [productId]); // Only run on mount and productId change

  /**
   * Create review
   */
  const createReview = useCallback(async (data: CreateReviewData): Promise<string | null> => {
    // Validation
    const validation = reviewService.validateCreateReview(data);
    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      setError(errorMessages);
      onError?.(errorMessages);
      return null;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response: CreateReviewResponse = await reviewService.createReview(data);

      if (response.success && response.data?.review) {
        setSuccess(true);
        return response.data.review._id; // Return reviewId for image upload
      } else {
        throw new Error(response.message || 'Failed to create review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      setError(errorMessage);
      console.error('[useCreateReview] Error creating review:', err);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [onError]);

  /**
   * Upload images for review
   */
  const uploadImages = useCallback(async (reviewId: string, images: File[]): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    if (images.length === 0) {
      return true; // No images to upload
    }

    // Validate images
    const validation = reviewService.validateImages(images);
    if (!validation.valid) {
      const errorMessages = validation.errors.join(', ');
      setError(errorMessages);
      onError?.(errorMessages);
      return false;
    }

    setIsUploadingImages(true);
    setError(null);

    try {
      const response: UploadImagesResponse = await reviewService.uploadReviewImages(reviewId, images);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Callback to refetch reviews
        return true;
      } else {
        throw new Error(response.message || 'Failed to upload images');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      console.error('[useCreateReview] Error uploading images:', err);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsUploadingImages(false);
    }
  }, [onSuccess, onError]);

  /**
   * Update existing review (for edit mode)
   */
  const updateReview = useCallback(async (reviewId: string, data: UpdateReviewData): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response: ReviewDetailResponse = await reviewService.updateReview(reviewId, data);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Callback to refetch reviews
        return true;
      } else {
        throw new Error('Failed to update review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      console.error('[useCreateReview] Error updating review:', err);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [onSuccess, onError]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
    setIsUploadingImages(false);
    setIsUpdating(false);
  }, []);

  return {
    createReview,
    isSubmitting,
    uploadImages,
    isUploadingImages,
    checkPurchase,
    purchaseVerification,
    isCheckingPurchase,
    updateReview,
    isUpdating,
    error,
    success,
    clearError,
    reset,
  };
};
