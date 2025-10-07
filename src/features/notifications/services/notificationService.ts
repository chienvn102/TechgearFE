// src/features/notifications/services/notificationService.ts
// Notification Service - API calls for notification management

import { apiClient } from '@/shared/services/api';

export interface Notification {
  _id: string;
  noti_id: string;
  customer_id?: {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  } | null;
  noti_type: 'ORDER_STATUS' | 'PROMOTION' | 'SYSTEM' | 'PAYMENT' | 'DELIVERY' | 'ORDER_CANCELLED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED';
  noti_title: string;
  noti_content: string;
  is_read: boolean;
  read_at?: string | null;
  target_audience: 'ALL' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'SPECIFIC';
  link_to?: string | null;
  order_id?: {
    _id: string;
    od_id: string;
    order_total: number;
  } | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_at: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount?: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SendNotificationData {
  noti_type: string;
  noti_title: string;
  noti_content: string;
  target_audience: string;
  customer_ids?: string[];
  link_to?: string;
  priority?: string;
}

export interface NotificationStatistics {
  success: boolean;
  data: {
    total: number;
    unread: number;
    read: number;
    byType: Array<{ _id: string; count: number }>;
    byAudience: Array<{ _id: string; count: number }>;
  };
}

class NotificationService {
  private baseUrl = '/notifications';

  // ==================== ADMIN METHODS ====================

  /**
   * Get all notifications (Admin)
   */
  async getAllNotifications(params?: {
    page?: number;
    limit?: number;
    search?: string;
    noti_type?: string;
    target_audience?: string;
    is_read?: boolean;
  }): Promise<NotificationListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/admin/all`, { params });
    return response.data;
  }

  /**
   * Send notification to customers (Admin/Manager)
   */
  async sendNotification(data: SendNotificationData): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/admin/send`, data);
    return response.data;
  }

  /**
   * Get notification statistics (Admin)
   */
  async getStatistics(): Promise<NotificationStatistics> {
    const response = await apiClient.get(`${this.baseUrl}/admin/statistics`);
    return response.data;
  }

  /**
   * Delete notification (Admin)
   */
  async deleteNotification(id: string): Promise<any> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ==================== CUSTOMER METHODS ====================

  /**
   * Get my notifications (Customer)
   */
  async getMyNotifications(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
    noti_type?: string;
  }): Promise<NotificationListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/my-notifications`, { params });
    return response.data;
  }

  /**
   * Get unread notification count (Customer)
   */
  async getUnreadCount(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    const response = await apiClient.get(`${this.baseUrl}/unread-count`);
    return response.data;
  }

  /**
   * Get notification by ID (Customer/Admin)
   */
  async getNotificationById(id: string): Promise<{ success: boolean; data: { notification: Notification } }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Mark notification as read (Customer)
   */
  async markAsRead(id: string): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/mark-read`);
    return response.data;
  }

  /**
   * Mark all notifications as read (Customer)
   */
  async markAllAsRead(): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/mark-all-read`);
    return response.data;
  }
}

export const notificationService = new NotificationService();
