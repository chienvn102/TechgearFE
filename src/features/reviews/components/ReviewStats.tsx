/**
 * ReviewStats Component
 * 
 * Purpose: Display review statistics with visual breakdown
 * 
 * Features:
 * - Average rating (large display)
 * - Total review count
 * - Verified purchases count
 * - Rating breakdown chart (5-4-3-2-1 stars with bars)
 * - Percentage calculations
 * 
 * Usage:
 * <ReviewStats stats={stats} loading={loading} />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarRatingLarge } from './StarRating';
import { calculateRatingPercentage } from '../types/review.types';
import type { ReviewStats as ReviewStatsType } from '../types/review.types';

interface ReviewStatsProps {
  stats: ReviewStatsType | null;
  loading?: boolean;
  className?: string;
}

/**
 * Loading Skeleton
 */
const ReviewStatsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Average rating skeleton */}
        <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-8">
          <div className="h-16 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Right: Breakdown skeleton */}
        <div className="flex-1 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Rating Breakdown Bar
 */
const RatingBar: React.FC<{
  star: number;
  count: number;
  total: number;
}> = ({ star, count, total }) => {
  const percentage = calculateRatingPercentage(count, total);

  return (
    <div className="flex items-center gap-3">
      {/* Star label */}
      <div className="flex items-center gap-1 w-16 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">{star}</span>
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
        />
      </div>

      {/* Count */}
      <span className="text-sm font-medium text-gray-600 w-12 text-right">
        {count}
      </span>
    </div>
  );
};

/**
 * ReviewStatsDisplay Component
 */
export const ReviewStatsDisplay: React.FC<ReviewStatsProps> = ({
  stats,
  loading = false,
  className = '',
}) => {
  // Loading state
  if (loading) {
    return <ReviewStatsSkeleton />;
  }

  // No stats
  if (!stats) {
    return null;
  }

  const { averageRating, totalReviews, verifiedPurchases, ratingBreakdown } = stats;

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Average Rating */}
        <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-8">
          {/* Large rating number */}
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>

          {/* Stars */}
          <div className="mb-2">
            <StarRatingLarge rating={averageRating} />
          </div>

          {/* Review count */}
          <p className="text-sm text-gray-600">
            Based on {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
          </p>

          {/* Verified purchases */}
          {verifiedPurchases > 0 && (
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-green-700">
                {verifiedPurchases} verified purchase{verifiedPurchases !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Right: Rating Breakdown */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={ratingBreakdown[star as keyof typeof ratingBreakdown] || 0}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewStatsDisplay;
