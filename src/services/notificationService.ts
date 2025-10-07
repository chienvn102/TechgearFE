// services/notificationService.ts
// Service for PayOS unpaid order notifications

import { apiClient } from '@/shared/services/api';

export interface UnpaidOrder {
  _id: string;
  od_id: string;
  order_total: number;
  order_datetime: string;
  payos_order_code: number;
  payment_link_url: string | null;
  qr_code_url: string | null;
  transaction_id: string | null;
}

export interface UnpaidOrdersResponse {
  success: boolean;
  data: {
    unpaid_orders: UnpaidOrder[];
    count: number;
  };
}

class NotificationService {
  private baseUrl = '/payments';

  /**
   * Get unpaid PayOS orders for current customer
   */
  async getUnpaidPayOSOrders(): Promise<UnpaidOrdersResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/unpaid-orders`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get unpaid orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to get unpaid orders');
    }
  }

  /**
   * Format notification message for unpaid order
   */
  formatUnpaidOrderMessage(order: UnpaidOrder): string {
    const amount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(order.order_total);

    return `Bạn chưa thanh toán đơn hàng #${order.od_id} (${amount}). Vui lòng hoàn tất thanh toán để đơn hàng được xử lý.`;
  }

  /**
   * Get notification title for unpaid order
   */
  getUnpaidOrderTitle(): string {
    return '⏰ Đơn hàng chưa thanh toán';
  }
}

export const notificationService = new NotificationService();
