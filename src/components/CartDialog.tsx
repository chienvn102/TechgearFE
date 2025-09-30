'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { SafeImage } from '@/shared/components/ui/SafeImage';

interface CartItem {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
  img?: string;
  color?: string;
  brand?: string;
  selected?: boolean;
}

interface CartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onToggleSelection?: (itemId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export const CartDialog: React.FC<CartDialogProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onToggleSelection,
  onSelectAll,
  onDeselectAll
}) => {
  const [total, setTotal] = useState(0);

  // Calculate total when items change - only selected items
  useEffect(() => {
    if (Array.isArray(items)) {
      const selectedItems = items.filter(item => item.selected);
      const newTotal = selectedItems.reduce((sum, item) => sum + (item.pd_price * item.quantity), 0);
      setTotal(newTotal);
    } else {
      setTotal(0);
    }
  }, [items]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Cart Dialog */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">i</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Select All */}
            {Array.isArray(items) && items.length > 0 && onToggleSelection && (
              <div className="px-6 py-3 border-b border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={items.every(item => item.selected)}
                    onChange={() => {
                      if (items.every(item => item.selected)) {
                        onDeselectAll?.();
                      } else {
                        onSelectAll?.();
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Chọn tất cả ({items.length} sản phẩm)
                  </span>
                </label>
              </div>
            )}

            {/* Free Shipping Banner */}
            <div className="mx-6 mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-600 text-sm font-medium text-center">
                Bạn được giao hàng miễn phí!
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {!Array.isArray(items) || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <p className="text-lg font-medium">Giỏ hàng trống</p>
                  <p className="text-sm">Hãy thêm sản phẩm vào giỏ hàng</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 p-4 rounded-lg ${
                        item.selected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      {onToggleSelection && (
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() => onToggleSelection(item._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-2"
                        />
                      )}
                      
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={item.img || undefined}
                          alt={item.pd_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          fallbackSrc="/images/placeholder-product.svg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.pd_name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600 mb-1">
                          {formatPrice(item.pd_price)}₫
                        </p>
                        {item.color && (
                          <p className="text-xs text-gray-600 mb-2">
                            Màu: {item.color}
                          </p>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <MinusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                              className="w-12 h-8 text-center border-0 focus:ring-0 text-sm font-medium"
                              min="1"
                            />
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                          >
                            Bỏ
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {Array.isArray(items) && items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng ({items.filter(item => item.selected).length} sản phẩm)
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(total)} VND
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/';
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Về trang chủ
                  </button>
                  <button
                    onClick={onCheckout}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Thanh toán
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
