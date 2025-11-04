// components/NotificationBell.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { notificationService, UnpaidOrder } from '@/services/notificationService';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL = 60000; // Poll every 60 seconds

export const NotificationBell: React.FC = () => {
  const router = useRouter();
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unpaid orders
  const fetchUnpaidOrders = useCallback(async () => {
    try {
      const response = await notificationService.getUnpaidPayOSOrders();
      setUnpaidOrders(response.data.unpaid_orders);
    } catch (error) {
      // Don't show error to user, just log it
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnpaidOrders();

    const interval = setInterval(() => {
      fetchUnpaidOrders();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchUnpaidOrders]);

  // Handle notification click
  const handleNotificationClick = (orderId: string) => {
    setIsOpen(false);
    router.push(`/orders/${orderId}`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    await fetchUnpaidOrders();
    setLoading(false);
  };

  const hasUnpaidOrders = unpaidOrders.length > 0;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        {hasUnpaidOrders ? (
          <BellAlertIcon className="w-6 h-6 text-red-500 animate-pulse" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}
        
        {/* Badge */}
        {hasUnpaidOrders && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unpaidOrders.length > 9 ? '9+' : unpaidOrders.length}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    🔔 Thông báo thanh toán
                  </h3>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    aria-label="Refresh"
                  >
                    <svg
                      className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {unpaidOrders.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Không có đơn hàng chưa thanh toán</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {unpaidOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => handleNotificationClick(order._id)}
                        className="px-4 py-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-bold text-sm">!</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">
                              {notificationService.getUnpaidOrderTitle()}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notificationService.formatUnpaidOrderMessage(order)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(order.order_datetime).toLocaleString('vi-VN')}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {unpaidOrders.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-center text-gray-500">
                    Nhấn vào thông báo để xem chi tiết và thanh toán
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
