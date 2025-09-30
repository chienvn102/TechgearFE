// 📡 PRODUCT SERVICE - API Integration Layer
// Tuân thủ nghiêm ngặt API_README.md và README_MongoDB.md

import type {
  Product,
  ProductListResponse,
  ProductResponse,
  CreateProductData,
  UpdateProductData,
  ProductFilters
} from '../types/product.types';

class ProductService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}`;
  }

  // 📋 PRODUCT CRUD OPERATIONS

  /**
   * Lấy danh sách tất cả products với pagination và filters
   * GET /api/v1/products
   */
  async getProducts(filters?: ProductFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `${this.baseUrl}/products?${queryParams.toString()}` : `${this.baseUrl}/products`;
    
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
   * Lấy product theo ID với images
   * GET /api/v1/products/{id}
   */
  async getProductById(id: string) {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tạo product mới
   * POST /api/v1/products
   */
  async createProduct(data: CreateProductData) {
    const response = await fetch(`${this.baseUrl}/products`, {
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
   * Cập nhật product
   * PUT /api/v1/products/{id}
   */
  async updateProduct(id: string, data: UpdateProductData) {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
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
   * Xóa product
   * DELETE /api/v1/products/{id}
   */
  async deleteProduct(id: string) {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
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
   * Lấy product images theo product ID
   * GET /api/v1/upload/product/{pd_id}/images
   */
  async getProductImages(productId: string, color?: string) {
    const queryParams = new URLSearchParams();
    if (color) {
      queryParams.append('color', color);
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseUrl}/upload/product/${productId}/images?${queryParams.toString()}`
      : `${this.baseUrl}/upload/product/${productId}/images`;

    const response = await fetch(endpoint, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Lấy products theo color
   * GET /api/v1/products/by-color/{color}
   */
  async getProductsByColor(color: string, filters?: ProductFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseUrl}/products/by-color/${color}?${queryParams.toString()}`
      : `${this.baseUrl}/products/by-color/${color}`;

    const response = await fetch(endpoint, {
      headers: this.getHeaders()
    });

      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Lấy products theo player
   * GET /api/v1/products/by-player/{playerId}
   */
  async getProductsByPlayer(playerId: string, filters?: ProductFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseUrl}/products/by-player/${playerId}?${queryParams.toString()}`
      : `${this.baseUrl}/products/by-player/${playerId}`;

    const response = await fetch(endpoint, {
      headers: this.getHeaders()
    });
      
      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

  // 🖼️ PRODUCT IMAGE METHODS

  /**
   * Upload product image
   * POST /api/v1/upload/product-image
   */
  async uploadProductImage(productId: string, formData: FormData) {
    // Add pd_id to formData
    formData.append('pd_id', productId);
    
    const response = await fetch(`${this.baseUrl}/upload/product-image`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthToken()
        // Don't set Content-Type for FormData, let browser set it with boundary
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

  /**
   * Delete product image
   * DELETE /api/v1/upload/product-image/{imageId}
   */
  async deleteProductImage(imageId: string) {
    const response = await fetch(`${this.baseUrl}/upload/product-image/${imageId}`, {
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
   * Set primary image
   * PUT /api/v1/upload/product-image/{imageId}/set-default
   */
  async setPrimaryImage(imageId: string) {
    const response = await fetch(`${this.baseUrl}/upload/product-image/${imageId}/set-default`, {
      method: 'PUT',
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
}

export const productService = new ProductService();