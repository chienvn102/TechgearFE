// 📍 API Endpoints Constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
    CUSTOMER_LOGIN: '/auth/customer/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // User Management
  USER_MANAGEMENT: '/user-management',
  ROLE: '/roles',
  USER_CUSTOMER: '/user-customers',
  CUSTOMER: '/customers',
  CUSTOMER_ADDRESS: '/customer-addresses',
  CUSTOMER_RANKING: '/customer-rankings',
  RANKING: '/rankings',
  
  // Products
  PRODUCT: '/products',
  PRODUCT_TYPE: '/product-types',
  BRAND: '/brands',
  CATEGORY: '/categories',
  PRODUCT_IMAGE: '/product-images',
  PLAYER: '/players',
  
  // Orders
  ORDER: '/orders',
  PRODUCT_ORDER: '/product-orders',
  PAYMENT_METHOD: '/payment-methods',
  PAYMENT_STATUS: '/payment-statuses',
  ORDER_INFO: '/order-info',
  
  // Content
  POST: '/posts',
  BANNER: '/banners',
  NOTIFICATION: '/notifications',
  PRODUCT_REVIEW: '/product-reviews',
  
  // Vouchers
  VOUCHER: '/vouchers',
  VOUCHER_USAGE: '/voucher-usages',
  
  // System
  PERMISSION: '/permissions',
  ROLE_PERMISSION: '/role-permissions',
  AUDIT_TRAIL: '/audit-trails',
  ORDER_PAYMENT_LOG: '/order-payment-logs',
  USER_ADDRESS: '/user-addresses',
  PRODUCT_PLAYER: '/product-players',
} as const;
