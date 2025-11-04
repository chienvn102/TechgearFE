'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { socketService } from '@/lib/socket';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';
import { authService } from '@/features/auth/services/authService';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {}
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationQueue, setNotificationQueue] = useState<any[]>([]);

  // Load unread count from API
  const refreshUnreadCount = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      }
  };

  // Process notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && !showToast) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setShowToast(true);
      setNotificationQueue(prev => prev.slice(1));

      // Auto-close after 5 seconds
      const timeout = setTimeout(() => {
        setShowToast(false);
        setTimeout(() => {
          setCurrentNotification(null);
        }, 500); // Wait for exit animation
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [notificationQueue, showToast]);

  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated();
    const userType = authService.getUserType();
    const currentUser = authService.getCurrentUser();

    if (isAuthenticated && userType === 'customer' && currentUser?._id) {
      const customerId = currentUser._id; // Use _id instead of customer_id
      
      // Connect to Socket.io
      socketService.connect(customerId);

      // Load initial unread count
      refreshUnreadCount();

      // Listen for new notifications
      const handleNewNotification = (data: any) => {
        // Add to queue
        setNotificationQueue(prev => [...prev, data.notification]);

        // Increment unread count
        setUnreadCount(prev => prev + 1);

        // Play notification sound (optional)
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(err => console.log('Could not play notification sound:', err));
        } catch (error) {
          // Ignore audio errors
        }
      };

      socketService.onNotification(handleNewNotification);

      // Cleanup on unmount
      return () => {
        socketService.offNotification(handleNewNotification);
        socketService.disconnect();
      };
    }
  }, []);

  const handleCloseToast = () => {
    setShowToast(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 500);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
      
      {/* Notification Toast */}
      {currentNotification && (
        <NotificationToast
          notification={currentNotification}
          onClose={handleCloseToast}
          isVisible={showToast}
        />
      )}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotificationContext() {
  return useContext(NotificationContext);
}
