'use client';

import { CheckCircleIcon, ClockIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SimplePaymentStatusProps {
  paymentTransaction?: {
    status: string;
    amount?: number;
  } | null;
  paymentStatus?: {
    ps_name: string;
    color_code?: string;
    ps_description?: string;
  } | null;
}

/**
 * Simple Payment Status Display
 * Priority: payment_transaction.status > payment_status.ps_name
 */
export function SimplePaymentStatus({ paymentTransaction, paymentStatus }: SimplePaymentStatusProps) {
  
  // Get status display based on priority
  const getStatusDisplay = () => {
    // Priority 1: Use payment_transaction.status if available
    if (paymentTransaction && paymentTransaction.status) {
      const status = paymentTransaction.status.toUpperCase();
      
      switch (status) {
        case 'COMPLETED':
        case 'PAID':
          return {
            text: 'Đã thanh toán',
            color: '#10b981', // green-500
            description: 'Trạng thái từ PayOS Transaction',
            icon: CheckCircleIcon
          };
        
        case 'CANCELLED':
        case 'FAILED':
          return {
            text: 'Đã hủy',
            color: '#ef4444', // red-500
            description: 'Giao dịch đã bị hủy',
            icon: XCircleIcon
          };
        
        case 'PENDING':
          return {
            text: 'Chờ thanh toán',
            color: '#f59e0b', // amber-500
            description: 'Đang chờ thanh toán',
            icon: ClockIcon
          };
        
        case 'PROCESSING':
          return {
            text: 'Đang xử lý',
            color: '#3b82f6', // blue-500
            description: 'Đang xử lý giao dịch',
            icon: ClockIcon
          };
        
        default:
          return {
            text: paymentTransaction.status,
            color: '#6b7280', // gray-500
            description: 'Trạng thái giao dịch',
            icon: ExclamationTriangleIcon
          };
      }
    }

    // Priority 2: Use payment_status from database
    if (paymentStatus && paymentStatus.ps_name) {
      const Icon = getIconForStatus(paymentStatus.ps_name);
      
      return {
        text: paymentStatus.ps_name,
        color: paymentStatus.color_code || '#6b7280',
        description: paymentStatus.ps_description || 'Trạng thái thanh toán',
        icon: Icon
      };
    }

    // Fallback
    return {
      text: 'Chưa xác định',
      color: '#6b7280',
      description: 'Không có thông tin thanh toán',
      icon: ExclamationTriangleIcon
    };
  };

  const statusDisplay = getStatusDisplay();
  const Icon = statusDisplay.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Phương thức thanh toán
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full justify-center"
            style={{
              backgroundColor: statusDisplay.color + '20',
              color: statusDisplay.color,
              borderColor: statusDisplay.color + '40'
            }}
          >
            <Icon className="w-5 h-5" />
            {statusDisplay.text}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        {statusDisplay.description}
      </p>
    </div>
  );
}

// Helper function to get icon based on status name
function getIconForStatus(statusName: string): any {
  const name = statusName.toLowerCase();
  
  if (name.includes('paid') || name.includes('đã thanh toán') || name.includes('hoàn thành')) {
    return CheckCircleIcon;
  }
  if (name.includes('cancelled') || name.includes('hủy') || name.includes('failed')) {
    return XCircleIcon;
  }
  if (name.includes('pending') || name.includes('chờ')) {
    return ClockIcon;
  }
  
  return ExclamationTriangleIcon;
}
