// Cart Hook - Custom hook cho cart functionality
// Theo Clean Architecture pattern + Backend API integration

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  setCart,
  setCartCount,
  setLoading,
  setError,
  openCart,
  closeCart,
  setSelectedAddress,
  setSelectedPaymentMethod,
  setSelectedVoucher,
  setOrderNote,
  submitOrder,
  fetchAddresses,
  fetchPaymentMethods,
  fetchVouchers,
  selectCart,
  selectCartLoading,
  selectCartError,
  selectCartCount,
  selectCartIsOpen,
  selectCartTotal
} from '../store/cartSlice';
import type { 
  Cart, 
  AddToCartRequest, 
  UpdateCartRequest, 
  RemoveFromCartRequest 
} from '../types/cart.types';
import type { Product } from '@/lib/api';
import type { CustomerAddress, PaymentMethod, Voucher } from '../types/cart.types';

/**
 * Custom Hook for Cart functionality
 * Provides complete cart management với real backend integration
 */
export const useCart = (): CartActions & {
  // State
  items: ReturnType<typeof selectCartItems>;
  total: number;
  itemsCount: number;
  isOpen: boolean;
  selectedItems: ReturnType<typeof selectSelectedItems>;
  loading: boolean;
  error: string | null;
  
  // Async actions
  loadAddresses: () => Promise<void>;
  loadPaymentMethods: () => Promise<void>;
  loadVouchers: () => Promise<void>;
} => {
  const dispatch = useDispatch();
  
  // 🎯 Selectors
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const itemsCount = useSelector(selectCartItemsCount);
  const isOpen = useSelector(selectCartIsOpen);
  const selectedItems = useSelector(selectSelectedItems);
  const loading = useSelector((state: any) => state.cart.loading);
  const error = useSelector((state: any) => state.cart.error);
  
  // 🛒 Cart Actions
  const handleAddItem = useCallback((product: Product, quantity = 1) => {
    dispatch(addItem({ product, quantity }));
  }, [dispatch]);
  
  const handleRemoveItem = useCallback((productId: string) => {
    dispatch(removeItem(productId));
  }, [dispatch]);
  
  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch]);
  
  const handleToggleItemSelection = useCallback((productId: string) => {
    dispatch(toggleItemSelection(productId));
  }, [dispatch]);
  
  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);
  
  const handleOpenCart = useCallback(() => {
    dispatch(openCart());
  }, [dispatch]);
  
  const handleCloseCart = useCallback(() => {
    dispatch(closeCart());
  }, [dispatch]);
  
  // 🎯 Checkout Actions
  const handleSetSelectedAddress = useCallback((address: CustomerAddress) => {
    dispatch(setSelectedAddress(address));
  }, [dispatch]);
  
  const handleSetSelectedPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch(setSelectedPaymentMethod(method));
  }, [dispatch]);
  
  const handleSetSelectedVoucher = useCallback((voucher: Voucher | null) => {
    dispatch(setSelectedVoucher(voucher));
  }, [dispatch]);
  
  const handleSetOrderNote = useCallback((note: string) => {
    dispatch(setOrderNote(note));
  }, [dispatch]);
  
  const handleProceedToCheckout = useCallback(async () => {
    // Logic sẽ được implement trong checkout component
    }, []);
  
  // 🔄 Async Actions
  const loadAddresses = useCallback(async () => {
    await dispatch(fetchAddresses() as any);
  }, [dispatch]);
  
  const loadPaymentMethods = useCallback(async () => {
    await dispatch(fetchPaymentMethods() as any);
  }, [dispatch]);
  
  const loadVouchers = useCallback(async () => {
    await dispatch(fetchVouchers() as any);
  }, [dispatch]);
  
  return {
    // State
    items,
    total,
    itemsCount,
    isOpen,
    selectedItems,
    loading,
    error,
    
    // Actions
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    toggleItemSelection: handleToggleItemSelection,
    clearCart: handleClearCart,
    openCart: handleOpenCart,
    closeCart: handleCloseCart,
    
    // Checkout actions
    setSelectedAddress: handleSetSelectedAddress,
    setSelectedPaymentMethod: handleSetSelectedPaymentMethod,
    setSelectedVoucher: handleSetSelectedVoucher,
    setOrderNote: handleSetOrderNote,
    proceedToCheckout: handleProceedToCheckout,
    
    // Async actions
    loadAddresses,
    loadPaymentMethods,
    loadVouchers
  };
};

export default useCart;
