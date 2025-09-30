import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// API Response Interface (theo backend chuẩn)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Pagination Interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// List Response Interface
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login?session=expired';
      }
    }
    
    // Handle validation errors
    if (error.response?.status === 422) {
      }
    
    // Transform error response to match our API format
    const errorResponse: ApiResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      error: error.response?.data?.error,
      errors: error.response?.data?.errors,
    };
    
    return Promise.reject(errorResponse);
  }
);

// Base Service Class for common CRUD operations
export abstract class BaseService<T = any> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // GET request
  protected async get<R = T>(url: string = '', config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    try {
      const fullUrl = url ? `${this.endpoint}/${url}` : this.endpoint;
      const response = await apiClient.get<ApiResponse<R>>(fullUrl, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // POST request
  protected async post<R = T>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    try {
      const fullUrl = url ? `${this.endpoint}/${url}` : this.endpoint;
      const response = await apiClient.post<ApiResponse<R>>(fullUrl, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // PUT request
  protected async put<R = T>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    try {
      const fullUrl = url ? `${this.endpoint}/${url}` : this.endpoint;
      const response = await apiClient.put<ApiResponse<R>>(fullUrl, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // PATCH request
  protected async patch<R = T>(url: string = '', data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    try {
      const fullUrl = url ? `${this.endpoint}/${url}` : this.endpoint;
      const response = await apiClient.patch<ApiResponse<R>>(fullUrl, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  protected async delete<R = T>(url: string = '', config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    try {
      const fullUrl = url ? `${this.endpoint}/${url}` : this.endpoint;
      const response = await apiClient.delete<ApiResponse<R>>(fullUrl, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Build URL with query parameters
  protected buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
}

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};
