/**
 * Custom Hook: useReviewStats
 * Purpose: Fetch and manage product review statistics
 * 
 * Features:
 * - Fetch avg rating, total reviews, verified purchases
 * - Rating breakdown (1-5 stars distribution)
 * - Auto-refetch when productId changes
 * - Loading and error states
 * - Manual refetch for after review create/delete
 * 
 * Usage:
 * const { stats, loading, error, refetch } = useReviewStats(productId);
 */

import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import type { ReviewStats, ReviewStatsResponse } from '../types/review.types';

interface UseReviewStatsParams {
  productId: string;
  autoFetch?: boolean; // Auto-fetch on mount and productId change
}

interface UseReviewStatsReturn {
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
  hasReviews: boolean; // Helper: stats.totalReviews > 0
  averageRating: number; // Helper: quick access to avg rating
  totalReviews: number; // Helper: quick access to total
}

/**
 * Hook để fetch review statistics cho một product
 */
export const useReviewStats = ({
  productId,
  autoFetch = true,
}: UseReviewStatsParams): UseReviewStatsReturn => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch review stats từ API
   */
  const fetchStats = useCallback(async () => {
    if (!productId) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: ReviewStatsResponse = await reviewService.getProductReviewStats(productId);

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error('Failed to fetch review stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch review stats';
      setError(errorMessage);
      console.error('[useReviewStats] Error fetching stats:', err);
      
      // Set empty stats on error
      setStats({
        averageRating: 0,
        totalReviews: 0,
        verifiedPurchases: 0,
        totalImages: 0,
        ratingBreakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  /**
   * Auto-fetch on mount and when productId changes
   */
  useEffect(() => {
    if (autoFetch && productId) {
      fetchStats();
    }
  }, [fetchStats, autoFetch, productId]);

  /**
   * Manual refetch (useful after create/delete review)
   */
  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Helper computed values
   */
  const hasReviews = stats ? stats.totalReviews > 0 : false;
  const averageRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;

  return {
    stats,
    loading,
    error,
    refetch,
    clearError,
    hasReviews,
    averageRating,
    totalReviews,
  };
};

/**
 * Hook nhẹ hơn chỉ để lấy average rating (không cần full stats)
 * Useful cho product cards chỉ hiển thị rating stars
 */
export const useProductRating = (productId: string): {
  rating: number;
  totalReviews: number;
  loading: boolean;
} => {
  const { averageRating, totalReviews, loading } = useReviewStats({ 
    productId,
    autoFetch: true 
  });

  return {
    rating: averageRating,
    totalReviews,
    loading,
  };
};
