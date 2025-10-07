/**
 * ReviewFilters Component
 * 
 * Purpose: Filter controls for reviews
 * 
 * Features:
 * - Rating filter (all/5/4/3/2/1 stars)
 * - Verified purchases only toggle
 * - Sort options (date/rating_high/rating_low/helpful)
 * - Search input
 * - Clear filters button
 * 
 * Usage:
 * <ReviewFilters 
 *   filters={filters}
 *   onFilterChange={updateFilter}
 *   onReset={resetFilters}
 * />
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SORT_OPTIONS } from '../types/review.types';
import type { ReviewFilters as ReviewFiltersType } from '../types/review.types';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFilterChange: (key: keyof ReviewFiltersType, value: any) => void;
  onReset?: () => void;
  totalCount?: number; // Total review count for display
  className?: string;
}

/**
 * ReviewFiltersComponent
 */
export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  className = '',
}) => {
  const hasActiveFilters = 
    filters.rating !== undefined || 
    filters.verified_only === true || 
    (filters.search && filters.search.length > 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Filter controls */}
        <div className="flex-1 flex flex-wrap gap-3">
          {/* Rating filter */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => onFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Sort options */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort_by || 'date'}
              onChange={(e) => onFilterChange('sort_by', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Verified only toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified_only || false}
                onChange={(e) => onFilterChange('verified_only', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Only
              </span>
            </label>
          </div>

          {/* Search input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="Search reviews..."
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Clear filters & count */}
        <div className="flex items-end gap-3">
          {/* Total count */}
          {totalCount !== undefined && (
            <div className="text-sm text-gray-600 py-2">
              {totalCount.toLocaleString()} review{totalCount !== 1 ? 's' : ''}
            </div>
          )}

          {/* Clear filters button */}
          {hasActiveFilters && onReset && (
            <motion.button
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Filters
            </motion.button>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
          {filters.rating && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {filters.rating} Stars
              <button
                onClick={() => onFilterChange('rating', undefined)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.verified_only && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Verified Purchases Only
              <button
                onClick={() => onFilterChange('verified_only', false)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.search && filters.search.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
              Search: "{filters.search}"
              <button
                onClick={() => onFilterChange('search', '')}
                className="hover:bg-gray-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;
