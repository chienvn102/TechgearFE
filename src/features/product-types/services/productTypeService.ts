// 📡 PRODUCT TYPE SERVICE - API Integration Layer
// Tuân thủ nghiêm ngặt API_README.md và README_MongoDB.md

export interface ProductType {
  _id: string;
  pdt_id: string;
  pdt_name: string;
  pdt_description?: string;
  is_active: boolean;
  created_at: string;
  __v?: number;
}

export interface ProductTypeListResponse {
  productTypes: ProductType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductTypeResponse {
  success: boolean;
  data: ProductTypeListResponse;
  message?: string;
}

export interface CreateProductTypeData {
  pdt_id: string;
  pdt_name: string;
  pdt_description?: string;
  is_active?: boolean;
}

export interface UpdateProductTypeData {
  pdt_id?: string;
  pdt_name?: string;
  pdt_description?: string;
  is_active?: boolean;
}

class ProductTypeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}`;
  }

  // Helper method để get headers
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

  /**
   * Lấy danh sách tất cả product types với pagination
   * GET /api/v1/product-types
   */
  async getProductTypes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<ProductTypeResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `${this.baseUrl}/product-types?${queryParams.toString()}` : `${this.baseUrl}/product-types`;
    
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
   * Lấy product type theo ID
   * GET /api/v1/product-types/{id}
   */
  async getProductTypeById(id: string): Promise<{ success: boolean; data: { productType: ProductType }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/product-types/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tạo product type mới
   * POST /api/v1/product-types
   */
  async createProductType(data: CreateProductTypeData): Promise<{ success: boolean; data: { productType: ProductType }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/product-types`, {
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
   * Cập nhật product type
   * PUT /api/v1/product-types/{id}
   */
  async updateProductType(id: string, data: UpdateProductTypeData): Promise<{ success: boolean; data: { productType: ProductType }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/product-types/${id}`, {
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
   * Xóa product type
   * DELETE /api/v1/product-types/{id}
   */
  async deleteProductType(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/product-types/${id}`, {
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
}

export const productTypeService = new ProductTypeService();
