// services/api.ts
// Axios API configuration

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getToken, removeToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for debugging
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken();
      
      // Only redirect if we're in browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/auth/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      }

    return Promise.reject(error);
  }
);

export { api };
export default api;
