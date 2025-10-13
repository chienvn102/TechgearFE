// Cart Page - Trang giỏ hàng cho customer
// Theo CLEAN ARCHITECTURE + Backend API integration
// FIXED: Removed animation from cart items, kept animation for Order Summary

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/formatters';
import { authService } from '@/features/auth/services/authService';
import { getCurrentCustomerId } from '@/lib/auth';

export default function CartPage() {
  const router = useRouter();
  const { 
    items,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedItems,
    getSelectedTotal,
    requireAuth
  } = useCart();
  
  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      clearCart();
    }
  };
  
  const handleProceedToCheckout = async () => {
    const selectedItems = getSelectedItems();
    
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }
    
    requireAuth(() => {
      try {
        // Force navigation with page reload to ensure fresh state
        window.location.href = '/checkout';
      } catch (error) {
        // Fallback
        router.push('/checkout');
      }
    }, 'tiến hành thanh toán');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6 border h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            
            {items && items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 border border-red-200 
                         rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>
        </motion.div>

        {/* Empty Cart */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/products')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 
                       transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        )}

        {/* Cart Items */}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Select All */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={items.every(item => item.selected)}
                      onChange={() => {
                        if (items.every(item => item.selected)) {
                          deselectAllItems();
                        } else {
                          selectAllItems();
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Chọn tất cả ({items.length} sản phẩm)
                    </span>
                  </label>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item._id}
                    className={`bg-white rounded-lg shadow-sm border p-4 ${
                      item.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected || false}
                        onChange={() => toggleItemSelection(item._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.img ? (
                          <img 
                            src={item.img} 
                            alt={item.pd_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.pd_name || 'Sản phẩm không xác định'}
                        </h3>
                        {item.brand && (
                          <p className="text-sm text-gray-500">{item.brand}</p>
                        )}
                        {item.color && (
                          <p className="text-sm text-gray-500">Màu: {item.color}</p>
                        )}
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(item.pd_price || 0)}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity || 0}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cart Summary - KEEP ANIMATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Summary Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getSelectedItems().length} items selected)</span>
                    <span>{formatCurrency(getSelectedTotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(getSelectedTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleProceedToCheckout();
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || isEmpty}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>
                  
                  <button 
                    onClick={() => router.push('/products')}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
                
                {/* Security Note */}
                <div className="mt-6 text-xs text-gray-500 text-center">
                  🔒 Secure checkout with SSL encryption
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Recommended Products - KEEP ANIMATION */}
        {items && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Có thể bạn cũng thích
            </h3>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">
                Sản phẩm gợi ý sẽ được hiển thị ở đây
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
