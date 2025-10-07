'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface NotificationToastProps {
  notification: {
    _id: string;
    noti_type: string;
    noti_title: string;
    noti_content: string;
    link_to?: string;
    priority?: string;
  };
  onClose: () => void;
  isVisible: boolean;
}

export function NotificationToast({ notification, onClose, isVisible }: NotificationToastProps) {
  const router = useRouter();

  // Get notification icon based on type
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

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-red-500 bg-red-50';
      case 'HIGH':
        return 'border-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const handleClick = () => {
    if (notification.link_to) {
      router.push(notification.link_to);
    } else {
      router.push(`/notifications/${notification._id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-4 right-4 z-[9999] w-96 max-w-[calc(100vw-2rem)]"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={handleClick}
            className={`
              relative overflow-hidden rounded-lg border-l-4 shadow-2xl cursor-pointer
              ${getPriorityColor(notification.priority)}
            `}
          >
            {/* Background animation */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 5,
                ease: 'linear',
                repeat: 0
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="relative p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 text-3xl animate-bounce">
                  {getNotificationIcon(notification.noti_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {notification.noti_title}
                      </p>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {notification.noti_content}
                      </p>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Priority badge */}
                  {notification.priority && notification.priority !== 'LOW' && (
                    <div className="mt-2">
                      <span className={`
                        inline-block px-2 py-0.5 text-xs font-medium rounded
                        ${notification.priority === 'URGENT' && 'bg-red-100 text-red-800'}
                        ${notification.priority === 'HIGH' && 'bg-orange-100 text-orange-800'}
                        ${notification.priority === 'MEDIUM' && 'bg-blue-100 text-blue-800'}
                      `}>
                        {notification.priority === 'URGENT' && '🚨 Khẩn cấp'}
                        {notification.priority === 'HIGH' && '⚠️ Quan trọng'}
                        {notification.priority === 'MEDIUM' && '📌 Thông báo'}
                      </span>
                    </div>
                  )}

                  {/* Action hint */}
                  <p className="text-xs text-gray-500 mt-2">
                    Nhấn để xem chi tiết →
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-1 bg-blue-600"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
