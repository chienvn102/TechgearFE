// CartItem Component - Individual item trong cart
// Theo phongcachxanh.vn patterns với animations

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import type { CartItem } from '../../../types';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  className?: string;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  className
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    onUpdateQuantity(item.product.pd_id, newQuantity);
  };
  
  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.product.pd_id);
    }, 200);
  };
  
  const itemTotal = (item.product.pd_price || 0) * item.quantity;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? -50 : 0,
        scale: isRemoving ? 0.9 : 1
      }}
      exit={{ opacity: 0, x: -50, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-4
        hover:shadow-md transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
            {item.product.pd_name}
          </h4>
          
          <p className="text-xs text-gray-500 mb-2">
            ID: {item.product.pd_id}
          </p>
          
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="text-sm">
              <span className="font-semibold text-blue-600">
                {item.product.pd_price.toLocaleString('vi-VN')}₫
              </span>
              {item.quantity > 1 && (
                <span className="text-gray-500 text-xs ml-1">
                  × {item.quantity}
                </span>
              )}
            </div>
            
            {/* Total */}
            <div className="text-sm font-semibold text-gray-900">
              {itemTotal.toLocaleString('vi-VN')}₫
            </div>
          </div>
        </div>
      </div>
      
      {/* Quantity Controls & Remove */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 
                     hover:bg-gray-50 transition-colors"
          >
            <MinusIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <span className="w-12 text-center font-medium text-gray-900">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 
                     hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 
                   hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Xóa
        </button>
      </div>
    </motion.div>
  );
};

export default CartItemComponent;
