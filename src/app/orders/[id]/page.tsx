'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { orderService, Order } from '@/features/orders/services/orderService';
// Force TypeScript to re-import updated Order interface
import { formatCurrency } from '@/utils/formatters';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { Button } from '@/shared/components/ui/Button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderById(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Không tìm thấy đơn hàng');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'TRANSFER_TO_SHIPPING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORDER_SUCCESS':
        return 'Đặt hàng thành công';
      case 'TRANSFER_TO_SHIPPING':
        return 'Chuyển giao vận chuyển';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center"
        >
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/orders')}>
            Xem đơn hàng của tôi
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Trạng thái đơn hàng</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_info?.of_state || 'ORDER_SUCCESS')}`}>
                    {getStatusText(order.order_info?.of_state || 'ORDER_SUCCESS')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.order_datetime).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                      <p className="font-medium text-gray-900">{order.pm_id.pm_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Thông tin giao hàng
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Người nhận</p>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">{order.shipping_address}</p>
                  </div>
                  
                  {order.order_note && (
                    <div>
                      <p className="text-sm text-gray-500">Ghi chú</p>
                      <p className="font-medium text-gray-900">{order.order_note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TruckIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Sản phẩm đã đặt
                </h2>
                
                <div className="space-y-4">
                  {order.po_id && Array.isArray(order.po_id) && order.po_id.length > 0 ? (
                    order.po_id.map((productOrder, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <SafeImage
                            src={productOrder.pd_id?.images?.[0]?.img || '/images/placeholder-product.svg'}
                            alt={productOrder.pd_id?.pd_name || 'Sản phẩm'}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            fallbackSrc="/images/placeholder-product.svg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {productOrder.pd_id?.pd_name || 'Sản phẩm không xác định'}
                          </h3>
                          {productOrder.pd_id?.br_id && typeof productOrder.pd_id.br_id === 'object' && (
                            <p className="text-sm text-gray-500">Thương hiệu: {productOrder.pd_id.br_id.br_name}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Số lượng: {productOrder.po_quantity}</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(productOrder.po_price * productOrder.po_quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : order.po_id && !Array.isArray(order.po_id) ? (
                    // Backward compatibility for single product
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <SafeImage
                          src={order.po_id.pd_id?.images?.[0]?.img || '/images/placeholder-product.svg'}
                          alt={order.po_id.pd_id?.pd_name || 'Sản phẩm'}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          fallbackSrc="/images/placeholder-product.svg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {order.po_id.pd_id?.pd_name || 'Sản phẩm không xác định'}
                        </h3>
                        {order.po_id.pd_id?.br_id && typeof order.po_id.pd_id.br_id === 'object' && (
                          <p className="text-sm text-gray-500">Thương hiệu: {order.po_id.pd_id.br_id.br_name}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Số lượng: {order.po_id.po_quantity}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(order.po_id.po_price * order.po_id.po_quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có thông tin sản phẩm</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã đơn hàng</span>
                    <span className="font-medium text-gray-900">{order.od_id}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">
                      {formatCurrency(
                        Array.isArray(order.po_id) 
                          ? order.po_id.reduce((sum, po) => sum + (po.po_price * po.po_quantity), 0)
                          : order.po_id.po_price * order.po_id.po_quantity
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  
                  {(() => {
                    const subtotal = Array.isArray(order.po_id) 
                      ? order.po_id.reduce((sum, po) => sum + (po.po_price * po.po_quantity), 0)
                      : order.po_id.po_price * order.po_id.po_quantity;
                    
                    // Calculate voucher discount
                    const voucherDiscount = order.voucher_id ? (
                      order.voucher_id.discount_percent > 0 
                        ? Math.min(subtotal * (order.voucher_id.discount_percent / 100), order.voucher_id.max_discount_amount || Infinity)
                        : Math.min(order.voucher_id.discount_amount || 0, order.voucher_id.max_discount_amount || Infinity)
                    ) : 0;
                    
                    // Calculate ranking discount (from order summary if available)
                    const rankingDiscount = order.ranking_discount || 0;
                    
                    const totalDiscount = voucherDiscount + rankingDiscount;
                    const afterDiscount = subtotal - totalDiscount;
                    const tax = Math.round(subtotal * 0.1); // Thuế tính từ subtotal, không từ số tiền sau giảm giá
                    const finalTotal = afterDiscount + tax;
                    
                    return (
                      <>
                        {/* Ranking Discount */}
                        {rankingDiscount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá thành viên</span>
                            <span className="text-blue-600 font-medium">
                              -{formatCurrency(rankingDiscount)}
                            </span>
                          </div>
                        )}
                        
                        {/* Voucher Discount */}
                        {voucherDiscount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá voucher ({order.voucher_id?.voucher_code})</span>
                            <span className="text-green-600 font-medium">
                              -{formatCurrency(voucherDiscount)}
                            </span>
                          </div>
                        )}
                        
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
                      </>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => router.push('/products')}
                    className="w-full"
                  >
                    Tiếp tục mua sắm
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/orders')}
                    className="w-full"
                  >
                    Xem tất cả đơn hàng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
