'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '@/services/paymentService';
import { PayOSStatus, PAYOS_PAYMENT_METHOD_ID } from '@/types/payment.types';

interface PaymentStatusDisplayProps {
  orderId: string;
  paymentMethodId: string | { _id: string; pm_id: string; pm_name: string };
  paymentStatus: string | { 
    _id: string; 
    ps_name: string; 
    ps_description?: string; 
    color_code?: string; 
  };
  payosOrderCode?: number | null; // Add this prop to receive payos_order_code from order
}

export function PaymentStatusDisplay({ 
  orderId, 
  paymentMethodId, 
  paymentStatus,
  payosOrderCode
}: PaymentStatusDisplayProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [payosStatus, setPayosStatus] = useState<string | null>(null);
  const [payosColor, setPayosColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a PayOS order
  const isPayOSOrder = () => {
    if (typeof paymentMethodId === 'object') {
      return paymentMethodId._id === PAYOS_PAYMENT_METHOD_ID || 
             paymentMethodId.pm_id === PAYOS_PAYMENT_METHOD_ID;
    }
    return paymentMethodId === PAYOS_PAYMENT_METHOD_ID;
  };

  // Fetch PayOS payment status
  const fetchPayOSStatus = async () => {
    if (!isPayOSOrder()) return;

    // Check if we have payos_order_code from order
    if (!payosOrderCode) {
      console.log('No PayOS order code found for this order');
      setPayosStatus(null);
      setPayosColor(null);
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      // Verify payment directly with PayOS using order code
      const verifyResponse = await paymentService.verifyPayment(payosOrderCode);
      
      if (verifyResponse.success && verifyResponse.data) {
        const payosStatusValue = verifyResponse.data.payos_status;
        
        // Map PayOS status to display text and color
        let statusText = '';
        let statusColor = '';

        switch (payosStatusValue) {
          case PayOSStatus.PAID:
            statusText = 'Đã thanh toán (PayOS)';
            statusColor = '#10b981'; // green-500
            break;
          case PayOSStatus.CANCELLED:
            statusText = 'Đã hủy (PayOS)';
            statusColor = '#ef4444'; // red-500
            break;
          case PayOSStatus.PENDING:
            statusText = 'Chờ thanh toán (PayOS)';
            statusColor = '#f59e0b'; // amber-500
            break;
          case PayOSStatus.PROCESSING:
            statusText = 'Đang xử lý (PayOS)';
            statusColor = '#3b82f6'; // blue-500
            break;
          default:
            statusText = verifyResponse.data.status || 'Unknown';
            statusColor = '#6b7280'; // gray-500
        }

        setPayosStatus(statusText);
        setPayosColor(statusColor);
      } else {
        // Verify failed - use database status
        setPayosStatus(null);
        setPayosColor(null);
      }
      
    } catch (err) {
      console.error('Error fetching PayOS status:', err);
      // Silent fail - use database status as fallback
      setPayosStatus(null);
      setPayosColor(null);
      setError(null); // Don't show error, just use database status
    } finally {
      setIsVerifying(false);
    }
  };

  // Load PayOS status on mount if PayOS order
  useEffect(() => {
    if (isPayOSOrder()) {
      fetchPayOSStatus();
    }
  }, [orderId]);

  // Get status text and color
  const getStatusDisplay = () => {
    // If PayOS order and we have PayOS status, use it
    if (isPayOSOrder() && payosStatus && payosColor) {
      return {
        text: payosStatus,
        color: payosColor,
        description: 'Trạng thái real-time từ PayOS'
      };
    }

    // Otherwise use database status
    if (typeof paymentStatus === 'object') {
      return {
        text: paymentStatus.ps_name || 'N/A',
        color: paymentStatus.color_code || '#6b7280',
        description: paymentStatus.ps_description
      };
    }

    return {
      text: paymentStatus || 'N/A',
      color: '#6b7280',
      description: undefined
    };
  };

  const statusDisplay = getStatusDisplay();

  // Get status icon
  const getStatusIcon = () => {
    const text = statusDisplay.text.toLowerCase();
    
    if (text.includes('paid') || text.includes('đã thanh toán') || text.includes('hoàn thành')) {
      return <CheckCircleIcon className="w-4 h-4" />;
    }
    if (text.includes('cancelled') || text.includes('hủy')) {
      return <XCircleIcon className="w-4 h-4" />;
    }
    if (text.includes('pending') || text.includes('chờ') || text.includes('pending')) {
      return <ClockIcon className="w-4 h-4" />;
    }
    if (text.includes('processing') || text.includes('đang xử lý')) {
      return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
    }
    
    return <ExclamationTriangleIcon className="w-4 h-4" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          Trạng thái thanh toán
        </label>
        {isPayOSOrder() && (
          <button
            onClick={fetchPayOSStatus}
            disabled={isVerifying}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
            title="Làm mới trạng thái từ PayOS"
          >
            <ArrowPathIcon className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Đang tải...' : 'Làm mới'}
          </button>
        )}
      </div>

      <div className="relative">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border w-full justify-center"
          style={{
            backgroundColor: statusDisplay.color + '20',
            color: statusDisplay.color,
            borderColor: statusDisplay.color + '40'
          }}
        >
          {getStatusIcon()}
          {statusDisplay.text}
        </span>

        {statusDisplay.description && (
          <p className="text-xs text-gray-600 mt-1">{statusDisplay.description}</p>
        )}

        {error && (
          <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
