'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '@/services/paymentService';
import { VerifyPaymentResponse, PayOSStatus } from '@/types/payment.types';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/shared/components/ui/Button';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const orderId = searchParams.get('orderId');

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<VerifyPaymentResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) {
      setError('Thiếu mã thanh toán');
      setIsVerifying(false);
      return;
    }

    // Verify payment status with backend
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const response = await paymentService.verifyPayment(Number(orderCode));
        
        if (response.success && response.data) {
          setPaymentData(response.data);
          
          // Check if payment is actually completed
          if (response.data.payos_status !== PayOSStatus.PAID) {
            setError('Thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.');
          }
        } else {
          setError(response.message || 'Không thể xác minh thanh toán');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Có lỗi xảy ra khi xác minh thanh toán');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode]);

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else if (paymentData?.order_id) {
      router.push(`/orders/${paymentData.order_id}`);
    } else {
      router.push('/orders');
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
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
          <p className="text-gray-600">Đang xác minh thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi xác minh</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/cart')}
                className="flex-1"
              >
                Về giỏ hàng
              </Button>
              <Button
                variant="customer"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white mb-4"
          >
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-green-100">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-8 space-y-6">
          {paymentData && (
            <>
              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin thanh toán
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {paymentData.transaction_id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentData.order_id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Số tiền:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      {paymentData.payos_status === PayOSStatus.PAID ? 'Đã thanh toán' : paymentData.status}
                    </span>
                  </div>

                  {paymentData.completed_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5" />
                        Thời gian:
                      </span>
                      <span className="text-gray-900">
                        {new Date(paymentData.completed_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* PayOS Payment Info */}
              {paymentData.payment_info && (
                <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                  <h4 className="font-semibold text-gray-900">Chi tiết PayOS</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block">Mã thanh toán:</span>
                      <span className="font-mono font-semibold">{paymentData.payment_info.orderCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Đã thanh toán:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(paymentData.payment_info.amountPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Còn lại:</span>
                      <span className="font-semibold">
                        {formatCurrency(paymentData.payment_info.amountRemaining)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Trạng thái:</span>
                      <span className="font-semibold text-green-600">
                        {paymentData.payment_info.status}
                      </span>
                    </div>
                  </div>

                  {paymentData.payment_info.transactions && paymentData.payment_info.transactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Giao dịch ngân hàng</h5>
                      {paymentData.payment_info.transactions.map((txn, index) => (
                        <div key={index} className="text-sm space-y-1 bg-white rounded p-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã tham chiếu:</span>
                            <span className="font-mono text-xs">{txn.reference}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Số tiền:</span>
                            <span className="font-semibold">{formatCurrency(txn.amount)}</span>
                          </div>
                          {txn.description && (
                            <div className="text-gray-600 text-xs mt-1">
                              {txn.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Bước tiếp theo</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Đơn hàng của bạn đang được xử lý</li>
                  <li>Bạn sẽ nhận được email xác nhận sớm nhất</li>
                  <li>Theo dõi trạng thái đơn hàng trong tài khoản của bạn</li>
                  <li>Liên hệ hỗ trợ nếu có bất kỳ thắc mắc nào</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="customer"
                  onClick={handleViewOrder}
                  className="flex-1 flex items-center justify-center gap-2"
                  size="lg"
                >
                  Xem đơn hàng
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="flex-1"
                  size="lg"
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
