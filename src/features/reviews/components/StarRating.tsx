/**
 * StarRating Component
 * 
 * Purpose: Display and interactive star rating component
 * 
 * Features:
 * - Display mode: Show filled/empty stars (read-only)
 * - Interactive mode: Click to select rating (for forms)
 * - Hover effects for better UX
 * - Customizable size (sm, md, lg)
 * - Half-star support (display only)
 * - Accessible (keyboard navigation, ARIA labels)
 * 
 * Usage:
 * // Display mode
 * <StarRating rating={4.5} size="md" />
 * 
 * // Interactive mode
 * <StarRating rating={rating} interactive onChange={setRating} />
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number; // 0-5, supports decimals for display
  interactive?: boolean; // Enable click/hover for selection
  onChange?: (rating: number) => void; // Callback when rating changes
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCount?: boolean; // Show rating number next to stars
  count?: number; // Total review count
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * StarRating Component
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  showCount = false,
  count,
  className = '',
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Normalize rating to 0-5 range
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const displayRating = hoverRating !== null ? hoverRating : normalizedRating;

  /**
   * Handle star click (interactive mode only)
   */
  const handleStarClick = useCallback((starValue: number) => {
    if (!interactive || disabled) return;
    onChange?.(starValue);
  }, [interactive, disabled, onChange]);

  /**
   * Handle mouse enter on star (interactive mode only)
   */
  const handleStarHover = useCallback((starValue: number) => {
    if (!interactive || disabled) return;
    setHoverRating(starValue);
  }, [interactive, disabled]);

  /**
   * Handle mouse leave from stars container
   */
  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    setHoverRating(null);
  }, [interactive]);

  /**
   * Get fill percentage for a star (for half-star display)
   */
  const getStarFillPercentage = (starIndex: number): number => {
    const diff = displayRating - starIndex;
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return diff * 100; // For half stars
  };

  /**
   * Render single star
   */
  const renderStar = (starIndex: number) => {
    const fillPercentage = getStarFillPercentage(starIndex);
    const isFilled = fillPercentage > 0;
    const isHovered = hoverRating !== null && starIndex < hoverRating;

    return (
      <motion.button
        key={starIndex}
        type="button"
        onClick={() => handleStarClick(starIndex + 1)}
        onMouseEnter={() => handleStarHover(starIndex + 1)}
        disabled={!interactive || disabled}
        className={`
          relative inline-block
          ${sizeClasses[size]}
          ${interactive && !disabled ? 'cursor-pointer' : 'cursor-default'}
          ${interactive && !disabled ? 'hover:scale-110' : ''}
          transition-transform duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded
        `}
        whileHover={interactive && !disabled ? { scale: 1.1 } : {}}
        whileTap={interactive && !disabled ? { scale: 0.95 } : {}}
        aria-label={`${starIndex + 1} star${starIndex > 0 ? 's' : ''}`}
        tabIndex={interactive && !disabled ? 0 : -1}
      >
        {/* Background star (empty) */}
        <svg
          className={`
            absolute inset-0 w-full h-full
            ${isFilled || isHovered ? 'text-gray-300' : 'text-gray-300'}
          `}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Foreground star (filled) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <svg
            className={`
              w-full h-full
              ${isHovered ? 'text-yellow-500' : 'text-yellow-400'}
              transition-colors duration-200
            `}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </motion.button>
    );
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={`Rating: ${normalizedRating.toFixed(1)} out of 5 stars`}
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>

      {/* Rating number and count */}
      {showCount && (
        <span className={`ml-2 ${textSizeClasses[size]} text-gray-700 font-medium`}>
          {normalizedRating.toFixed(1)}
          {count !== undefined && (
            <span className="text-gray-500 font-normal ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
};

/**
 * Compact version for product cards (read-only, small)
 */
export const StarRatingCompact: React.FC<{
  rating: number;
  count?: number;
  className?: string;
}> = ({ rating, count, className = '' }) => {
  return (
    <StarRating
      rating={rating}
      size="sm"
      showCount
      count={count}
      className={className}
    />
  );
};

/**
 * Large version for stats display
 */
export const StarRatingLarge: React.FC<{
  rating: number;
  count?: number;
  className?: string;
}> = ({ rating, count, className = '' }) => {
  return (
    <StarRating
      rating={rating}
      size="xl"
      showCount
      count={count}
      className={className}
    />
  );
};

/**
 * Interactive version for forms
 */
export const StarRatingInteractive: React.FC<{
  rating: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}> = ({ rating, onChange, size = 'lg', disabled = false, className = '' }) => {
  return (
    <StarRating
      rating={rating}
      interactive
      onChange={onChange}
      size={size}
      disabled={disabled}
      className={className}
    />
  );
};

export default StarRating;
