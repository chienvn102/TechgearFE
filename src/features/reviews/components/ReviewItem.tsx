/**
 * ReviewItem Component
 * 
 * Purpose: Display single review with all information
 * 
 * Features:
 * - Customer name and avatar
 * - Verified purchase badge
 * - Star rating
 * - Review date (formatted)
 * - Review comment
 * - Review images with lightbox
 * - Helpful button with count
 * - Report button
 * - Edit/Delete buttons (if own review)
 * 
 * Usage:
 * <ReviewItem 
 *   review={review} 
 *   canEdit={isOwnReview}
 *   onUpdate={refetchReviews}
 * />
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StarRating } from './StarRating';
import { ReviewImages } from './ReviewImages';
import { useReviewActions } from '../hooks/useReviewActions';
import { getReviewAgeText, hasReviewImages } from '../types/review.types';
import type { ProductReview } from '../types/review.types';

interface ReviewItemProps {
  review: ProductReview;
  canEdit?: boolean; // Show edit/delete buttons
  showActions?: boolean; // Show helpful/report buttons
  onUpdate?: () => void; // Callback after update/delete
  onEdit?: (review: ProductReview) => void; // Open edit modal
  className?: string;
}

/**
 * ReviewItem Component
 */
export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  canEdit = false,
  showActions = true,
  onUpdate,
  onEdit,
  className = '',
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    markHelpful,
    reportReview,
    deleteReview,
    isMarkingHelpful,
    isReporting,
    isDeleting,
    error,
  } = useReviewActions({
    onSuccess: () => {
      onUpdate?.();
      setShowReportModal(false);
      setShowDeleteConfirm(false);
    },
  });

  /**
   * Handle mark as helpful
   */
  const handleMarkHelpful = useCallback(async () => {
    await markHelpful(review._id);
  }, [review._id, markHelpful]);

  /**
   * Handle report review
   */
  const handleReportSubmit = useCallback(async () => {
    if (!reportReason.trim()) {
      alert('Vui lòng nhập lý do báo cáo');
      return;
    }
    await reportReview(review._id, { reason: reportReason });
    setReportReason('');
  }, [review._id, reportReason, reportReview]);

  /**
   * Handle delete review
   */
  const handleDelete = useCallback(async () => {
    await deleteReview(review._id);
  }, [review._id, deleteReview]);

  /**
   * Get customer display name
   */
  const getCustomerName = (): string => {
    if (typeof review.customer_id === 'object' && review.customer_id) {
      return review.customer_id.cus_name || 'Anonymous';
    }
    return 'Customer';
  };

  /**
   * Get customer avatar (placeholder or real)
   */
  const getCustomerAvatar = (): string => {
    // Placeholder avatar based on first letter
    const name = getCustomerName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
  };

  return (
    <motion.div
      className={`review-item bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header: Avatar, Name, Date */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={getCustomerAvatar()}
            alt={getCustomerName()}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>

        {/* Name, Date, Verified Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {getCustomerName()}
            </h4>
            {review.is_verified_purchase && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-gray-500">
              {getReviewAgeText(review.created_at)}
            </span>
          </div>
        </div>

        {/* Edit/Delete buttons (if can edit) */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(review)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap break-words">
          {review.review_comment}
        </p>
      </div>

      {/* Review Images */}
      {hasReviewImages(review) && (
        <div className="mb-4">
          <ReviewImages images={review.review_images} maxDisplay={5} />
        </div>
      )}

      {/* Actions: Helpful, Report */}
      {showActions && (
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          {/* Helpful button */}
          <button
            onClick={handleMarkHelpful}
            disabled={isMarkingHelpful}
            className={`
              flex items-center gap-2 text-sm font-medium transition-colors
              ${isMarkingHelpful ? 'text-gray-400' : 'text-gray-600 hover:text-blue-600'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>Helpful ({review.helpful_count || 0})</span>
          </button>

          {/* Report button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            <span>Report</span>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Report Review</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why you're reporting this review..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReportSubmit}
                disabled={isReporting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isReporting ? 'Reporting...' : 'Submit Report'}
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewItem;
