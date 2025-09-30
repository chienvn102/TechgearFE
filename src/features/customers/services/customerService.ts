// features/customers/services/customerService.ts
// Customer management service

import { api } from '@/services/api';

export interface CustomerAddress {
  _id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  address: string;
}

export interface Customer {
  _id: string;
  customer_id: string;
  name: string;
  email: string;
  phone_number: string;
  total_orders?: number;
  total_spent?: number;
  addresses?: CustomerAddress[];
}

export interface UserCustomer {
  _id: string;
  username: string;
  customer_id: Customer;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface SingleCustomerResponse {
  success: boolean;
  data: {
    customer: Customer;
  };
  message?: string;
}

export interface UserCustomerResponse {
  success: boolean;
  data: {
    userCustomers: UserCustomer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface SingleUserCustomerResponse {
  success: boolean;
  data: {
    userCustomer: UserCustomer;
  };
  message?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone_number?: string;
}

export interface UpdateUserCustomerData {
  new_username?: string;
  password?: string;
  customer_info?: UpdateCustomerData;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
}

class CustomerService {
  private baseUrl = '/customers';
  private userCustomerUrl = '/user-customers';

  // Customer APIs
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerResponse> {
    try {
      const params: Record<string, string> = {};
      
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.search) params.search = filters.search;

      const response = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<SingleCustomerResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(customerId: string, data: UpdateCustomerData): Promise<SingleCustomerResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${customerId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current customer info (for authenticated user)
  async getCurrentCustomerInfo(): Promise<SingleCustomerResponse> {
    try {
      // Get current user profile
      const userResponse = await api.get('/auth/profile');
      if (userResponse.data.success && userResponse.data.data) {
        const user = userResponse.data.data.user;
        // If user has customer_id (populated), use customer data
        if (user.customer_id && typeof user.customer_id === 'object') {
          return {
            success: true,
            data: {
              customer: {
                _id: user.customer_id._id,
                customer_id: user.customer_id.customer_id,
                name: user.customer_id.name,
                email: user.customer_id.email,
                phone_number: user.customer_id.phone_number,
                total_orders: user.customer_id.total_orders || 0,
                total_spent: user.customer_id.total_spent || 0
              }
            }
          };
        } 
        // If user has customer_id as string, get customer details
        else if (user.customer_id && typeof user.customer_id === 'string') {
          const customerResponse = await this.getCustomerById(user.customer_id);
          return customerResponse;
        } 
        // If no customer_id, return user data as customer data
        else {
          return {
            success: true,
            data: {
              customer: {
                _id: user._id,
                customer_id: user.id || user._id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number || '',
                total_orders: 0,
                total_spent: 0
              }
            }
          };
        }
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (error) {
      throw error;
    }
  }

  // User Customer APIs
  async getUserCustomers(filters: CustomerFilters = {}): Promise<UserCustomerResponse> {
    try {
      const params: Record<string, string> = {};
      
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.search) params.search = filters.search;

      const response = await api.get(this.userCustomerUrl, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserCustomerByUsername(username: string): Promise<SingleUserCustomerResponse> {
    try {
      const response = await api.get(`${this.userCustomerUrl}/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUserCustomer(username: string, data: UpdateUserCustomerData): Promise<SingleUserCustomerResponse> {
    try {
      const response = await api.put(`${this.userCustomerUrl}/${username}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(username: string, data: UpdatePasswordData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.put(`${this.userCustomerUrl}/${username}/password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async adminResetPassword(username: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.put(`${this.userCustomerUrl}/${username}/admin-reset-password`, {
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Customer Address APIs
  async getCustomerAddresses(customerId: string): Promise<{ success: boolean; data: CustomerAddress[]; message?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/${customerId}/addresses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCustomerAddress(customerId: string, data: Omit<CustomerAddress, '_id' | 'customer_id'>): Promise<{ success: boolean; data: CustomerAddress; message?: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${customerId}/addresses`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCustomerAddress(customerId: string, addressId: string, data: Partial<Omit<CustomerAddress, '_id' | 'customer_id'>>): Promise<{ success: boolean; data: CustomerAddress; message?: string }> {
    try {
      const response = await api.put(`${this.baseUrl}/${customerId}/addresses/${addressId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomerAddress(customerId: string, addressId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/${customerId}/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const customerService = new CustomerService();
