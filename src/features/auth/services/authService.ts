import { BaseService, API_ENDPOINTS } from '@/shared/services/api';
import type { ApiResponse, LoginRequest, LoginResponse, User } from '@/types';

/**
 * Authentication Service
 * Handles user authentication with JWT tokens
 * Integrates with backend API authentication endpoints
 */
class AuthService extends BaseService {
  constructor() {
    super(''); // No base URL prefix for auth endpoints
  }

  /**
   * Admin Login
   * POST /auth/login hoặc /auth/admin/login
   */
  async adminLogin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.data) {
      // Store token và user data
      this.storeAuthData(response.data.token, response.data.user);
    }
    
    return response;
  }

  /**
   * Customer Login
   * POST /auth/customer/login
   */
  async customerLogin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.CUSTOMER_LOGIN, credentials);
    
    if (response.success && response.data) {
      // Store token và user data
      this.storeAuthData(response.data.token, response.data.user);
    }
    
    return response;
  }

  /**
   * General Login (auto-detect user type)
   * POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Use environment variable for API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    
    try {
      const fetchResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await fetchResponse.json();
      // Transform to ApiResponse format
      const response: ApiResponse<LoginResponse> = {
        success: data.success || fetchResponse.ok,
        message: data.message,
        data: data.data,
      };
      
      if (response.success && response.data) {
        // Store token và user data
        this.storeAuthData(response.data.token, response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Customer Register
   * POST /auth/register
   */
  async register(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone_number: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    if (response.success && response.data) {
      // Store token và user data after successful registration
      this.storeAuthData(response.data.token, response.data.user);
    }
    
    return response;
  }

  /**
   * Logout
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      // Try to call logout API, but don't fail if it doesn't work
      const token = localStorage.getItem('auth_token');
      if (token) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      // Even if API call fails, clear local data
      } finally {
      this.clearAuthData();
      
      // Clear cart on logout
      localStorage.removeItem('cart');
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Thử các key names khác nhau để tìm user data
      const userData = localStorage.getItem('user_data') || 
                      localStorage.getItem('user') || 
                      localStorage.getItem('authUser') ||
                      localStorage.getItem('currentUser');
      
      if (!userData) {
        return null;
      }
      
      const user = JSON.parse(userData);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Thử các key names khác nhau để tìm token
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('auth-token') || 
           localStorage.getItem('token') ||
           sessionStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const result = !!(token && user);
    
    return result;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser() as any; // Use any to handle API response structure
    if (!user) return false;
    
    // Admin users have role_id object structure:
    // { role_id: { _id: "...", role_id: "ADMIN", role_name: "Administrator" } }
    if (user.role_id?.role_id === 'ADMIN') {
      return true;
    }
    
    // Alternative role structure
    if (user.role?.role_id === 'ADMIN') {
      return true;
    }
    
    return false;
  }

  /**
   * Check if current user is manager
   */
  isManager(): boolean {
    const user = this.getCurrentUser() as any;
    if (!user) return false;
    
    // Debug logging
    console.log('🔍 isManager() check:', {
      user,
      role_id: user.role_id,
      role_id_role_id: user.role_id?.role_id,
      role: user.role,
      role_role_id: user.role?.role_id
    });
    
    // Manager users have role_id object structure:
    // { role_id: { _id: "...", role_id: "MANAGER", role_name: "Manager" } }
    if (user.role_id?.role_id === 'MANAGER') {
      console.log('✅ Manager detected via role_id.role_id');
      return true;
    }
    
    // Alternative role structure
    if (user.role?.role_id === 'MANAGER') {
      console.log('✅ Manager detected via role.role_id');
      return true;
    }
    
    console.log('❌ Not a manager');
    return false;
  }

  /**
   * Check if current user is staff (admin or manager)
   */
  isStaff(): boolean {
    return this.isAdmin() || this.isManager();
  }

  /**
   * Check if current user is customer
   */
  isCustomer(): boolean {
    const user = this.getCurrentUser() as any; // Use any to handle API response structure
    if (!user) return false;
    
    // Customer users have customer_id object structure:
    // { customer_id: { _id: "...", customer_id: "CUST001", name: "...", email: "...", phone_number: "..." } }
    return !!user.customer_id;
  }

  /**
   * Get user type
   */
  getUserType(): 'admin' | 'manager' | 'customer' | 'unknown' {
    const user = this.getCurrentUser();
    if (!user) return 'unknown';
    
    if (this.isAdmin()) return 'admin';
    if (this.isManager()) return 'manager';
    if (this.isCustomer()) return 'customer';
    
    return 'unknown';
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser() as any;
    if (!user) return null;
    
    return user.role_id?.role_id || user.role?.role_id || null;
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(token: string, user: User): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Lưu token với nhiều key names để tương thích
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth-token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      
      } catch (error) {
      }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Xóa tất cả key names có thể có
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user');
      
      } catch (error) {
      }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await this.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH);
      
      if (response.success && response.data) {
        // Update stored token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.data.token);
        }
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Basic JWT payload decode (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp ? payload.exp < currentTime : false;
    } catch (error) {
      return true;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
