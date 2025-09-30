// 📡 BRAND SERVICE - API Integration Layer
// Tuân thủ nghiêm ngặt API_README.md

import type {
  Brand,
  BrandListResponse,
  BrandResponse,
  CreateBrandData,
  UpdateBrandData,
  BrandFilters
} from '../types/brand.types';

class BrandService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}`;
  }

  // 📋 BRAND CRUD OPERATIONS

  /**
   * Lấy danh sách tất cả brands với pagination và filters
   * GET /api/v1/brands
   */
  async getBrands(filters?: BrandFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `${this.baseUrl}/brands?${queryParams.toString()}` : `${this.baseUrl}/brands`;
    
    const response = await fetch(endpoint, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Lấy brand theo ID
   * GET /api/v1/brands/{id}
   */
  async getBrandById(id: string) {
    const response = await fetch(`${this.baseUrl}/brands/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tạo brand mới
   * POST /api/v1/brands
   */
  async createBrand(data: CreateBrandData) {
    const response = await fetch(`${this.baseUrl}/brands`, {
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
        errorMessage = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Cập nhật brand
   * PUT /api/v1/brands/{id}
   */
  async updateBrand(id: string, data: UpdateBrandData) {
    const response = await fetch(`${this.baseUrl}/brands/${id}`, {
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
        errorMessage = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Xóa brand
   * DELETE /api/v1/brands/{id}
   */
  async deleteBrand(id: string) {
    const response = await fetch(`${this.baseUrl}/brands/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Upload brand logo
   * POST /api/v1/upload/brand-logo
   */
  async uploadBrandImage(brandId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('brand_id', brandId); // Backend expects 'brand_id'

    const response = await fetch(`${this.baseUrl}/upload/brand-logo`, { // Correct endpoint
      method: 'POST',
      headers: {
        'Authorization': this.getAuthToken()
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = 'Unknown server error.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  // 🔧 HELPER METHODS
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = token;
    }

    return headers;
  }

  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || '';
      return token ? `Bearer ${token}` : '';
    }
    return '';
  }
}

export const brandService = new BrandService();
