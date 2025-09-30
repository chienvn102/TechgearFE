/**
 * Utility functions for formatting data
 */

/**
 * Format currency to Vietnamese Dong format
 * @param amount - The amount to format
 * @param currency - The currency symbol (default: '₫')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '₫'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `0 ${currency}`;
  }
  
  return `${amount.toLocaleString('vi-VN')} ${currency}`;
};

/**
 * Format date to Vietnamese format
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  return dateObj.toLocaleDateString('vi-VN', options);
};

/**
 * Format date and time to Vietnamese format
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  return dateObj.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format phone number to Vietnamese format
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone numbers
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  
  return phone; // Return original if doesn't match expected format
};

/**
 * Format file size to human readable format
 * @param bytes - The file size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format percentage
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousand separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  return num.toLocaleString('vi-VN');
};

/**
 * Format order status to Vietnamese
 * @param status - The order status
 * @returns Vietnamese status string
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Chờ xử lý',
    'PROCESSING': 'Đang xử lý',
    'SHIPPED': 'Đã giao hàng',
    'DELIVERED': 'Đã nhận hàng',
    'CANCELLED': 'Đã hủy',
    'REFUNDED': 'Đã hoàn tiền',
    'PAID': 'Đã thanh toán',
    'UNPAID': 'Chưa thanh toán'
  };
  
  return statusMap[status] || status;
};

/**
 * Format payment method to Vietnamese
 * @param method - The payment method
 * @returns Vietnamese payment method string
 */
export const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'COD': 'Thanh toán khi nhận hàng',
    'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
    'MOMO': 'Ví MoMo',
    'ZALOPAY': 'ZaloPay',
    'CREDIT_CARD': 'Thẻ tín dụng',
    'DEBIT_CARD': 'Thẻ ghi nợ'
  };
  
  return methodMap[method] || method;
};

/**
 * Truncate text with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Format address for display
 * @param address - The address object or string
 * @returns Formatted address string
 */
export const formatAddress = (address: any): string => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object' && address) {
    const parts = [
      address.street,
      address.ward,
      address.district,
      address.city,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  return '';
};

/**
 * Format product SKU
 * @param sku - The SKU string
 * @returns Formatted SKU
 */
export const formatSKU = (sku: string): string => {
  if (!sku) return '';
  
  // Add spaces or dashes for better readability
  return sku.replace(/([A-Z])([0-9])/g, '$1-$2');
};

/**
 * Format discount amount
 * @param originalPrice - Original price
 * @param discountPrice - Discounted price
 * @returns Formatted discount string
 */
export const formatDiscount = (originalPrice: number, discountPrice: number): string => {
  if (originalPrice <= discountPrice) {
    return '0%';
  }
  
  const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return `-${discountPercent}%`;
};

/**
 * Format rating stars
 * @param rating - The rating value (0-5)
 * @returns Star rating string
 */
export const formatRating = (rating: number): string => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return '0.0';
  }
  
  return rating.toFixed(1);
};

/**
 * Format time ago (relative time)
 * @param date - The date to compare
 * @returns Relative time string
 */
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(past.getTime())) {
    return 'Thời gian không hợp lệ';
  }
  
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};
