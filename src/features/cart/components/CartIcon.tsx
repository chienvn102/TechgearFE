'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartSimple } from '../hooks/useCartSimple';

interface CartIconProps {
  className?: string;
  showBadge?: boolean;
}

export function CartIcon({ className = '', showBadge = true }: CartIconProps) {
  const { cartCount } = useCartSimple();
  const itemCount = cartCount;

  return (
    <Link 
      href="/cart" 
      className={`relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCartIcon className="h-6 w-6" />
      
      {showBadge && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center min-w-[20px]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
