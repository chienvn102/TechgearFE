// CartSummary Component - Tổng kết giỏ hàng
// Theo design patterns từ phongcachxanh.vn

'use client';

import { motion } from 'framer-motion';
import { 
  TicketIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import type { CartItem, Voucher } from '../types/cart.types';

interface CartSummaryProps {
  items: CartItem[];
  selectedVoucher?: Voucher | null;
  onApplyVoucher?: () => void;
  onRemoveVoucher?: () => void;
  onProceedToCheckout?: () => void;
  className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  selectedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  onProceedToCheckout,
  className
}) => {
  // Calculate totals
  const selectedItems = items.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => {
    return sum + (item.product.pd_price * item.quantity);
  }, 0);
  
  const itemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate voucher discount
  let voucherDiscount = 0;
  if (selectedVoucher && subtotal >= selectedVoucher.min_order_value) {
    if (selectedVoucher.discount_type === 'percentage') {
      voucherDiscount = (subtotal * selectedVoucher.discount_value) / 100;
      if (selectedVoucher.max_discount_amount) {
        voucherDiscount = Math.min(voucherDiscount, selectedVoucher.max_discount_amount);
      }
    } else {
      voucherDiscount = selectedVoucher.discount_value;
    }
  }
  
  // Shipping fee (could be dynamic based on location)
  const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k
  
  const total = Math.max(0, subtotal - voucherDiscount + shippingFee);
  
  const hasSelectedItems = selectedItems.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tổng kết đơn hàng
      </h3>
      
      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Tạm tính ({itemsCount} sản phẩm)
          </span>
          <span className="font-medium text-gray-900">
            {subtotal.toLocaleString('vi-VN')}₫
          </span>
        </div>
        
        {/* Voucher Discount */}
        {selectedVoucher && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <TicketIcon className="w-4 h-4" />
              Giảm giá ({selectedVoucher.voucher_name})
            </span>
            <span className="font-medium text-green-600">
              -{voucherDiscount.toLocaleString('vi-VN')}₫
            </span>
          </div>
        )}
        
        {/* Shipping Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <TruckIcon className="w-4 h-4" />
            Phí vận chuyển
          </span>
          <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
          </span>
        </div>
        
        {/* Free shipping notice */}
        {subtotal < 500000 && subtotal > 0 && (
          <div className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
            💡 Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển!
          </div>
        )}
      </div>
      
      {/* Voucher Section */}
      <div className="border-t border-gray-100 pt-4 mb-6">
        {selectedVoucher ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {selectedVoucher.voucher_name}
                </p>
                <p className="text-xs text-green-600">
                  Giảm {selectedVoucher.discount_type === 'percentage' 
                    ? `${selectedVoucher.discount_value}%`
                    : `${selectedVoucher.discount_value.toLocaleString('vi-VN')}₫`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveVoucher}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Bỏ chọn
            </button>
          </div>
        ) : (
          <button
            onClick={onApplyVoucher}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed 
                     border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 
                     transition-colors text-gray-600 hover:text-blue-600"
          >
            <TicketIcon className="w-5 h-5" />
            Chọn voucher giảm giá
          </button>
        )}
      </div>
      
      {/* Total */}
      <div className="border-t border-gray-100 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Tổng cộng
          </span>
          <span className="text-xl font-bold text-blue-600">
            {total.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
      
      {/* Checkout Button */}
      <motion.button
        whileHover={{ scale: hasSelectedItems ? 1.02 : 1 }}
        whileTap={{ scale: hasSelectedItems ? 0.98 : 1 }}
        onClick={onProceedToCheckout}
        disabled={!hasSelectedItems}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${hasSelectedItems
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        <CreditCardIcon className="w-5 h-5" />
        {hasSelectedItems 
          ? `Thanh toán (${itemsCount} sản phẩm)`
          : 'Chọn sản phẩm để thanh toán'
        }
      </motion.button>
      
      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        🔒 Thanh toán an toàn và bảo mật
      </div>
    </motion.div>
  );
};

export default CartSummary;
