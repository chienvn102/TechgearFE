// features/cart/hooks/useCartSimple.ts
// Simple cart hook dùng Cart API backend (không Redux)

import { useState, useCallback, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { getCurrentCustomerId, isAuthenticated } from '@/lib/auth';
import type { 
  Cart, 
  AddToCartRequest, 
  UpdateCartRequest, 
  RemoveFromCartRequest 
} from '../types/cart.types';

/**
 * Simple Cart Hook - Business logic layer
 * Handles cart state và API calls với real authentication
 */
export const useCartSimple = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Get real customer ID từ authenticated user
  const customerId = getCurrentCustomerId();
  const isLoggedIn = isAuthenticated();

  /**
   * Load cart từ backend
   */
  const loadCart = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.getCart(customerId);
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.total_items);
      } else {
        setError(response.message || 'Failed to load cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  /**
   * Load cart count only
   */
  const loadCartCount = useCallback(async () => {
    if (!customerId) return;

    try {
      const response = await cartService.getCartCount(customerId);
      if (response.success) {
        setCartCount(response.data.total_items);
      }
    } catch (err) {
      }
  }, [customerId]);

  /**
   * Add product to cart
   */
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return false;
    }

    if (!customerId) {
      setError('Không tìm thấy thông tin khách hàng');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const request: AddToCartRequest = {
        customer_id: customerId,
        product_id: productId,
        quantity
      };

      const response = await cartService.addToCart(request);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.total_items);
        return true;
      } else {
        setError(response.message || 'Failed to add to cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId, isLoggedIn]);

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    if (!customerId) return false;

    setLoading(true);
    setError(null);

    try {
      const request: UpdateCartRequest = {
        customer_id: customerId,
        product_id: productId,
        quantity
      };

      const response = await cartService.updateCartItem(request);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.total_items);
        return true;
      } else {
        setError(response.message || 'Failed to update cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (productId: string) => {
    if (!customerId) return false;

    setLoading(true);
    setError(null);

    try {
      const request: RemoveFromCartRequest = {
        customer_id: customerId,
        product_id: productId
      };

      const response = await cartService.removeFromCart(request);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.total_items);
        return true;
      } else {
        setError(response.message || 'Failed to remove from cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    if (!customerId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await cartService.clearCart(customerId);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(0);
        return true;
      } else {
        setError(response.message || 'Failed to clear cart');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  /**
   * Load cart on mount
   */
  useEffect(() => {
    if (customerId) {
      loadCart();
    }
  }, [customerId, loadCart]);

  return {
    // State
    cart,
    loading,
    error,
    cartCount,
    
    // Actions
    loadCart,
    loadCartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Utilities
    isEmpty: !cart || cart.items.length === 0,
    totalAmount: cart?.total_amount || 0,
    itemsCount: cart?.total_items || 0
  };
};
