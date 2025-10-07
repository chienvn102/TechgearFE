// src/features/reviews/services/reviewService.ts
// Product Review API Service

import axios, { AxiosError } from 'axios';
import {
  ProductReview,
  ReviewStats,
  CreateReviewData,
  UpdateReviewData,
  ReviewFilters,
  ReviewListResponse,
  ReviewStatsResponse,
  ReviewDetailResponse,
  CreateReviewResponse,
  UploadImagesResponse,
  HideReviewData,
  ReportReviewData,
  PurchaseVerification
} from '../types/review.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const REVIEWS_ENDPOINT = `${API_BASE_URL}/product-reviews`;

// Helper: Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Helper: Create auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper: Build query string from filters
const buildQueryString = (filters: ReviewFilters & { page?: number; limit?: number }): string => {
  const params = new URLSearchParams();
  
  if (filters.product_id) params.append('product_id', filters.product_id);
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.verified_only !== undefined) params.append('verified_only', filters.verified_only.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.status) params.append('status', filters.status); // Admin only
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  return params.toString();
};

class ReviewService {
  // ==========================================================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ==========================================================================

  /**
   * Get all reviews (public view - non-hidden only)
   */
  async getAllReviews(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewListResponse> {
    try {
      const queryString = buildQueryString({ ...filters, page, limit });
      const response = await axios.get<ReviewListResponse>(`${REVIEWS_ENDPOINT}?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews for specific product
   */
  async getProductReviews(
    productId: string,
    filters: Omit<ReviewFilters, 'product_id'> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewListResponse> {
    try {
      const queryString = buildQueryString({ ...filters, page, limit });
      const response = await axios.get<ReviewListResponse>(
        `${REVIEWS_ENDPOINT}/product/${productId}?${queryString}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get review statistics for a product
   */
  async getProductReviewStats(productId: string): Promise<ReviewStatsResponse> {
    try {
      const response = await axios.get<ReviewStatsResponse>(
        `${REVIEWS_ENDPOINT}/product/${productId}/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single review by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewDetailResponse> {
    try {
      const response = await axios.get<ReviewDetailResponse>(
        `${REVIEWS_ENDPOINT}/${reviewId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // CUSTOMER ENDPOINTS (Auth Required)
  // ==========================================================================

  /**
   * Check if customer has purchased a product
   * Returns purchase verification data
   */
  async checkPurchase(productId: string): Promise<PurchaseVerification> {
    try {
      const response = await axios.get<{ success: boolean; data: PurchaseVerification }>(
        `${REVIEWS_ENDPOINT}/product/${productId}/check-purchase`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error checking purchase:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new review
   * Requires purchase verification (order_id)
   */
  async createReview(data: CreateReviewData): Promise<CreateReviewResponse> {
    try {
      const response = await axios.post<CreateReviewResponse>(
        REVIEWS_ENDPOINT,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload review images
   * Max 5 images, 5MB each
   */
  async uploadReviewImages(reviewId: string, images: File[]): Promise<UploadImagesResponse> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.post<UploadImagesResponse>(
        `${REVIEWS_ENDPOINT}/${reviewId}/images`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading review images:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update own review
   */
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<CreateReviewResponse> {
    try {
      const response = await axios.put<CreateReviewResponse>(
        `${REVIEWS_ENDPOINT}/${reviewId}`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete own review
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(
        `${REVIEWS_ENDPOINT}/${reviewId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<{ success: boolean; data: { helpful_count: number } }> {
    try {
      const response = await axios.post<{ success: boolean; data: { helpful_count: number } }>(
        `${REVIEWS_ENDPOINT}/${reviewId}/helpful`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Report inappropriate review
   */
  async reportReview(reviewId: string, data: ReportReviewData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post<{ success: boolean; message: string }>(
        `${REVIEWS_ENDPOINT}/${reviewId}/report`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // ADMIN ENDPOINTS (Auth + Permission Required)
  // ==========================================================================

  /**
   * Get all reviews (admin view - includes hidden)
   */
  async getAllReviewsAdmin(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ReviewListResponse> {
    try {
      const queryString = buildQueryString({ ...filters, page, limit });
      const response = await axios.get<ReviewListResponse>(
        `${REVIEWS_ENDPOINT}/admin/all?${queryString}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Hide or unhide a review
   */
  async hideReview(reviewId: string, data: HideReviewData): Promise<CreateReviewResponse> {
    try {
      const response = await axios.put<CreateReviewResponse>(
        `${REVIEWS_ENDPOINT}/${reviewId}/hide`,
        data,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error hiding/unhiding review:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Permanently delete a review (admin only)
   */
  async deleteReviewAdmin(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(
        `${REVIEWS_ENDPOINT}/${reviewId}/admin`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting review (admin):', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get reported reviews
   */
  async getReportedReviews(
    page: number = 1,
    limit: number = 20
  ): Promise<ReviewListResponse> {
    try {
      const queryString = buildQueryString({ page, limit });
      const response = await axios.get<ReviewListResponse>(
        `${REVIEWS_ENDPOINT}/admin/reported?${queryString}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching reported reviews:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Handle API errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ success: boolean; message: string; error?: string }>;
      
      if (axiosError.response) {
        // Server responded with error
        const message = axiosError.response.data?.message || 
                       axiosError.response.data?.error || 
                       'An error occurred';
        return new Error(message);
      } else if (axiosError.request) {
        // Request made but no response
        return new Error('No response from server. Please check your connection.');
      }
    }
    
    // Unknown error
    return new Error('An unexpected error occurred');
  }

  /**
   * Validate image file before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPG, PNG, and WebP images are allowed'
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple images
   */
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const MAX_IMAGES = 5;
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push('At least one image is required');
    }

    if (files.length > MAX_IMAGES) {
      errors.push(`Maximum ${MAX_IMAGES} images allowed`);
    }

    files.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        errors.push(`Image ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate review comment
   */
  validateComment(comment: string): { valid: boolean; error?: string } {
    const MIN_LENGTH = 10;
    const MAX_LENGTH = 5000;

    if (!comment || comment.trim().length === 0) {
      return { valid: false, error: 'Review comment is required' };
    }

    if (comment.trim().length < MIN_LENGTH) {
      return { valid: false, error: `Comment must be at least ${MIN_LENGTH} characters` };
    }

    if (comment.length > MAX_LENGTH) {
      return { valid: false, error: `Comment must not exceed ${MAX_LENGTH} characters` };
    }

    return { valid: true };
  }

  /**
   * Validate rating
   */
  validateRating(rating: number): { valid: boolean; error?: string } {
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return { valid: false, error: 'Rating must be between 1 and 5' };
    }

    return { valid: true };
  }

  /**
   * Validate create review data
   */
  validateCreateReview(data: CreateReviewData): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    const ratingValidation = this.validateRating(data.rating);
    if (!ratingValidation.valid) {
      errors.rating = ratingValidation.error!;
    }

    const commentValidation = this.validateComment(data.review_comment);
    if (!commentValidation.valid) {
      errors.review_comment = commentValidation.error!;
    }

    if (!data.pd_id) {
      errors.pd_id = 'Product ID is required';
    }

    if (!data.order_id) {
      errors.order_id = 'Order ID is required for purchase verification';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
export default reviewService;
