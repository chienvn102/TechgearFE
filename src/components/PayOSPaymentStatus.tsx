'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '@/services/paymentService';
import { VerifyPaymentResponse, PayOSStatus, PAYOS_PAYMENT_METHOD_ID } from '@/types/payment.types';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/shared/components/ui/Button';

interface PayOSPaymentStatusProps {
  orderId: string;
  paymentMethodId: string | { _id: string; pm_id: string; pm_name: string };
  paymentStatusName?: string;
}

export function PayOSPaymentStatus({ orderId, paymentMethodId, paymentStatusName }: PayOSPaymentStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);

  // Check if this order uses PayOS payment method
  const isPayOSOrder = () => {
    if (typeof paymentMethodId === 'object') {
      return paymentMethodId._id === PAYOS_PAYMENT_METHOD_ID || paymentMethodId.pm_id === PAYOS_PAYMENT_METHOD_ID;
    }
    return paymentMethodId === PAYOS_PAYMENT_METHOD_ID;
  };

  // Fetch PayOS payment status
  const fetchPaymentStatus = async () => {
    if (!paymentData?.payment_info?.orderCode) {
      setError('Không tìm thấy mã thanh toán PayOS');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const response = await paymentService.verifyPayment(paymentData.payment_info.orderCode);

      if (response.success && response.data) {
        setPaymentData(response.data);
        setLastVerified(new Date());
      } else {
        setError(response.message || 'Không thể xác minh thanh toán');
      }
    } catch (err) {
      setError('Có lỗi khi xác minh thanh toán PayOS');
    } finally {
      setIsVerifying(false);
    }
  };

  // Load payment data on mount
  useEffect(() => {
    if (!isPayOSOrder()) return;

    const loadPaymentData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch transactions for this order
        const transactionsResponse = await paymentService.getTransactions({
          page: 1,
          limit: 10
        });

        if (transactionsResponse.success && transactionsResponse.data) {
          // Find transaction for this order
          const transaction = transactionsResponse.data.transactions.find(
            (t: any) => t.order_id === orderId || (typeof t.order_id === 'object' && t.order_id._id === orderId)
          );

          if (transaction && transaction.payos_order_code) {
            // Verify payment status
            const verifyResponse = await paymentService.verifyPayment(transaction.payos_order_code);
            
            if (verifyResponse.success && verifyResponse.data) {
              setPaymentData(verifyResponse.data);
              setLastVerified(new Date());
            }
          }
        }
      } catch (err) {
        setError('Không thể tải dữ liệu thanh toán PayOS');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, [orderId]);

  // Don't render if not a PayOS order
  if (!isPayOSOrder()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
          />
          <span className="text-sm text-blue-700">Đang tải dữ liệu thanh toán PayOS...</span>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">Chưa có dữ liệu thanh toán PayOS</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (paymentData.payos_status) {
      case PayOSStatus.PAID:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case PayOSStatus.CANCELLED:
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case PayOSStatus.PENDING:
      case PayOSStatus.PROCESSING:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <CreditCardIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentData.payos_status) {
      case PayOSStatus.PAID:
        return 'bg-green-50 border-green-200 text-green-700';
      case PayOSStatus.CANCELLED:
        return 'bg-red-50 border-red-200 text-red-700';
      case PayOSStatus.PENDING:
      case PayOSStatus.PROCESSING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (paymentData.payos_status) {
      case PayOSStatus.PAID:
        return 'Đã thanh toán';
      case PayOSStatus.CANCELLED:
        return 'Đã hủy';
      case PayOSStatus.PENDING:
        return 'Chờ thanh toán';
      case PayOSStatus.PROCESSING:
        return 'Đang xử lý';
      default:
        return paymentData.status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5 text-blue-600" />
          Thanh toán PayOS
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPaymentStatus}
          disabled={isVerifying}
          className="text-xs"
        >
          {isVerifying ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full mr-1"
              />
              Đang kiểm tra...
            </>
          ) : (
            <>
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Làm mới
            </>
          )}
        </Button>
      </div>

      {/* Payment Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-semibold">{getStatusText()}</span>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600 block mb-1">Mã giao dịch:</span>
            <span className="font-mono text-xs font-semibold text-gray-900 break-all">
              {paymentData.transaction_id}
            </span>
          </div>

          <div>
            <span className="text-gray-600 block mb-1">Số tiền:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(paymentData.amount)}
            </span>
          </div>

          {paymentData.payment_info && (
            <>
              <div>
                <span className="text-gray-600 block mb-1">Mã PayOS:</span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  {paymentData.payment_info.orderCode}
                </span>
              </div>

              <div>
                <span className="text-gray-600 block mb-1">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentData.payment_info.amountPaid)}
                </span>
              </div>

              <div>
                <span className="text-gray-600 block mb-1">Còn lại:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentData.payment_info.amountRemaining)}
                </span>
              </div>

              <div>
                <span className="text-gray-600 block mb-1">Trạng thái PayOS:</span>
                <span className="font-semibold text-gray-900">
                  {paymentData.payment_info.status}
                </span>
              </div>
            </>
          )}

          {paymentData.completed_at && (
            <div className="col-span-2">
              <span className="text-gray-600 block mb-1">Thời gian hoàn thành:</span>
              <span className="text-sm text-gray-900">
                {new Date(paymentData.completed_at).toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Transactions */}
      {paymentData.payment_info?.transactions && paymentData.payment_info.transactions.length > 0 && (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Giao dịch ngân hàng</h4>
          {paymentData.payment_info.transactions.map((txn, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-gray-600">Mã tham chiếu:</span>
                  <p className="font-mono text-xs font-semibold text-gray-900 mt-1">{txn.reference}</p>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(txn.amount)}</span>
              </div>

              {txn.accountNumber && (
                <div>
                  <span className="text-gray-600">Số tài khoản:</span>
                  <p className="font-mono text-xs text-gray-900 mt-1">{txn.accountNumber}</p>
                </div>
              )}

              {txn.description && (
                <div>
                  <span className="text-gray-600">Mô tả:</span>
                  <p className="text-xs text-gray-700 mt-1">{txn.description}</p>
                </div>
              )}

              {txn.transactionDateTime && (
                <div>
                  <span className="text-gray-600">Thời gian:</span>
                  <p className="text-xs text-gray-900 mt-1">
                    {new Date(txn.transactionDateTime).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Reason */}
      {paymentData.payment_info?.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-900 mb-1">Lý do hủy</h4>
          <p className="text-sm text-red-700">{paymentData.payment_info.cancellationReason}</p>
        </div>
      )}

      {/* Last Verified */}
      {lastVerified && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-blue-100">
          Cập nhật lần cuối: {lastVerified.toLocaleTimeString('vi-VN')}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}
    </motion.div>
  );
}
