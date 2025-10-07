/**
 * ProductReviews Container Component
 * 
 * Purpose: Main container integrating all review components
 * 
 * Features:
 * - Review statistics display
 * - Filter controls (rating, sort, verified, search)
 * - Review list with pagination
 * - Write review modal
 * - Refetch after CRUD operations
 * - Loading & error states
 * 
 * Usage:
 * <ProductReviews productId={productId} />
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  ReviewStatsDisplay,
  ReviewFilters,
  ReviewList,
  WriteReviewModal,
} from './index';
import { useReviews } from '../hooks/useReviews';
import { useReviewStats } from '../hooks/useReviewStats';
import type { ReviewFilters as ReviewFiltersType } from '../types/review.types';

interface ProductReviewsProps {
  productId: string;
}

/**
 * ProductReviews Container Component
 */
export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  // State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Hooks
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    pagination,
    filters,
    updateFilter,
    setPage,
    refetch,
    resetFilters,
  } = useReviews({ 
    productId,
    autoFetch: true,
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useReviewStats({ 
    productId,
    autoFetch: true,
  });

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((key: keyof ReviewFiltersType, value: any) => {
    updateFilter(key, value);
  }, [updateFilter]);

  /**
   * Handle reset filters
   */
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    
    // Scroll to top of reviews section
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [setPage]);

  /**
   * Handle review created/updated
   */
  const handleReviewSuccess = useCallback(() => {
    // Refetch reviews and stats
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  /**
   * Handle edit review
   */
  const handleEditReview = useCallback((review: any) => {
    // TODO: Implement edit functionality
    // For now, just open modal
    setIsWriteModalOpen(true);
  }, []);

  /**
   * Check if user can edit review
   */
  const canEditReview = useCallback((review: any): boolean => {
    // TODO: Implement proper user ID check
    // For now, return false (will be implemented with auth)
    return false;
  }, []);

  // Check if there are any reviews
  const hasReviews = reviews.length > 0;
  const hasStats = stats && stats.totalReviews > 0;

  return (
    <div id="reviews-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            {hasStats && (
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalReviews.toLocaleString()} đánh giá từ khách hàng
              </p>
            )}
          </div>
          
          <motion.button
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PencilSquareIcon className="h-5 w-5" />
            Viết đánh giá
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Statistics Section */}
        {hasStats ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReviewStatsDisplay 
                stats={stats} 
                loading={statsLoading}
              />
            </motion.div>
          </AnimatePresence>
        ) : !statsLoading && (
          <div className="text-center py-8">
            <svg 
              className="mx-auto h-16 w-16 text-gray-300 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        )}

        {/* Error Display */}
        {(statsError || reviewsError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {statsError || reviewsError}
            </p>
          </div>
        )}

        {/* Filters Section */}
        {hasReviews && (
          <div className="border-t border-gray-100 pt-6">
            <ReviewFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalCount={pagination.total}
            />
          </div>
        )}

        {/* Reviews List Section */}
        <div className="border-t border-gray-100 pt-6">
          <ReviewList
            reviews={reviews}
            loading={reviewsLoading}
            error={reviewsError}
            pagination={pagination}
            onPageChange={handlePageChange}
            canEditReview={canEditReview}
            onUpdate={handleReviewSuccess}
            onEditReview={handleEditReview}
          />
        </div>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        mode="create"
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default ProductReviews;
