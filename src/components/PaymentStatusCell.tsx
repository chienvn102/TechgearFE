'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { PayOSStatus, PAYOS_PAYMENT_METHOD_ID } from '@/types/payment.types';

interface PaymentStatusCellProps {
  paymentStatus: string | { 
    _id: string; 
    ps_name: string; 
    color_code?: string; 
  };
  paymentMethodId?: string | { _id: string; pm_id: string };
  payosOrderCode?: number | null;
}

export function PaymentStatusCell({ 
  paymentStatus,
  paymentMethodId,
  payosOrderCode
}: PaymentStatusCellProps) {
  const [displayStatus, setDisplayStatus] = useState<string>('');
  const [displayColor, setDisplayColor] = useState<string>('');

  // Check if this is a PayOS order
  const isPayOSOrder = () => {
    if (!paymentMethodId) return false;
    if (typeof paymentMethodId === 'object') {
      return paymentMethodId._id === PAYOS_PAYMENT_METHOD_ID || 
             paymentMethodId.pm_id === PAYOS_PAYMENT_METHOD_ID;
    }
    return paymentMethodId === PAYOS_PAYMENT_METHOD_ID;
  };

  // Fetch PayOS status
  useEffect(() => {
    const fetchPayOSStatus = async () => {
      if (!isPayOSOrder() || !payosOrderCode) {
        // Use database status
        if (typeof paymentStatus === 'object') {
          setDisplayStatus(paymentStatus.ps_name);
          setDisplayColor(paymentStatus.color_code || '#3b82f6');
        } else {
          setDisplayStatus(paymentStatus);
          setDisplayColor('#3b82f6');
        }
        return;
      }

      try {
        // Verify with PayOS
        const verifyResponse = await paymentService.verifyPayment(payosOrderCode);
        
        if (verifyResponse.success && verifyResponse.data) {
          const payosStatusValue = verifyResponse.data.payos_status;
          
          switch (payosStatusValue) {
            case PayOSStatus.PAID:
              setDisplayStatus('Đã thanh toán');
              setDisplayColor('#10b981');
              break;
            case PayOSStatus.CANCELLED:
              setDisplayStatus('Đã hủy');
              setDisplayColor('#ef4444');
              break;
            case PayOSStatus.PENDING:
              setDisplayStatus('Chờ thanh toán');
              setDisplayColor('#f59e0b');
              break;
            case PayOSStatus.PROCESSING:
              setDisplayStatus('Đang xử lý');
              setDisplayColor('#3b82f6');
              break;
            default:
              setDisplayStatus(verifyResponse.data.status || 'Unknown');
              setDisplayColor('#6b7280');
          }
        } else {
          // Fallback to database status
          if (typeof paymentStatus === 'object') {
            setDisplayStatus(paymentStatus.ps_name);
            setDisplayColor(paymentStatus.color_code || '#3b82f6');
          } else {
            setDisplayStatus(paymentStatus);
            setDisplayColor('#3b82f6');
          }
        }
      } catch (err) {
        // Silent fail - use database status
        if (typeof paymentStatus === 'object') {
          setDisplayStatus(paymentStatus.ps_name);
          setDisplayColor(paymentStatus.color_code || '#3b82f6');
        } else {
          setDisplayStatus(paymentStatus);
          setDisplayColor('#3b82f6');
        }
      }
    };

    fetchPayOSStatus();
  }, [paymentStatus, paymentMethodId, payosOrderCode]);

  return (
    <span 
      className="inline-flex px-2 py-1 rounded-full text-xs font-medium border truncate"
      style={{
        backgroundColor: displayColor + '20',
        color: displayColor,
        borderColor: displayColor + '40'
      }}
    >
      {displayStatus || 'Loading...'}
    </span>
  );
}
