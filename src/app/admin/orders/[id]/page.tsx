'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  CreditCardIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { orderService } from '@/features/orders/services/orderService';
import type { Order } from '@/features/orders/services/orderService';
import { getStatusLabel, getStatusColor } from '@/features/orders/utils/orderUtils';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { PaymentStatusDisplay } from '@/components/PaymentStatusDisplay';
// Removed getProductImageUrls import - using SafeImage instead

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingInvoice, setExportingInvoice] = useState(false);

  const orderId = params?.id as string;

  // Export invoice
  const handleExportInvoice = async () => {
    if (!order) return;
    
    try {
      setExportingInvoice(true);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export invoice');
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `INV-${order.od_id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Invoice exported successfully:', filename);
      
    } catch (err: any) {
      console.error('❌ Export invoice error:', err);
      alert('Lỗi khi xuất hóa đơn: ' + (err.message || 'Unknown error'));
    } finally {
      setExportingInvoice(false);
    }
  };

  // Load order details
  const loadOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrderById(orderId);
      
      if (response && response.success && response.data) {
        console.log('🔍 Order data structure:', response.data);
        console.log('🔍 po_id type:', typeof response.data.po_id);
        console.log('🔍 po_id value:', response.data.po_id);
        setOrder(response.data);
      } else {
        throw new Error(response?.message || 'Order not found');
      }
    } catch (err: any) {
      setError('Lỗi khi tải chi tiết đơn hàng: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={loadOrder}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Đơn hàng</h1>
            <p className="text-gray-600 mt-1">Mã đơn hàng: {order.od_id}</p>
          </div>
        </div>
        
        {/* Export Invoice Button Only */}
        <button
          onClick={handleExportInvoice}
          disabled={exportingInvoice}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          {exportingInvoice ? 'Đang xuất...' : 'Xuất hóa đơn'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Thông tin đơn hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{order.od_id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng</label>
                <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {order.order_datetime ? new Date(order.order_datetime).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                <div className="flex items-center text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-semibold">{order.order_total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Product Order</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {(() => {
                    if (typeof order.po_id === 'string') return order.po_id;
                    if (Array.isArray(order.po_id)) return order.po_id.map(p => p._id).join(', ');
                    if (typeof order.po_id === 'object' && order.po_id?._id) return order.po_id._id;
                    return 'N/A';
                  })()}
                </p>
              </div>
            </div>

            {order.order_note && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{order.order_note}</p>
              </div>
            )}
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Thông tin khách hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{order.customer_name}</p>
              </div>
              
              {order.customer_id && typeof order.customer_id === 'object' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {order.customer_id.email || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {order.customer_id.phone_number || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID khách hàng</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {order.customer_id._id || order.customer_id.customer_id || 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Product Information */}
          {order.po_id && (() => {
            // Normalize po_id to always be an array for consistent rendering
            const productOrders = Array.isArray(order.po_id) ? order.po_id : [order.po_id];
            
            return productOrders.map((productOrder, index) => (
              productOrder && typeof productOrder === 'object' && productOrder.pd_id && typeof productOrder.pd_id === 'object' && (
                <motion.div
                  key={productOrder._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    Thông tin sản phẩm {productOrders.length > 1 ? `(${index + 1}/${productOrders.length})` : ''}
                  </h2>
                  
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {order.product_images && order.product_images.length > 0 ? (
                        <SafeImage
                          src={order.product_images[0].cloudinary_secure_url || order.product_images[0].img}
                          alt={productOrder.pd_id.pd_name || 'Product image'}
                          width={120}
                          height={120}
                          className="w-30 h-30 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-30 h-30 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <p className="text-sm font-semibold text-gray-900">{productOrder.pd_id.pd_name || 'N/A'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded">{productOrder.pd_id.pd_id || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded">
                            {(typeof productOrder.pd_id.br_id === 'object' && productOrder.pd_id.br_id?.br_name) || 
                             (typeof productOrder.pd_id.br_id === 'string' ? productOrder.pd_id.br_id : 'N/A')}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm</label>
                          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded">
                            {(typeof productOrder.pd_id.pdt_id === 'object' && productOrder.pd_id.pdt_id?.pdt_name) || 
                             (typeof productOrder.pd_id.pdt_id === 'string' ? productOrder.pd_id.pdt_id : 'N/A')}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded">
                            {(typeof productOrder.pd_id.category_id === 'object' && productOrder.pd_id.category_id?.cg_name) || 
                             (typeof productOrder.pd_id.category_id === 'string' ? productOrder.pd_id.category_id : 'N/A')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng đặt</label>
                          <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">{productOrder.po_quantity || 0}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giá đơn vị</label>
                          <p className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">
                            {(productOrder.po_price || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                      
                      {productOrder.pd_id.pd_description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded line-clamp-2">
                            {productOrder.pd_id.pd_description || 'Không có mô tả'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            ));
          })()}

          {/* Shipping Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Thông tin giao hàng
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                {order.shipping_address}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Thông tin thanh toán
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {typeof order.pm_id === 'object' && order.pm_id?.pm_name ? order.pm_id.pm_name : (typeof order.pm_id === 'string' ? order.pm_id : 'N/A')}
                  </p>
                  {typeof order.pm_id === 'object' && order.pm_id?.pm_description && (
                    <p className="text-xs text-gray-600 mt-1">{order.pm_id.pm_description}</p>
                  )}
                </div>
              </div>
              
              {/* Payment Status - Auto-detect PayOS or Database status */}
              <PaymentStatusDisplay
                orderId={order._id || order.od_id || orderId}
                paymentMethodId={order.pm_id}
                paymentStatus={order.payment_status_id}
                payosOrderCode={order.payos_order_code}
                paymentTransaction={(order as any).payment_transaction || null}
              />
            </div>
          </motion.div>

          {/* Voucher Information */}
          {order.voucher_id && typeof order.voucher_id === 'object' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Voucher áp dụng
              </h2>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên voucher</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {order.voucher_id.voucher_name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá</label>
                  <p className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-2 rounded-lg">
                    -{(order.voucher_id.discount_amount || 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
              Lịch sử đơn hàng
            </h2>
            
            <div className="space-y-3">
              {/* Đơn hàng được tạo */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Đơn hàng được tạo</p>
                  <p className="text-xs text-gray-500">
                    {order.order_datetime ? new Date(order.order_datetime).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Trạng thái giao hàng hiện tại */}
              {order.order_info?.of_state && (
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    order.order_info.of_state === 'ORDER_SUCCESS' ? 'bg-green-600' :
                    order.order_info.of_state === 'TRANSFER_TO_SHIPPING' ? 'bg-blue-600' :
                    order.order_info.of_state === 'SHIPPING' ? 'bg-yellow-600' :
                    order.order_info.of_state === 'DELIVERED' ? 'bg-green-600' :
                    order.order_info.of_state === 'CANCELLED' ? 'bg-red-600' :
                    'bg-gray-600'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getStatusLabel(order.order_info.of_state)}</p>
                    <p className="text-xs text-gray-500">Trạng thái giao hàng</p>
                  </div>
                </div>
              )}
              
              {/* Cập nhật gần nhất */}
              {order.updated_at && order.updated_at !== order.order_datetime && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cập nhật gần nhất</p>
                    <p className="text-xs text-gray-500">
                      {order.updated_at ? new Date(order.updated_at).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
