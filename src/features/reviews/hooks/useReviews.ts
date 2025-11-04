/**
 * Custom Hook: useReviews
 * Purpose: Fetch and manage product reviews with filters, pagination, and sorting
 * 
 * Features:
 * - Fetch reviews for a specific product
 * - Filter by rating, verified purchases, search query
 * - Sort by date, rating, helpful count
 * - Pagination support
 * - Loading and error states
 * - Refetch functionality for after create/update/delete
 * 
 * Usage:
 * const { reviews, loading, error, pagination, filters, setFilters, setPage, refetch } = useReviews(productId);
 */

import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import type { 
  ProductReview, 
  ReviewFilters, 
  ReviewListResponse
} from '../types/review.types';

interface UseReviewsParams {
  productId?: string;
  initialFilters?: ReviewFilters;
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean; // Auto-fetch on mount
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseReviewsReturn {
  reviews: ProductReview[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: ReviewFilters;
  setFilters: (filters: ReviewFilters) => void;
  updateFilter: (key: keyof ReviewFilters, value: any) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: ReviewFilters = {
  rating: undefined,
  verified_only: false,
  search: '',
  sort_by: 'date',
};

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

/**
 * Hook để fetch và quản lý reviews của product
 */
export const useReviews = ({
  productId,
  initialFilters = DEFAULT_FILTERS,
  initialPage = 1,
  initialLimit = 10,
  autoFetch = true,
}: UseReviewsParams = {}): UseReviewsReturn => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReviewFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationInfo>({
    ...DEFAULT_PAGINATION,
    page: initialPage,
    limit: initialLimit,
  });

  /**
   * Fetch reviews từ API
   */
  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: ReviewListResponse = await reviewService.getProductReviews(
        productId,
        filters,
        pagination.page,
        pagination.limit
      );

      if (response.success && response.data) {
        setReviews(response.data.reviews);
        const pag = response.data.pagination;
        setPagination({
          page: pag.currentPage,
          limit: pag.limit,
          total: pag.totalRecords,
          totalPages: pag.totalPages,
        });
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      } finally {
      setLoading(false);
    }
  }, [productId, filters, pagination.page, pagination.limit]);

  /**
   * Auto-fetch on mount and when dependencies change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchReviews();
    }
  }, [fetchReviews, autoFetch]);

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: ReviewFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  }, []);

  /**
   * Update single filter property
   */
  const updateFilter = useCallback((key: keyof ReviewFilters, value: any) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  }, []);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change page limit
   */
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 })); // Reset to page 1 when limit changes
  }, []);

  /**
   * Refetch current data (useful after create/update/delete)
   */
  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    reviews,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    updateFilter,
    setPage,
    setLimit,
    refetch,
    clearError,
    resetFilters,
  };
};

/**
 * Hook đơn giản hơn để fetch all reviews (không filter theo product)
 */
export const useAllReviews = ({
  initialFilters = DEFAULT_FILTERS,
  initialPage = 1,
  initialLimit = 10,
  autoFetch = true,
}: Omit<UseReviewsParams, 'productId'> = {}): UseReviewsReturn => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReviewFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationInfo>({
    ...DEFAULT_PAGINATION,
    page: initialPage,
    limit: initialLimit,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ReviewListResponse = await reviewService.getAllReviews(
        filters,
        pagination.page,
        pagination.limit
      );

      if (response.success && response.data) {
        setReviews(response.data.reviews);
        const pag = response.data.pagination;
        setPagination({
          page: pag.currentPage,
          limit: pag.limit,
          total: pag.totalRecords,
          totalPages: pag.totalPages,
        });
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchReviews();
    }
  }, [fetchReviews, autoFetch]);

  const setFilters = useCallback((newFilters: ReviewFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateFilter = useCallback((key: keyof ReviewFilters, value: any) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    reviews,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    updateFilter,
    setPage,
    setLimit,
    refetch,
    clearError,
    resetFilters,
  };
};
