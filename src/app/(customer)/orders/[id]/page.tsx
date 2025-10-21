// app/(customer)/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { orderService, Order } from '@/features/orders/services/orderService';
import { paymentService } from '@/services/paymentService';
import { CreatePaymentResponse } from '@/types/payment.types';
import PayOSPaymentDialog from '@/components/PayOSPaymentDialog';
import { SimplePaymentStatus } from '@/components/SimplePaymentStatus';

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PayOS payment states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentResponse['data'] | null>(null);
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
          payos_order_code: orderData.payos_order_code,
          payment_transaction: orderData.payment_transaction,
          has_payment_transaction: !!orderData.payment_transaction,
          transaction_status: orderData.payment_transaction?.status
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

  // Handle payment timeout - cancel order
  const handlePaymentTimeout = async () => {
    console.log('⏰ Payment timeout - cancelling order');
    
    setShowPaymentDialog(false);
    
    // Cancel the payment
    if (order && paymentData) {
      try {
        await paymentService.cancelPayment(paymentData.payos_order_code, {
          cancellationReason: 'Hết thời gian thanh toán (15 phút)'
        });
        
        // Reload order to show cancelled status
        loadOrder();
        
        alert('Đơn hàng đã bị hủy do hết thời gian thanh toán. Vui lòng đặt hàng lại.');
        
        // Redirect to orders list after 2 seconds
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      } catch (err) {
        console.error('Error cancelling payment:', err);
        setPaymentError('Không thể hủy thanh toán. Vui lòng liên hệ hỗ trợ.');
      }
    }
    
    setPaymentData(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get payment status color based on ps_name
  const getPaymentStatusColor = (ps_name: string | undefined): string => {
    if (!ps_name) return '#6b7280'; // gray
    
    const statusName = ps_name.toUpperCase();
    
    // Map payment status names to colors
    if (statusName.includes('PAID') || statusName.includes('ĐÃ THANH TOÁN')) {
      return '#10b981'; // green
    }
    if (statusName.includes('UNPAID') || statusName.includes('CHƯA THANH TOÁN')) {
      return '#ef4444'; // red
    }
    if (statusName.includes('PENDING') || statusName.includes('CHỜ')) {
      return '#f59e0b'; // amber
    }
    if (statusName.includes('REFUND') || statusName.includes('HOÀN')) {
      return '#8b5cf6'; // purple
    }
    if (statusName.includes('PARTIAL') || statusName.includes('MỘT PHẦN')) {
      return '#3b82f6'; // blue
    }
    
    return '#6b7280'; // default gray
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

          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
            <div>
              <span className="text-gray-500">Ngày đặt hàng:</span>
              <p className="font-semibold text-gray-800">
                {new Date(order.order_datetime).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Khách hàng:</span>
              <p className="font-semibold text-gray-800">
                {order.customer_name}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Số điện thoại:</span>
              <p className="font-semibold text-gray-800">
                {order.customer_id?.phone_number || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-semibold text-gray-800">
                {order.customer_id?.email || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Delivery Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🚚</span>
            Trạng thái giao hàng
          </h2>
          
          <div className="relative">
            {/* Timeline */}
            <div className="space-y-4">
              {/* Order Success */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.order_info?.of_state ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đặt hàng thành công</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.order_datetime).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Transfer to Shipping */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.order_info?.of_state === 'TRANSFER_TO_SHIPPING' || 
                  order.order_info?.of_state === 'SHIPPING' || 
                  order.order_info?.of_state === 'DELIVERED'
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  📦
                </div>
                <div>
                  <p className={`font-semibold ${
                    order.order_info?.of_state === 'TRANSFER_TO_SHIPPING' || 
                    order.order_info?.of_state === 'SHIPPING' || 
                    order.order_info?.of_state === 'DELIVERED'
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    Chuyển qua giao nhận
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.order_info?.of_state === 'TRANSFER_TO_SHIPPING' || 
                     order.order_info?.of_state === 'SHIPPING' || 
                     order.order_info?.of_state === 'DELIVERED'
                      ? 'Đơn hàng đã được chuyển sang bộ phận giao nhận' 
                      : 'Chờ xử lý'}
                  </p>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.order_info?.of_state === 'SHIPPING' || 
                  order.order_info?.of_state === 'DELIVERED'
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  🚚
                </div>
                <div>
                  <p className={`font-semibold ${
                    order.order_info?.of_state === 'SHIPPING' || 
                    order.order_info?.of_state === 'DELIVERED'
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    Đang giao hàng
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.order_info?.of_state === 'SHIPPING' || 
                     order.order_info?.of_state === 'DELIVERED'
                      ? 'Đơn hàng đang trên đường giao đến bạn' 
                      : 'Chờ xử lý'}
                  </p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.order_info?.of_state === 'DELIVERED'
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`font-semibold ${
                    order.order_info?.of_state === 'DELIVERED'
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    Giao hàng thành công
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.order_info?.of_state === 'DELIVERED'
                      ? 'Đơn hàng đã được giao thành công' 
                      : 'Chờ xử lý'}
                  </p>
                </div>
              </div>

              {/* Cancelled */}
              {order.order_info?.of_state === 'CANCELLED' && (
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                    ✕
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">Đã hủy đơn</p>
                    <p className="text-sm text-gray-500">Đơn hàng đã bị hủy</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Products List - Invoice Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Danh sách sản phẩm
          </h2>
          
          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">STT</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Tên sản phẩm</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">Số lượng</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Đơn giá</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const productOrders = Array.isArray(order.po_id) ? order.po_id : [order.po_id];
                  return productOrders.map((productOrder, index) => {
                    if (!productOrder || typeof productOrder !== 'object' || !productOrder.pd_id) {
                      return null;
                    }
                    
                    const product = productOrder.pd_id;
                    const quantity = productOrder.po_quantity || 0;
                    const price = productOrder.po_price || 0;
                    const total = quantity * price;

                    return (
                      <tr key={productOrder._id || index} className="border-b border-gray-200">
                        <td className="py-3 px-2 text-gray-700">{index + 1}</td>
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-900">
                            {typeof product === 'object' ? product.pd_name : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {typeof product === 'object' ? product.pd_SKU : 'N/A'}
                          </p>
                        </td>
                        <td className="py-3 px-2 text-center text-gray-700">{quantity}</td>
                        <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(price)}</td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">{formatCurrency(total)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(order.order_total)}</span>
                </div>

                {/* Voucher Discount */}
                {order.voucher_id && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({order.voucher_id.voucher_code}):</span>
                    <span>-{formatCurrency(order.voucher_id.discount_amount || 0)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-xl font-bold text-blue-600 border-t border-gray-300 pt-2">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(order.order_total)}</span>
                </div>

                {/* Payment Method */}
                <div className="flex justify-between text-sm text-gray-600 pt-2">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-semibold">{order.pm_id?.pm_name || 'N/A'}</span>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between text-sm items-center pt-1">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <SimplePaymentStatus
                    paymentTransaction={(order as any).payment_transaction}
                    paymentStatus={order.payment_status_id as any}
                  />
                </div>
              </div>
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
              Thông tin thanh toán
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <p className="text-base text-gray-900">
                  {order.pm_id?.pm_name || 'Chuyển khoản ngân hàng'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <SimplePaymentStatus
                  paymentTransaction={(order as any).payment_transaction}
                  paymentStatus={order.payment_status_id as any}
                />
              </div>
            </div>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">📍</span>
            Địa chỉ giao hàng
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">{order.customer_name}</p>
            <p className="text-gray-700 mt-2">{order.shipping_address}</p>
            {order.customer_id?.phone_number && (
              <p className="text-gray-600 mt-1">SĐT: {order.customer_id.phone_number}</p>
            )}
          </div>
        </motion.div>

        {/* Order Note */}
        {order.order_note && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📝</span>
              Ghi chú đơn hàng
            </h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{order.order_note}</p>
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
          onCancel={handlePaymentCancel}
          onTimeout={handlePaymentTimeout}
          orderId={order._id}
        />
      )}
    </div>
  );
}
