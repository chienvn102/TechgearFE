// Auth utilities - helpers cho authentication
import type { User } from '@/types';

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

/**
 * Get stored user data
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user_data') || localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!(getAuthToken() && getCurrentUser());
};

/**
 * Get current customer ID (for cart operations)
 */
export const getCurrentCustomerId = (): string | null => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // Handle both string and object customer_id
  if (typeof user.customer_id === 'string') {
    return user.customer_id;
  } else if (user.customer_id && typeof user.customer_id === 'object') {
    return user.customer_id._id || user.customer_id.customer_id;
  }
  
  return user._id || null;
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user');
};

/**
 * Check if user is customer (not admin)
 */
export const isCustomer = (): boolean => {
  const user = getCurrentUser();
  // Check if user has customer_id (indicates customer user)
  return !!(user?.customer_id);
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  // Check if user has role_id (indicates admin user)
  return !!(user?.role_id);
};
