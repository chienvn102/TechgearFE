/**
 * ReviewList Component
 * 
 * Purpose: Display list of reviews with pagination
 * 
 * Features:
 * - Map ReviewItem components
 * - Pagination controls
 * - Empty state message
 * - Loading skeleton
 * - Sort indicator
 * 
 * Usage:
 * <ReviewList 
 *   reviews={reviews}
 *   loading={loading}
 *   pagination={pagination}
 *   onPageChange={setPage}
 * />
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewItem } from './ReviewItem';
import type { ProductReview } from '../types/review.types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReviewListProps {
  reviews: ProductReview[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  canEditReview?: (review: ProductReview) => boolean; // Function to check if user can edit
  onUpdate?: () => void; // Refetch callback
  onEditReview?: (review: ProductReview) => void; // Edit callback
  className?: string;
}

/**
 * Loading Skeleton for ReviewItem
 */
const ReviewItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState: React.FC<{ message?: string }> = ({ 
  message = 'No reviews yet. Be the first to review this product!' 
}) => {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-24 w-24 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

/**
 * Pagination Component
 */
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with ellipsis
      if (currentPage <= 3) {
        // Near start: 1 2 3 4 ... 10
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 ... 7 8 9 10
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: 1 ... 4 5 6 ... 10
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  px-4 py-2 rounded-lg border transition-colors
                  ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};

/**
 * ReviewList Component
 */
export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  canEditReview,
  onUpdate,
  onEditReview,
  className = '',
}) => {
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <ReviewItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!reviews || reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      {/* Reviews list */}
      <AnimatePresence mode="wait">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReviewItem
                review={review}
                canEdit={canEditReview?.(review)}
                showActions={true}
                onUpdate={onUpdate}
                onEdit={onEditReview}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ReviewList;
