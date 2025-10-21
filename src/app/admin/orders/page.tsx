'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { orderService, type Order } from '@/features/orders/services/orderService';
import { getStatusLabel, getStatusColor } from '@/features/orders/utils/orderUtils';
import { PaymentStatusCell } from '@/components/PaymentStatusCell';

// Status color mapping
const statusColors = {
  ORDER_SUCCESS: 'bg-green-100 text-green-800 border-green-200',
  TRANSFER_TO_SHIPPING: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPING: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  ORDER_SUCCESS: 'Đặt hàng thành công',
  TRANSFER_TO_SHIPPING: 'Chuyển qua giao nhận',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Giao hàng thành công',
  CANCELLED: 'Đã hủy đơn'
};

// Order Status Update Dialog Component
interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
  loading: boolean;
}

function OrderStatusDialog({ isOpen, onClose, order, onStatusUpdate, loading }: OrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  useEffect(() => {
    if (order && isOpen) {
      // Get current status from order info if available
      setSelectedStatus(order.order_info?.of_state || 'ORDER_SUCCESS');
    }
  }, [order, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (order && selectedStatus) {
      await onStatusUpdate(order._id, selectedStatus);
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Cập nhật trạng thái đơn hàng
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Đơn hàng: <span className="font-medium">{order.od_id}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Trạng thái mới
              </label>
              <div className="space-y-2">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <label key={value} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={value}
                      checked={selectedStatus === value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[value as keyof typeof statusColors]}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin đơn hàng</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Khách hàng:</span> {order.customer_name}</p>
                <p><span className="font-medium">Tổng tiền:</span> {order.order_total.toLocaleString('vi-VN')}đ</p>
                <p><span className="font-medium">Ngày đặt:</span> {new Date(order.order_datetime).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStatus}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </div>
              ) : (
                'Cập nhật trạng thái'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const pageSize = 10;

  // Load orders from backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter
      };

      const response = await orderService.getOrders(queryParams);
      
      if (response && response.success && response.data && response.data.orders) {
        setOrders(response.data.orders || []);
        
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
          setTotalOrders(pagination.total || 0);
        }
      } else {
        throw new Error(response?.message || 'Failed to load orders');
      }
    } catch (err: any) {
      setError('Lỗi khi tải danh sách đơn hàng: ' + (err.message || 'Unknown error'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdateLoading(true);
      // Tìm order_info tương ứng với order này
      const order = orders.find(o => o._id === orderId);
      if (!order || !order.order_info) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }
      
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        await loadOrders(); // Reload orders
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (err: any) {
      alert('Lỗi khi cập nhật trạng thái: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Open status dialog
  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả đơn hàng trong hệ thống ({totalOrders} đơn hàng)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã đơn, khách hàng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              
              <button
                type="submit"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Mã đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell w-40">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-24">
                      Ngày đặt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-28">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell w-36">
                      Trạng thái đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-32">
                      Trạng thái thanh toán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">{order.od_id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{order.customer_name}</div>
                            {order.customer_id && order.customer_id.email && (
                              <div className="text-sm text-gray-500 truncate">{order.customer_id.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">
                            {new Date(order.order_datetime).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {order.order_total.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            {order.order_info ? (
                              <select
                                value={order.order_info.of_state}
                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                className={`w-full px-2 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.order_info.of_state)}`}
                                disabled={updateLoading}
                              >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                  <option key={value} value={value} className="bg-white text-gray-900">
                                    {label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                                Chưa có trạng thái
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="min-w-0">
                          {order.payment_status_id ? (
                            <PaymentStatusCell
                              paymentStatus={order.payment_status_id}
                              paymentMethodId={order.pm_id}
                              payosOrderCode={order.payos_order_code}
                            />
                          ) : (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                              Chưa có trạng thái
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded flex-shrink-0"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openStatusDialog(order)}
                            className="text-green-600 hover:text-green-900 p-1 rounded flex-shrink-0"
                            title="Sửa trạng thái"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{order.od_id}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(order.order_datetime).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openStatusDialog(order)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Sửa trạng thái"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center mb-3">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      {order.customer_id && order.customer_id.email && (
                        <p className="text-xs text-gray-500">{order.customer_id.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center mb-3">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {order.order_total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Status Row */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Order Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Trạng thái đơn hàng
                      </label>
                      {order.order_info ? (
                        <select
                          value={order.order_info.of_state}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.order_info.of_state)}`}
                          disabled={updateLoading}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value} className="bg-white text-gray-900">
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex px-3 py-2 rounded-lg text-sm font-medium border bg-gray-100 text-gray-800 border-gray-200">
                          Chưa có trạng thái
                        </span>
                      )}
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Trạng thái thanh toán
                      </label>
                      {order.payment_status_id ? (
                        <PaymentStatusCell
                          paymentStatus={order.payment_status_id}
                          paymentMethodId={order.pm_id}
                          payosOrderCode={order.payos_order_code}
                        />
                      ) : (
                        <span className="inline-flex px-3 py-2 rounded-lg text-sm font-medium border bg-gray-100 text-gray-800 border-gray-200">
                          Chưa có trạng thái
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalOrders)}</span> trong tổng số{' '}
                  <span className="font-medium">{totalOrders}</span> đơn hàng
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  {(() => {
                    // Calculate pagination range
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4);
                    }
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }
                    
                    return pages.map((pageNum) => (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Status Update Dialog */}
      <OrderStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        loading={updateLoading}
      />
    </div>
  );
}
