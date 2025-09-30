'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  HomeIcon,
  ShoppingBagIcon,
  TruckIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { orderService } from '@/features/orders/services/orderService';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import Header from '@/components/Header';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy order ID từ URL params nếu có
    const id = searchParams.get('orderId');
    setOrderId(id);
    
    // Fetch order details if orderId exists
    if (id) {
      fetchOrderDetails(id);
    }
  }, [searchParams]);

      const fetchOrderDetails = async (id: string) => {
        setLoading(true);
        try {
          const response = await orderService.getOrderById(id);
          if (response.success) {
            setOrderDetails(response.data);
            } else {
            setOrderDetails(null);
          }
        } catch (error) {
          setOrderDetails(null);
        } finally {
          setLoading(false);
          }
      };

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi
            </p>
            {orderId && (
              <p className="text-sm text-gray-500">
                Mã đơn hàng: <span className="font-mono font-semibold">{orderId}</span>
              </p>
            )}
          </motion.div>

          {/* Order Details */}
          {orderDetails ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h2>
              
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tên:</span> {orderDetails.customer_id?.customer_name || orderDetails.customer_name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {orderDetails.customer_id?.email || orderDetails.email || 'N/A'}</p>
                    <p className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {orderDetails.customer_id?.phone_number || orderDetails.phone_number || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-green-500" />
                    Địa chỉ giao hàng
                  </h3>
                  <p className="text-sm text-gray-700">{orderDetails.shipping_address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt</h3>
                <div className="space-y-3">
                  {(() => {
                    // Handle both single product and multiple products
                    let productOrders = [];
                    if (orderDetails.po_id) {
                      if (Array.isArray(orderDetails.po_id)) {
                        productOrders = orderDetails.po_id;
                      } else {
                        productOrders = [orderDetails.po_id];
                      }
                    }
                    
                    return productOrders.length > 0 ? (
                      productOrders.map((productOrder: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {/* Use product_images from backend or fallback to product image */}
                          {orderDetails.product_images?.[index] ? (
                            <SafeImage
                              src={orderDetails.product_images[index].img || orderDetails.product_images[index].cloudinary_secure_url}
                              alt={productOrder.pd_id?.pd_name || 'Sản phẩm'}
                              className="w-16 h-16 object-cover rounded-md"
                              fallbackSrc="/placeholder-product.jpg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {productOrder.pd_id?.pd_name || 'Sản phẩm không xác định'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {productOrder.po_quantity}
                            </p>
                            {productOrder.pd_id?.br_id?.br_name && (
                              <p className="text-xs text-gray-500">
                                Thương hiệu: {productOrder.pd_id.br_id.br_name}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(productOrder.po_price * productOrder.po_quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Không có thông tin sản phẩm</p>
                    );
                  })()}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(orderDetails.order_total)}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h2>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Không thể tải thông tin chi tiết đơn hàng
                </p>
                <p className="text-sm text-gray-500">
                  Đơn hàng đã được tạo thành công với mã: <span className="font-mono font-semibold">{orderId}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* Order Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-sm border p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trạng thái đơn hàng
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đơn hàng đã được xác nhận</p>
                  <p className="text-sm text-gray-500">Chúng tôi đã nhận được đơn hàng của bạn</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đang chuẩn bị hàng</p>
                  <p className="text-sm text-gray-500">Đơn hàng đang được chuẩn bị để giao</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Đang giao hàng</p>
                  <p className="text-sm text-gray-400">Sẽ được cập nhật khi bắt đầu giao</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-blue-50 rounded-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Bước tiếp theo
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn</li>
              <li>• Đơn hàng sẽ được chuẩn bị trong vòng 1-2 ngày làm việc</li>
              <li>• Bạn sẽ nhận được thông báo khi đơn hàng được giao</li>
              <li>• Thời gian giao hàng dự kiến: 3-5 ngày làm việc</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleContinueShopping}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Tiếp tục mua sắm
            </Button>
            
            <Button
              onClick={handleViewOrders}
              variant="outline"
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Xem đơn hàng của tôi
            </Button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 mb-2">
              Có câu hỏi về đơn hàng?
            </p>
            <p className="text-sm text-gray-600">
              Liên hệ hotline: <span className="font-semibold text-blue-600">1900 1234</span> 
              hoặc email: <span className="font-semibold text-blue-600">support@example.com</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}