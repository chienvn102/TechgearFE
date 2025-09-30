// 📡 VOUCHER SERVICE - API Integration Layer
// Tuân thủ nghiêm ngặt API_README.md

import { api as apiClient } from '@/services/api';

export interface Voucher {
  _id: string;
  voucher_id: string;
  voucher_code: string;
  voucher_name: string;
  discount_percent?: number;
  min_order_value: number;
  start_date: string | Date;
  end_date: string | Date;
  discount_amount?: number;
  max_discount_amount?: number;
  max_uses: number;
  current_uses: number;
  ranking_id?: string | any;
  is_active: boolean;
  created_at: string | Date;
  __v?: number;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VoucherResponse {
  voucher: Voucher;
}

export interface CreateVoucherData {
  voucher_code: string;
  voucher_name: string;
  discount_percent?: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  discount_amount?: number;
  max_discount_amount?: number;
  max_uses: number;
  ranking_id?: string;
  is_active?: boolean;
}

export interface UpdateVoucherData extends Partial<CreateVoucherData> {}

export interface VoucherFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  ranking_id?: string;
}

class VoucherService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}/vouchers`;
  }

  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
      return token ? `Bearer ${token}` : '';
    }
    return '';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.getAuthToken()
    };
  }

  /**
   * Lấy danh sách tất cả voucher với pagination
   * GET /api/v1/vouchers
   */
  async getVouchers(filters?: VoucherFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
    
    const response = await fetch(endpoint, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const responseClone = response.clone();
          errorMessage = await responseClone.text();
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Lấy voucher theo ID
   * GET /api/v1/vouchers/{id}
   */
  async getVoucherById(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tạo voucher mới
   * POST /api/v1/vouchers
   */
  async createVoucher(data: CreateVoucherData) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const responseClone = response.clone();
          errorMessage = await responseClone.text();
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Cập nhật voucher
   * PUT /api/v1/vouchers/{id}
   */
  async updateVoucher(id: string, data: UpdateVoucherData) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const responseClone = response.clone();
          errorMessage = await responseClone.text();
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Xóa voucher
   * DELETE /api/v1/vouchers/{id}
   */
  async deleteVoucher(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const responseClone = response.clone();
          errorMessage = await responseClone.text();
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Lấy danh sách voucher khả dụng cho customer
   * GET /api/v1/vouchers/available
   */
  async getAvailableVouchers() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/available`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Tìm voucher theo code
   * GET /api/v1/vouchers/search?code={voucher_code}
   */
  async searchVoucherByCode(code: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/search`, {
        params: { code: code }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const voucherService = new VoucherService();
