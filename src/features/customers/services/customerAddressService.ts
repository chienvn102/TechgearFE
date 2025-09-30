import { apiClient } from '@/shared/services/api';

export interface CustomerAddress {
  _id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  address: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressRequest {
  name: string;
  phone_number: string;
  address: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  name?: string;
  phone_number?: string;
  address?: string;
  is_default?: boolean;
}

class CustomerAddressService {
  private baseUrl = '/customers';

  /**
   * Lấy danh sách địa chỉ của customer
   */
  async getCustomerAddresses(): Promise<CustomerAddress[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/addresses`);
      return response.data.data?.addresses || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo địa chỉ mới
   */
  async createAddress(addressData: CreateAddressRequest): Promise<CustomerAddress> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/addresses`, addressData);
      return response.data.data.address;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(addressId: string, addressData: UpdateAddressRequest): Promise<CustomerAddress> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/addresses/${addressId}`, addressData);
      return response.data.data.address;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(addressId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/addresses/${addressId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đặt địa chỉ làm mặc định
   */
  async setDefaultAddress(addressId: string): Promise<CustomerAddress> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/addresses/${addressId}/set-default`);
      return response.data.data.address;
    } catch (error) {
      throw error;
    }
  }
}

export const customerAddressService = new CustomerAddressService();
