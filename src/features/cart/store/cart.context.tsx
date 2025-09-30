'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { cartService } from '../services/cart.service';
import type { Cart, CartItem, Product } from '../../../types';

// Cart State
interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
}

// Cart Actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; color?: string } }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number; color?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; color?: string } }
  | { type: 'CLEAR_CART' };

// Cart Context
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  // Actions
  addToCart: (product: Product, quantity?: number, color?: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number, color?: string) => Promise<void>;
  removeFromCart: (productId: string, color?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  isProductInCart: (productId: string, color?: string) => boolean;
  loadCart: () => Promise<void>;
}

// Initial State
const initialState: CartState = {
  cart: { items: [], total: 0, itemCount: 0 },
  isLoading: false,
  error: null,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    
    default:
      return state;
  }
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on initialization
  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.getCart();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to load cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  // Add to cart
  const addToCart = async (product: Product, quantity: number = 1, color?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.addToCart(product, quantity, color);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to add item to cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  // Update cart item
  const updateCartItem = async (productId: string, quantity: number, color?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.updateCartItem(productId, quantity, color);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to update cart item' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
    }
  };

  // Remove from cart
  const removeFromCart = async (productId: string, color?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.removeFromCart(productId, color);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to remove item from cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.clearCart();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Failed to clear cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  // Get cart item count
  const getCartItemCount = (): number => {
    return state.cart.itemCount;
  };

  // Check if product is in cart
  const isProductInCart = (productId: string, color?: string): boolean => {
    return state.cart.items.some(
      item => item.product.pd_id === productId && item.selected_color === color
    );
  };

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const contextValue: CartContextType = {
    state,
    dispatch,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    isProductInCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export types
export type { CartState, CartAction, CartContextType };
