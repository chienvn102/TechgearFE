'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon,
  EyeIcon,
  CalendarIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { orderService, Order } from '@/features/orders/services/orderService';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/shared/components/ui/Button';
import { authService } from '@/features/auth/services/authService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading for search
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check authentication first
        if (!authService.isAuthenticated()) {
          window.location.href = 'http://localhost:5000/login';
          return;
        }
        
        // Check if user is customer
        if (!authService.isCustomer()) {
          router.push('/');
          return;
        }
        
        // Only show full page loading on initial load
        // After that, always use searchLoading for smoother UX
        if (isInitialLoad) {
          setLoading(true);
          setIsInitialLoad(false);
        } else {
          setSearchLoading(true);
        }
        setError(null);
        
        const response = await orderService.getMyOrders(currentPage, 10, debouncedSearchQuery);
        if (response.success) {
          setOrders(response.data.orders || []);
          setTotalPages(response.data.pagination?.pages || 1);
          } else {
          setError(response.message || 'Không thể tải danh sách đơn hàng');
        }
      } catch (err: any) {
        // Handle specific error cases
        if (err.message?.includes('401') || err.message?.includes('Authentication')) {
          setError('Bạn cần đăng nhập để xem đơn hàng. Vui lòng đăng nhập lại.');
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = 'http://localhost:5000/login';
          }, 3000);
        } else if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          setError('Bạn không có quyền truy cập trang này.');
        } else {
          setError('Có lỗi xảy ra khi tải đơn hàng. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, debouncedSearchQuery, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            
            <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                {error.includes('đăng nhập') && (
                  <Button
                    onClick={() => window.location.href = 'http://localhost:5000/login'}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Đăng nhập
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng theo tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                disabled={!searchQuery}
              >
                Xóa bộ lọc
              </Button>
          </div>
        </div>

          {/* Search Loading Indicator - Only show during search */}
          {searchLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Đang tìm kiếm đơn hàng...</span>
            </div>
          )}

          {/* Empty State */}
          {!searchLoading && orders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {debouncedSearchQuery ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchQuery 
                  ? `Không tìm thấy đơn hàng nào với từ khóa "${debouncedSearchQuery}"`
                  : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                }
              </p>
              {!debouncedSearchQuery && (
                <Button onClick={() => router.push('/products')}>
                  Bắt đầu mua sắm
                </Button>
              )}
            </div>
          )}

          {/* Orders List */}
          {!searchLoading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order, index) => {
                // Get delivery status - handle both populated and unpopulated cases
                const deliveryStatus = order.order_info?.of_state || 'ORDER_SUCCESS';
                
                return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Đơn hàng #{order.od_id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.order_datetime).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deliveryStatus)}`}>
                        {getStatusText(deliveryStatus)}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.od_id}`)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.order_datetime).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Thanh toán</p>
                        <p className="font-medium text-gray-900">
                          {order.pm_id && typeof order.pm_id === 'object' && order.pm_id.pm_name ? order.pm_id.pm_name : 'Chưa xác định'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-semibold text-blue-600 text-lg">{formatCurrency(order.order_total)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    
                    <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}