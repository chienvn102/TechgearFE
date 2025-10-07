// src/features/reviews/types/review.types.ts
// Product Review Types

export interface ReviewImage {
  image_url: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  uploaded_at: string | Date;
}

export interface ProductReview {
  _id: string;
  review_id: string;
  pd_id: {
    _id: string;
    pd_name: string;
    pd_price: number;
    pd_id?: string;
  };
  customer_id: {
    _id: string;
    cus_name: string;
    cus_id: string;
    cus_email?: string;
  };
  order_id?: {
    _id: string;
    od_id: string;
    order_datetime?: string | Date;
  };
  rating: number; // 1-5
  review_comment: string;
  review_images?: ReviewImage[];
  is_verified_purchase: boolean;
  is_hidden: boolean;
  hidden_at?: string | Date | null;
  hidden_by?: {
    _id: string;
    username: string;
    name?: string;
  } | null;
  hidden_reason?: string | null;
  helpful_count: number;
  reported_count: number;
  created_at: string | Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  verifiedPurchases: number;
  totalImages: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewData {
  pd_id: string;
  order_id: string;
  rating: number; // 1-5
  review_comment: string; // Min 10, max 5000 chars
}

export interface UpdateReviewData {
  rating?: number;
  review_comment?: string;
}

export interface ReviewFilters {
  product_id?: string;
  rating?: number; // 1-5 or undefined for all
  verified_only?: boolean;
  search?: string;
  sort_by?: 'date' | 'rating_high' | 'rating_low' | 'helpful';
  status?: 'all' | 'visible' | 'hidden'; // Admin only
}

export interface ReviewListResponse {
  success: boolean;
  data: {
    reviews: ProductReview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
  };
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

export interface ReviewDetailResponse {
  success: boolean;
  data: {
    review: ProductReview;
  };
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: {
    review: ProductReview;
  };
}

export interface UploadImagesResponse {
  success: boolean;
  message: string;
  data: {
    uploadedImages: ReviewImage[];
    totalImages: number;
  };
}

export interface HideReviewData {
  is_hidden: boolean;
  reason?: string;
}

export interface ReportReviewData {
  reason: string; // Max 500 chars
}

// Frontend-only types for UI state
export interface ReviewFormData {
  rating: number;
  review_comment: string;
  images: File[];
  order_id?: string;
}

export interface ReviewFormErrors {
  rating?: string;
  review_comment?: string;
  images?: string;
  order_id?: string;
}

export interface ReviewModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  review?: ProductReview; // For edit mode
  productId?: string; // For create mode
}

export interface PurchaseVerification {
  hasPurchased: boolean;
  orders?: Array<{
    _id: string;
    od_id: string;
    order_datetime: string;
  }>;
  hasReviewed: boolean;
  existingReview?: ProductReview;
}

// Admin-specific types
export interface AdminReviewFilters extends ReviewFilters {
  status: 'all' | 'visible' | 'hidden';
}

export interface AdminReviewAction {
  type: 'view' | 'hide' | 'show' | 'delete';
  reviewId: string;
  reason?: string; // For hide action
}

// Constants
export const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;
export const SORT_OPTIONS = [
  { value: 'date', label: 'Newest First' },
  { value: 'rating_high', label: 'Highest Rating' },
  { value: 'rating_low', label: 'Lowest Rating' },
  { value: 'helpful', label: 'Most Helpful' }
] as const;

export const ADMIN_STATUS_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'visible', label: 'Visible Only' },
  { value: 'hidden', label: 'Hidden Only' }
] as const;

// Validation constants
export const REVIEW_VALIDATION = {
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 5000,
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_REASON_LENGTH: 500
} as const;

// Helper type guards
export function isValidRating(rating: unknown): rating is number {
  return typeof rating === 'number' && rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

export function hasReviewImages(review: ProductReview): boolean {
  return Boolean(review.review_images && review.review_images.length > 0);
}

export function isReviewHidden(review: ProductReview): boolean {
  return review.is_hidden === true;
}

export function isReviewReported(review: ProductReview): boolean {
  return review.reported_count > 0;
}

export function canCustomerEditReview(review: ProductReview, customerId: string): boolean {
  return review.customer_id._id === customerId && !review.is_hidden;
}

// Format helpers
export function getReviewAgeText(createdAt: string | Date): string {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getRatingStarsArray(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}

export function calculateRatingPercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}
