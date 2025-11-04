'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { notificationService, Notification } from '@/features/notifications/services/notificationService';
import { useRouter } from 'next/navigation';

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getMyNotifications({
        page: currentPage,
        limit: 10,
        noti_type: filterType !== 'ALL' ? filterType : undefined,
        is_read: filterStatus === 'ALL' ? undefined : filterStatus === 'READ'
      });

      if (response.success) {
        setNotifications(response.data.notifications);
        setTotalNotifications(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (err) {
      }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification._id);
      }

      if (notification.link_to) {
        router.push(notification.link_to);
      } else {
        router.push(`/notifications/${notification._id}`);
      }
    } catch (err) {
      }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filterType, filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadNotifications();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
      case 'ORDER_SHIPPED':
      case 'DELIVERY':
        return '📦';
      case 'ORDER_CANCELLED':
        return '❌';
      case 'PROMOTION':
        return '🎉';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '📢';
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ORDER_CONFIRMED: 'Xác nhận đơn',
      ORDER_SHIPPED: 'Đang giao',
      DELIVERY: 'Giao hàng',
      ORDER_CANCELLED: 'Đã hủy',
      PROMOTION: 'Khuyến mãi',
      SYSTEM: 'Hệ thống'
    };
    return labels[type] || type;
  };

  // Format time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BellIcon className="h-7 w-7 mr-3 text-blue-600" />
                Thông báo của tôi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổng: {totalNotifications} thông báo
                {unreadCount > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({unreadCount} chưa đọc)
                  </span>
                )}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thông báo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="ORDER_CONFIRMED">Xác nhận đơn</option>
              <option value="ORDER_SHIPPED">Đang giao</option>
              <option value="DELIVERY">Giao hàng</option>
              <option value="ORDER_CANCELLED">Đã hủy</option>
              <option value="PROMOTION">Khuyến mãi</option>
              <option value="SYSTEM">Hệ thống</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả</option>
              <option value="UNREAD">Chưa đọc</option>
              <option value="READ">Đã đọc</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có thông báo nào</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`bg-white rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-blue-600' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl">
                      {getNotificationIcon(notification.noti_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-base ${!notification.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {notification.noti_title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.noti_content}
                          </p>

                          {/* Meta info */}
                          <div className="flex items-center space-x-3 mt-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              {getTypeLabel(notification.noti_type)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {notification.priority === 'URGENT' && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                Khẩn cấp
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              <span className="px-4 py-2 text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </div>
  );
}
