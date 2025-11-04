/**
 * Custom Hook: useReviewActions
 * Purpose: Handle review actions (helpful, report, delete)
 * 
 * Features:
 * - Mark review as helpful (with optimistic update)
 * - Report review
 * - Delete own review
 * - Loading states for each action
 * - Error handling
 * - Success callbacks
 * 
 * Usage:
 * const { 
 *   markHelpful, 
 *   reportReview, 
 *   deleteReview,
 *   isMarkingHelpful,
 *   isReporting,
 *   isDeleting,
 *   error
 * } = useReviewActions({ onSuccess: () => refetchReviews() });
 */

import { useState, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import type { ReportReviewData } from '../types/review.types';

interface UseReviewActionsParams {
  onSuccess?: () => void; // Callback after successful action
  onError?: (error: string) => void; // Callback on error
}

interface UseReviewActionsReturn {
  // Mark helpful
  markHelpful: (reviewId: string) => Promise<boolean>;
  isMarkingHelpful: boolean;
  
  // Report review
  reportReview: (reviewId: string, data: ReportReviewData) => Promise<boolean>;
  isReporting: boolean;
  
  // Delete review
  deleteReview: (reviewId: string) => Promise<boolean>;
  isDeleting: boolean;
  
  // State
  error: string | null;
  success: boolean;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook để xử lý các actions trên review
 */
export const useReviewActions = ({
  onSuccess,
  onError,
}: UseReviewActionsParams = {}): UseReviewActionsReturn => {
  const [isMarkingHelpful, setIsMarkingHelpful] = useState<boolean>(false);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Mark review as helpful
   */
  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    setIsMarkingHelpful(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reviewService.markHelpful(reviewId);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Refetch to update helpful count
        return true;
      } else {
        throw new Error('Failed to mark review as helpful');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark review as helpful';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsMarkingHelpful(false);
    }
  }, [onSuccess, onError]);

  /**
   * Report review
   */
  const reportReview = useCallback(async (reviewId: string, data: ReportReviewData): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    if (!data.reason || data.reason.trim().length === 0) {
      setError('Vui lòng nhập lý do báo cáo');
      return false;
    }

    setIsReporting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reviewService.reportReview(reviewId, data);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Refetch to update reported count
        return true;
      } else {
        throw new Error(response.message || 'Failed to report review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report review';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsReporting(false);
    }
  }, [onSuccess, onError]);

  /**
   * Delete own review
   */
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reviewService.deleteReview(reviewId);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Refetch to remove deleted review
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
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
    setIsMarkingHelpful(false);
    setIsReporting(false);
    setIsDeleting(false);
  }, []);

  return {
    markHelpful,
    isMarkingHelpful,
    reportReview,
    isReporting,
    deleteReview,
    isDeleting,
    error,
    success,
    clearError,
    reset,
  };
};

/**
 * Hook riêng cho admin actions (hide/delete)
 */
interface UseAdminReviewActionsReturn {
  hideReview: (reviewId: string, isHidden: boolean, reason?: string) => Promise<boolean>;
  deleteReviewAdmin: (reviewId: string) => Promise<boolean>;
  isHiding: boolean;
  isDeletingAdmin: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
}

export const useAdminReviewActions = ({
  onSuccess,
  onError,
}: UseReviewActionsParams = {}): UseAdminReviewActionsReturn => {
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Hide/unhide review (admin only)
   */
  const hideReview = useCallback(async (
    reviewId: string, 
    isHidden: boolean, 
    reason?: string
  ): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    if (isHidden && (!reason || reason.trim().length === 0)) {
      setError('Vui lòng nhập lý do ẩn đánh giá');
      return false;
    }

    setIsHiding(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reviewService.hideReview(reviewId, { is_hidden: isHidden, reason });

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Refetch reviews
        return true;
      } else {
        throw new Error(response.message || 'Failed to hide review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to hide review';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsHiding(false);
    }
  }, [onSuccess, onError]);

  /**
   * Delete review permanently (admin only)
   */
  const deleteReviewAdmin = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!reviewId) {
      setError('Review ID is required');
      return false;
    }

    setIsDeletingAdmin(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await reviewService.deleteReviewAdmin(reviewId);

      if (response.success) {
        setSuccess(true);
        onSuccess?.(); // Refetch reviews
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsDeletingAdmin(false);
    }
  }, [onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    hideReview,
    deleteReviewAdmin,
    isHiding,
    isDeletingAdmin,
    error,
    success,
    clearError,
  };
};
