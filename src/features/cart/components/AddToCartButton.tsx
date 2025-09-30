'use client';

import React, { useState } from 'react';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCartSimple } from '../hooks/useCartSimple';
import type { Product } from '../../../types';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  color?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onAddToCart?: () => void;
}

export function AddToCartButton({
  product,
  quantity = 1,
  color,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onAddToCart,
}: AddToCartButtonProps) {
  const { addToCart, loading, error, cart } = useCartSimple();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check if product is in cart (có thể implement logic check từ cart data)
  const isInCart = cart?.items?.some(item => item.product_id._id === product.pd_id) || false;
  const isLoading = loading;
  
  // Check if product is out of stock
  const isOutOfStock = !product.pd_quantity || product.pd_quantity <= 0;
  const isDisabled = disabled || isLoading || isOutOfStock;

  const handleAddToCart = async () => {
    if (isDisabled) return;

    try {
      const success = await addToCart(product.pd_id, quantity);
      if (success) {
        setShowSuccess(true);
        
        // Reset success state after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000);
        
        // Call optional callback
        onAddToCart?.();
      }
    } catch (error) {
      }
  };

  // Variant styles
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={`${baseClasses} ${sizeClasses} bg-gray-300 text-gray-500 cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  if (showSuccess) {
    return (
      <button
        disabled
        className={`${baseClasses} ${sizeClasses} bg-green-500 text-white ${className}`}
      >
        <CheckIcon className="h-5 w-5 mr-2" />
        Added to Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : (
        <>
          <ShoppingCartIcon className="h-5 w-5 mr-2" />
          {isInCart ? 'Add More' : 'Add to Cart'}
        </>
      )}
    </button>
  );
}
