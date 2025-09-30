'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { formatCurrency } from '@/utils/formatters';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
  img?: string;
  color?: string;
  brand?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  isSubmitting: boolean;
  onSubmit?: () => void;
  showCompleteButton?: boolean;
  isFormValid?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  isSubmitting,
  onSubmit,
  showCompleteButton = false,
  isFormValid = false,
  currentStep = 1,
  totalSteps = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.pd_price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const finalTotal = subtotal + shipping + tax;

  const displayedItems = showAllItems ? items : items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Items List */}
          <div className="p-6 border-b">
            <div className="space-y-4">
              {displayedItems.map((item) => (
                <div key={`${item._id}-${item.color}`} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <SafeImage
                      src={item.img}
                      alt={item.pd_name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-lg border border-gray-200"
                      fallbackSrc="/images/placeholder-product.svg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.pd_name}
                    </h3>
                    {item.color && item.color !== 'default' && (
                      <p className="text-xs text-gray-500">Màu: {item.color}</p>
                    )}
                    {item.brand && (
                      <p className="text-xs text-gray-500">Thương hiệu: {item.brand}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Số lượng: {item.quantity}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.pd_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show More/Less Button */}
              {hasMoreItems && (
                <button
                  onClick={() => setShowAllItems(!showAllItems)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 border-t border-gray-100"
                >
                  {showAllItems 
                    ? `Ẩn bớt (${items.length - 3} sản phẩm khác)`
                    : `Xem thêm ${items.length - 3} sản phẩm khác`
                  }
                </button>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Thuế (10%)</span>
              <span className="text-gray-900">{formatCurrency(tax)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Benefits */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <TruckIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span>Giao hàng miễn phí toàn quốc</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-600" />
                <span>Bảo hành chính hãng 12 tháng</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CreditCardIcon className="h-4 w-4 mr-2 text-purple-600" />
                <span>Thanh toán an toàn 100%</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {showCompleteButton && (
            <div className="p-6 border-t">
              <button
                type="button"
                onClick={() => {
                  onSubmit?.();
                }}
                disabled={isSubmitting || !isFormValid || currentStep < totalSteps}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isSubmitting || !isFormValid || currentStep < totalSteps
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting 
                  ? 'Đang xử lý...' 
                  : currentStep < totalSteps 
                    ? `Hoàn thành bước ${currentStep}/${totalSteps}`
                    : !isFormValid
                      ? 'Vui lòng điền đầy đủ thông tin'
                      : 'Hoàn thành đơn hàng'
                }
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
