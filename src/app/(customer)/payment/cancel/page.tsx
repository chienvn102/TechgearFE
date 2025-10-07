'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  XCircleIcon, 
  ArrowLeftIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '@/services/paymentService';
import { VerifyPaymentResponse, PayOSStatus } from '@/types/payment.types';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/shared/components/ui/Button';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) {
      setIsVerifying(false);
      return;
    }

    // Verify payment status to get cancellation details
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const response = await paymentService.verifyPayment(Number(orderCode));
        
        if (response.success && response.data) {
          setPaymentData(response.data);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Không thể xác minh trạng thái thanh toán');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode]);

  const handleRetryPayment = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else {
      router.push('/cart');
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Cancel Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white mb-4"
          >
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Thanh toán đã bị hủy
          </h1>
          <p className="text-red-100">
            Giao dịch thanh toán của bạn đã bị hủy hoặc không hoàn tất
          </p>
        </div>

        {/* Cancel Details */}
        <div className="p-8 space-y-6">
          {/* Cancellation Reason */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Lý do hủy
            </h3>
            <p className="text-gray-700">
              {reason || 
                paymentData?.payment_info?.cancellationReason || 
                'Người dùng đã hủy thanh toán hoặc thanh toán không hoàn tất trong thời gian quy định.'}
            </p>
          </div>

          {/* Payment Info if available */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin thanh toán
              </h3>
              
              <div className="space-y-3 text-sm">
                {paymentData.transaction_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono text-xs font-semibold text-gray-900">
                      {paymentData.transaction_id}
                    </span>
                  </div>
                )}

                {paymentData.order_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentData.order_id}
                    </span>
                  </div>
                )}

                {paymentData.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {paymentData.payos_status === PayOSStatus.CANCELLED 
                      ? 'Đã hủy' 
                      : paymentData.status}
                  </span>
                </div>

                {paymentData.payment_info?.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thời gian tạo:</span>
                    <span className="text-gray-900">
                      {new Date(paymentData.payment_info.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Bạn có thể làm gì tiếp theo?</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Thử thanh toán lại với phương thức khác</li>
              <li>Kiểm tra lại thông tin tài khoản ngân hàng</li>
              <li>Đảm bảo số dư tài khoản đủ để thanh toán</li>
              <li>Liên hệ hỗ trợ nếu bạn gặp vấn đề kỹ thuật</li>
              <li>Quay lại giỏ hàng để điều chỉnh đơn hàng</li>
            </ul>
          </div>

          {/* Help Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-1">Cần hỗ trợ?</h5>
                <p className="text-sm text-gray-600">
                  Nếu bạn gặp vấn đề khi thanh toán, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi qua hotline hoặc email.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="customer"
              onClick={handleRetryPayment}
              className="flex-1 flex items-center justify-center gap-2"
              size="lg"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Thử lại thanh toán
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToCart}
              className="flex-1 flex items-center justify-center gap-2"
              size="lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Về giỏ hàng
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={handleBackToHome}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
            >
              <HomeIcon className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
