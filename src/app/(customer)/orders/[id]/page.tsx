// app/(customer)/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { orderService, Order } from '@/features/orders/services/orderService';
import { paymentService, PayOSPaymentData } from '@/services/paymentService';
import { PayOSPaymentDialog } from '@/components/PayOSPaymentDialog';
import { PaymentStatusDisplay } from '@/components/PaymentStatusDisplay';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PayOS payment states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<PayOSPaymentData | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load order details
  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading order:', orderId);
      
      const response = await orderService.getOrderById(orderId);
      
      console.log('📦 Order response:', response);
      console.log('📦 Order data:', response.data);
      
      if (response.success && response.data) {
        const orderData = response.data;
        console.log('📦 Order loaded:', {
          od_id: orderData.od_id,
          pm_id: orderData.pm_id,
          payment_status_id: orderData.payment_status_id,
          payos_order_code: orderData.payos_order_code
        });
        
        setOrder(orderData);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (err: any) {
      console.error('❌ Failed to load order:', err);
      setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Check if order is PayOS and unpaid
  const isPayOSOrder = order?.pm_id?.pm_name?.toLowerCase().includes('payos') || 
                        order?.pm_id?.pm_name?.toLowerCase().includes('qr');
  const isUnpaid = order?.payment_status_id?.ps_name === 'UNPAID' || 
                   order?.payment_status_id?.ps_name === 'PENDING';
  const canRetryPayment = isPayOSOrder && isUnpaid;
  
  // Debug logs
  if (order) {
    console.log('🔍 Order payment check:', {
      pm_name: order.pm_id?.pm_name,
      isPayOSOrder,
      ps_name: order.payment_status_id?.ps_name,
      isUnpaid,
      canRetryPayment,
      payos_order_code: order.payos_order_code
    });
  }

  // Handle retry payment
  const handleRetryPayment = async () => {
    if (!order) return;

    try {
      setCreatingPayment(true);
      setPaymentError(null);

      console.log('🔄 Creating retry payment for order:', order._id);
      
      const response = await paymentService.createPayOSPayment({
        order_id: order._id,
        customer_name: order.customer_name,
        customer_email: order.customer_id?.email || '',
        customer_phone: order.customer_id?.phone_number || ''
      });
      
      console.log('✅ Payment created:', response);

      if (response.success && response.data) {
        setPaymentData(response.data);
        setShowPaymentDialog(true);
      } else {
        setPaymentError(response.message || 'Không thể tạo link thanh toán');
      }
    } catch (err: any) {
      console.error('Failed to create payment:', err);
      setPaymentError(err.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setCreatingPayment(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (orderCode: number) => {
    setShowPaymentDialog(false);
    setPaymentData(null);
    
    // Reload order to get updated status
    loadOrder();
    
    // Show success message
    alert('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
  };

  // Handle payment cancel
  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setPaymentData(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy đơn hàng'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết đơn hàng
              </h1>
              <p className="text-gray-600 mt-1">#{order.od_id}</p>
            </div>
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Quay lại
            </button>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Ngày đặt:</span>
              <p className="font-semibold text-gray-800">
                {new Date(order.order_datetime).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Tổng tiền:</span>
              <p className="font-semibold text-blue-600 text-lg">
                {formatCurrency(order.order_total)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Phương thức thanh toán:</span>
              <p className="font-semibold text-gray-800">
                {order.pm_id?.pm_name || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái thanh toán:</span>
              <p className="font-semibold text-gray-800">
                {order.payment_status_id?.ps_name || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Status for PayOS Orders */}
        {isPayOSOrder && order.payos_order_code && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Trạng thái thanh toán PayOS
            </h2>
            <PaymentStatusDisplay 
              orderId={order._id}
              paymentMethodId={order.pm_id}
              paymentStatus={order.payment_status_id}
              payosOrderCode={order.payos_order_code || null}
            />
          </motion.div>
        )}

        {/* Retry Payment Section */}
        {canRetryPayment && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-md p-6 mb-6 border-2 border-orange-200"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Đơn hàng chưa được thanh toán
                </h3>
                <p className="text-orange-700 mb-4">
                  Vui lòng hoàn tất thanh toán để đơn hàng được xử lý. 
                  Đơn hàng sẽ bị hủy nếu không thanh toán trong vòng 24 giờ.
                </p>
                
                {paymentError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                )}

                <button
                  onClick={handleRetryPayment}
                  disabled={creatingPayment}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {creatingPayment ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Đang tạo thanh toán...</span>
                    </span>
                  ) : (
                    '💳 Thanh toán ngay'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Địa chỉ giao hàng
          </h2>
          <div className="text-gray-700">
            <p className="font-semibold">{order.customer_name}</p>
            <p className="mt-2">{order.shipping_address}</p>
          </div>
        </motion.div>

        {/* Order Note */}
        {order.order_note && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Ghi chú đơn hàng
            </h2>
            <p className="text-gray-700">{order.order_note}</p>
          </motion.div>
        )}
      </div>

      {/* PayOS Payment Dialog */}
      {showPaymentDialog && paymentData && (
        <PayOSPaymentDialog
          isOpen={showPaymentDialog}
          onClose={handlePaymentCancel}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
          orderId={order._id}
        />
      )}
    </div>
  );
}
