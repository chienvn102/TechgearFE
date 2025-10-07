'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BellIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { notificationService, Notification } from '@/features/notifications/services/notificationService';

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notification and mark as read
  useEffect(() => {
    const loadNotification = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get notification details
        const response = await notificationService.getNotificationById(notificationId);
        
        if (response.success) {
          setNotification(response.data.notification);

          // Auto mark as read if unread
          if (!response.data.notification.is_read) {
            await notificationService.markAsRead(notificationId);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    if (notificationId) {
      loadNotification();
    }
  }, [notificationId]);

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
      ORDER_CONFIRMED: 'Xác nhận đơn hàng',
      ORDER_SHIPPED: 'Đơn hàng đang giao',
      DELIVERY: 'Giao hàng thành công',
      ORDER_CANCELLED: 'Đơn hàng đã hủy',
      PROMOTION: 'Khuyến mãi',
      SYSTEM: 'Thông báo hệ thống'
    };
    return labels[type] || type;
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BellIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error || 'Không tìm thấy thông báo'}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay về trang chủ
        </motion.button>

        {/* Notification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="text-5xl">
                  {getNotificationIcon(notification.noti_type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {notification.noti_title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-blue-100">
                    <span className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1" />
                      {getTypeLabel(notification.noti_type)}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Read status badge */}
              {notification.is_read && (
                <span className="flex items-center px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Đã đọc
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Priority badge */}
            {notification.priority && notification.priority !== 'LOW' && (
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                  {notification.priority === 'URGENT' && '🚨 Khẩn cấp'}
                  {notification.priority === 'HIGH' && '⚠️ Ưu tiên cao'}
                  {notification.priority === 'MEDIUM' && '📌 Ưu tiên trung bình'}
                </span>
              </div>
            )}

            {/* Content text */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {notification.noti_content}
              </p>
            </div>

            {/* Order info if available */}
            {notification.order_id && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>Mã đơn hàng: <span className="font-mono font-medium">{notification.order_id.od_id}</span></p>
                  <p>Tổng tiền: <span className="font-semibold">{notification.order_id.order_total.toLocaleString('vi-VN')} ₫</span></p>
                </div>
                {notification.link_to && (
                  <button
                    onClick={() => router.push(notification.link_to!)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết đơn hàng
                  </button>
                )}
              </div>
            )}

            {/* Action button if link available */}
            {notification.link_to && !notification.order_id && (
              <div className="mt-6">
                <button
                  onClick={() => router.push(notification.link_to!)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            )}

            {/* Read timestamp */}
            {notification.is_read && notification.read_at && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Đã đọc vào: {formatDate(notification.read_at)}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Quay về trang chủ
        </button>
      </motion.div>
    </div>
  </div>
  );
}