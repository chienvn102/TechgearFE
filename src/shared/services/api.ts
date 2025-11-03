import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// Log API configuration
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NEXT_PUBLIC_ENV || 'development');

// Production validation
if (process.env.NEXT_PUBLIC_ENV === 'production' && !API_BASE_URL.includes('railway.app')) {
  console.warn('⚠️ WARNING: Production API URL should point to Railway backend!');
}

// Create axios instance with production-ready timeout
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: process.env.NEXT_PUBLIC_ENV === 'production' ? 30000 : 10000, // 30s for production, 10s for dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available - try multiple key names for compatibility
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('auth-token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development only
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      if (token) {
        console.log('🔑 Auth token present');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development only
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.log('📥 API Response:', response.status, response.config.url);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Log error in development only
      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.error('❌ API Error:', {
          status,
          message: data?.message,
          url: error.config?.url,
        });
      }
      
      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          // Skip auto-logout for certain endpoints to prevent unwanted redirects
          const url = error.config?.url || '';
          const skipAutoLogout = url.includes('/orders/customer/') || url.includes('/orders/') || url.includes('/profile');
          
          if (!skipAutoLogout) {
            // Clear all possible token keys
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
              // Use dynamic redirect based on environment
              const loginUrl = process.env.NEXT_PUBLIC_ENV === 'production' 
                ? '/login' 
                : 'http://localhost:5000/login';
              window.location.href = loginUrl;
            }
          } else {
            console.log('⚠️ Skipping auto-logout for order/profile endpoints');
          }
        case 403:
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 500:
          // Server error
          console.error('❌ Server error:', data?.message);
          break;
        default:
          if (process.env.NEXT_PUBLIC_ENV === 'development') {
            console.error('❌ HTTP Error:', status, data?.message);
          }
      }
      // Return error with message
      return Promise.reject({
        status,
        message: data?.message || `HTTP Error: ${status}`,
        data: data
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null
      });
    } else {
      // Other error
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null
      });
    }
  }
);

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
    CUSTOMER_LOGIN: '/auth/customer/login',
    REGISTER: '/auth/customer/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products',
    DELETE: '/products',
    SEARCH: '/products/search',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    DELETE: '/orders',
  },
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    UPDATE: '/customers',
    DELETE: '/customers',
  },
  VOUCHERS: {
    LIST: '/vouchers',
    CREATE: '/vouchers',
    UPDATE: '/vouchers',
    DELETE: '/vouchers',
    AVAILABLE: '/vouchers/available',
    VALIDATE: '/vouchers/validate',
  },
  PAYMENT_METHODS: {
    LIST: '/payment-methods',
    CREATE: '/payment-methods',
    UPDATE: '/payment-methods',
    DELETE: '/payment-methods',
  },
  PAYMENT_STATUS: {
    LIST: '/payment-status',
    CREATE: '/payment-status',
    UPDATE: '/payment-status',
    DELETE: '/payment-status',
  },
  CUSTOMER_ADDRESSES: {
    LIST: '/customer-addresses',
    CREATE: '/customer-addresses',
    UPDATE: '/customer-addresses',
    DELETE: '/customer-addresses',
  },
};

// Base Service Class
export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.get(`${this.baseUrl}${url}`, { params });
    return response.data;
  }

  protected async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.post(`${this.baseUrl}${url}`, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await apiClient.put(`${this.baseUrl}${url}`, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete(`${this.baseUrl}${url}`);
    return response.data;
  }

  protected buildUrlWithParams(endpoint: string, params?: any): string {
    if (!params) return endpoint;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
}

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth-token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  delete apiClient.defaults.headers.common['Authorization'];
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || 
         localStorage.getItem('auth-token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('token');
};

// Export default apiClient
export default apiClient;