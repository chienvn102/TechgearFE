// Order utilities for formatting and status handling

export const OrderStatus = {
  // Order states (from order_info.of_state)
  ORDER_SUCCESS: 'ORDER_SUCCESS',
  TRANSFER_TO_SHIPPING: 'TRANSFER_TO_SHIPPING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  
  // Payment statuses (from payment_status.ps_id)
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * Get display text and styling for order status
 */
export const getOrderStatusDisplay = (orderState?: string, paymentStatus?: string) => {
  // Primary status based on order state
  if (orderState) {
    switch (orderState) {
      case OrderStatus.ORDER_SUCCESS:
        return {
          text: 'Đặt hàng thành công',
          color: 'bg-green-100 text-green-800',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case OrderStatus.TRANSFER_TO_SHIPPING:
        return {
          text: 'Chuẩn bị giao hàng',
          color: 'bg-blue-100 text-blue-800',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case OrderStatus.SHIPPING:
        return {
          text: 'Đang giao hàng',
          color: 'bg-yellow-100 text-yellow-800',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case OrderStatus.DELIVERED:
        return {
          text: 'Đã giao hàng',
          color: 'bg-green-100 text-green-800',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case OrderStatus.CANCELLED:
        return {
          text: 'Đã hủy',
          color: 'bg-red-100 text-red-800',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  }

  // Fallback to payment status
  switch (paymentStatus) {
    case OrderStatus.PENDING:
      return {
        text: 'Chờ xử lý',
        color: 'bg-yellow-100 text-yellow-800',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    case OrderStatus.PAID:
      return {
        text: 'Đã thanh toán',
        color: 'bg-green-100 text-green-800',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    case OrderStatus.FAILED:
      return {
        text: 'Thanh toán thất bại',
        color: 'bg-red-100 text-red-800',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    case OrderStatus.REFUNDED:
      return {
        text: 'Đã hoàn tiền',
        color: 'bg-blue-100 text-blue-800',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        text: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
  }
};

/**
 * Format date for display
 */
export const formatOrderDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Format order ID for display
 */
export const formatOrderId = (orderId: string): string => {
  return `#${orderId}`;
};

/**
 * Calculate order item total
 */
export const calculateOrderItemTotal = (quantity: number, price: number): number => {
  return quantity * price;
};

/**
 * Get order progress percentage based on status
 */
export const getOrderProgress = (orderState?: string): number => {
  switch (orderState) {
    case OrderStatus.ORDER_SUCCESS:
      return 25;
    case OrderStatus.TRANSFER_TO_SHIPPING:
      return 50;
    case OrderStatus.SHIPPING:
      return 75;
    case OrderStatus.DELIVERED:
      return 100;
    case OrderStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (orderState?: string): boolean => {
  return orderState === OrderStatus.ORDER_SUCCESS || orderState === OrderStatus.TRANSFER_TO_SHIPPING;
};

/**
 * Check if order is completed
 */
export const isOrderCompleted = (orderState?: string): boolean => {
  return orderState === OrderStatus.DELIVERED;
};

/**
 * Check if order is cancelled
 */
export const isOrderCancelled = (orderState?: string): boolean => {
  return orderState === OrderStatus.CANCELLED;
};

/**
 * Get next possible order states for admin
 */
export const getNextOrderStates = (currentState?: string): Array<{ value: string; label: string }> => {
  switch (currentState) {
    case OrderStatus.ORDER_SUCCESS:
      return [
        { value: OrderStatus.TRANSFER_TO_SHIPPING, label: 'Chuyển sang chuẩn bị giao hàng' },
        { value: OrderStatus.CANCELLED, label: 'Hủy đơn hàng' }
      ];
    case OrderStatus.TRANSFER_TO_SHIPPING:
      return [
        { value: OrderStatus.SHIPPING, label: 'Bắt đầu giao hàng' },
        { value: OrderStatus.CANCELLED, label: 'Hủy đơn hàng' }
      ];
    case OrderStatus.SHIPPING:
      return [
        { value: OrderStatus.DELIVERED, label: 'Đánh dấu đã giao hàng' }
      ];
    default:
      return [];
  }
};

/**
 * Get status label for display
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case OrderStatus.ORDER_SUCCESS:
      return 'Đặt hàng thành công';
    case OrderStatus.TRANSFER_TO_SHIPPING:
      return 'Chuyển qua giao nhận';
    case OrderStatus.SHIPPING:
      return 'Đang giao hàng';
    case OrderStatus.DELIVERED:
      return 'Giao hàng thành công';
    case OrderStatus.CANCELLED:
      return 'Đã hủy đơn';
    default:
      return 'Không xác định';
  }
};

/**
 * Get status color classes for display
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case OrderStatus.ORDER_SUCCESS:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.TRANSFER_TO_SHIPPING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.SHIPPING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800 border-green-200';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Validate checkout form data
 */
export const validateCheckoutForm = (formData: {
  customer_name: string;
  phone_number: string;
  email: string;
  shipping_address: string;
}) => {
  const errors: Record<string, string> = {};

  if (!formData.customer_name.trim()) {
    errors.customer_name = 'Vui lòng nhập họ tên';
  }

  if (!formData.phone_number.trim()) {
    errors.phone_number = 'Vui lòng nhập số điện thoại';
  } else if (!/^[0-9]{10,11}$/.test(formData.phone_number.replace(/\s/g, ''))) {
    errors.phone_number = 'Số điện thoại không hợp lệ (10-11 chữ số)';
  }

  if (!formData.email.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!formData.shipping_address.trim()) {
    errors.shipping_address = 'Vui lòng nhập địa chỉ giao hàng';
  } else if (formData.shipping_address.length < 10) {
    errors.shipping_address = 'Địa chỉ quá ngắn (tối thiểu 10 ký tự)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
