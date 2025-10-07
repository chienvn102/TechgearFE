/**
 * WriteReviewModal Component
 * 
 * Purpose: Modal for creating/editing product reviews
 * 
 * Features:
 * - Purchase verification check
 * - Interactive star selector (1-5)
 * - Comment textarea (10-5000 chars with validation)
 * - Image upload with preview (max 5 files)
 * - Order dropdown (if multiple purchases)
 * - Create/Edit modes
 * - Client + server validation
 * - Loading states for create + upload
 * - Error handling
 * 
 * Usage:
 * <WriteReviewModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   productId={productId}
 *   mode="create"
 *   onSuccess={refetchReviews}
 * />
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarRatingInteractive } from './StarRating';
import { useCreateReview } from '../hooks/useCreateReview';
import { REVIEW_VALIDATION } from '../types/review.types';
import type { ProductReview } from '../types/review.types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  mode?: 'create' | 'edit';
  existingReview?: ProductReview; // For edit mode
  onSuccess?: () => void;
}

/**
 * WriteReviewModal Component
 */
export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  mode = 'create',
  existingReview,
  onSuccess,
}) => {
  // Form state
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [comment, setComment] = useState<string>(existingReview?.review_comment || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Hook
  const {
    createReview,
    uploadImages,
    updateReview,
    isSubmitting,
    isUploadingImages,
    isUpdating,
    purchaseVerification,
    isCheckingPurchase,
    error: hookError,
    success,
    reset,
  } = useCreateReview({
    productId,
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  /**
   * Reset form when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.review_comment);
        setSelectedImages([]);
        setImagePreviews([]);
      } else {
        setRating(0);
        setComment('');
        setSelectedOrderId('');
        setSelectedImages([]);
        setImagePreviews([]);
      }
      setFormErrors({});
      reset();
    }
  }, [isOpen, mode, existingReview, reset]);

  /**
   * Auto-select order if only one purchase
   */
  useEffect(() => {
    if (purchaseVerification?.orders && purchaseVerification.orders.length === 1) {
      setSelectedOrderId(purchaseVerification.orders[0]._id);
    }
  }, [purchaseVerification]);

  /**
   * Handle image selection
   */
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate max images
    if (files.length + selectedImages.length > REVIEW_VALIDATION.MAX_IMAGES) {
      setFormErrors(prev => ({
        ...prev,
        images: `Maximum ${REVIEW_VALIDATION.MAX_IMAGES} images allowed`
      }));
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file type
      if (!REVIEW_VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      // Check file size
      const maxSizeBytes = REVIEW_VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: File too large (max ${REVIEW_VALIDATION.MAX_IMAGE_SIZE_MB}MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setFormErrors(prev => ({ ...prev, images: errors.join(', ') }));
      return;
    }

    // Update selected images
    const newImages = [...selectedImages, ...validFiles].slice(0, REVIEW_VALIDATION.MAX_IMAGES);
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Clear errors
    setFormErrors(prev => {
      const { images, ...rest } = prev;
      return rest;
    });
  }, [selectedImages]);

  /**
   * Remove image
   */
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Validate form
   */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate rating
    if (rating < 1 || rating > 5) {
      errors.rating = 'Please select a rating';
    }

    // Validate comment
    if (comment.trim().length < REVIEW_VALIDATION.MIN_COMMENT_LENGTH) {
      errors.comment = `Comment must be at least ${REVIEW_VALIDATION.MIN_COMMENT_LENGTH} characters`;
    }
    if (comment.length > REVIEW_VALIDATION.MAX_COMMENT_LENGTH) {
      errors.comment = `Comment must not exceed ${REVIEW_VALIDATION.MAX_COMMENT_LENGTH} characters`;
    }

    // Validate order selection (create mode only)
    if (mode === 'create' && !selectedOrderId) {
      errors.order = 'Please select an order';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [rating, comment, selectedOrderId, mode]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (mode === 'edit' && existingReview) {
      // Update existing review
      const success = await updateReview(existingReview._id, {
        rating,
        review_comment: comment,
      });

      if (success && selectedImages.length > 0) {
        // Upload new images if any
        await uploadImages(existingReview._id, selectedImages);
      }
    } else {
      // Create new review
      const reviewId = await createReview({
        pd_id: productId,
        order_id: selectedOrderId,
        rating,
        review_comment: comment,
      });

      if (reviewId) {
        if (selectedImages.length > 0) {
          // Upload images - onSuccess will be called after upload completes
          await uploadImages(reviewId, selectedImages);
        } else {
          // No images - trigger refetch and close modal immediately
          onSuccess?.();
          onClose();
        }
      }
    }
  }, [
    mode,
    existingReview,
    productId,
    selectedOrderId,
    rating,
    comment,
    selectedImages,
    validateForm,
    createReview,
    updateReview,
    uploadImages,
    onSuccess,
    onClose,
  ]);

  /**
   * Handle close with cleanup
   */
  const handleClose = useCallback(() => {
    // Revoke all object URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    onClose();
  }, [imagePreviews, onClose]);

  /**
   * Get character count color
   */
  const getCharCountColor = (): string => {
    if (comment.length < REVIEW_VALIDATION.MIN_COMMENT_LENGTH) return 'text-red-600';
    if (comment.length > REVIEW_VALIDATION.MAX_COMMENT_LENGTH - 100) return 'text-orange-600';
    return 'text-gray-500';
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Loading purchase verification
  if (isCheckingPurchase) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700">Verifying purchase...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not purchased
  if (mode === 'create' && !purchaseVerification?.hasPurchased) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Purchase Required
              </h3>
              <p className="text-gray-600 mb-6">
                You must purchase this product before you can write a review.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Already reviewed (create mode)
  if (mode === 'create' && purchaseVerification?.hasReviewed) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Already Reviewed
              </h3>
              <p className="text-gray-600 mb-6">
                You've already reviewed this product. You can edit your existing review instead.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full my-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Review' : 'Write a Review'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order selection (create mode only) */}
            {mode === 'create' && purchaseVerification?.orders && purchaseVerification.orders.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.order ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose your order...</option>
                  {purchaseVerification.orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      Order #{order.od_id} - {new Date(order.order_datetime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {formErrors.order && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.order}</p>
                )}
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <StarRatingInteractive
                  rating={rating}
                  onChange={setRating}
                  size="lg"
                />
                {rating > 0 && (
                  <span className="text-lg font-medium text-gray-700">
                    {rating} / 5
                  </span>
                )}
              </div>
              {formErrors.rating && (
                <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product... (minimum 10 characters)"
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  formErrors.comment ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {formErrors.comment ? (
                  <p className="text-sm text-red-600">{formErrors.comment}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Minimum {REVIEW_VALIDATION.MIN_COMMENT_LENGTH} characters
                  </p>
                )}
                <p className={`text-sm ${getCharCountColor()}`}>
                  {comment.length} / {REVIEW_VALIDATION.MAX_COMMENT_LENGTH}
                </p>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload up to {REVIEW_VALIDATION.MAX_IMAGES} images (JPG, PNG, WebP - max {REVIEW_VALIDATION.MAX_IMAGE_SIZE_MB}MB each)
              </p>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {selectedImages.length < REVIEW_VALIDATION.MAX_IMAGES && (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    Add Images ({selectedImages.length}/{REVIEW_VALIDATION.MAX_IMAGES})
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}

              {formErrors.images && (
                <p className="mt-1 text-sm text-red-600">{formErrors.images}</p>
              )}
            </div>

            {/* Error from hook */}
            {hookError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{hookError}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">
                  Review {mode === 'edit' ? 'updated' : 'submitted'} successfully!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting || isUploadingImages || isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImages || isUpdating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || isUpdating) && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
                {isUploadingImages && 'Uploading images...'}
                {(isSubmitting || isUpdating) && !isUploadingImages && (mode === 'edit' ? 'Updating...' : 'Submitting...')}
                {!isSubmitting && !isUploadingImages && !isUpdating && (mode === 'edit' ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WriteReviewModal;
