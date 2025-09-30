// 📡 CATEGORY SERVICE - API Integration Layer
// Tuân thủ nghiêm ngặt API_README.md và README_MongoDB.md

export interface Category {
  _id: string;
  cg_id: string;
  cg_name: string;
  category_description?: string;
  is_active: boolean;
  created_at: string;
  product_count?: number;
  __v?: number;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  data: CategoryListResponse;
  message?: string;
}

export interface CreateCategoryData {
  cg_id: string;
  cg_name: string;
  category_description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryData {
  cg_id?: string;
  cg_name?: string;
  category_description?: string;
  is_active?: boolean;
}

class CategoryService {
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
   * Lấy danh sách tất cả categories với pagination
   * GET /api/v1/categories
   */
  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<CategoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `${this.baseUrl}/categories?${queryParams.toString()}` : `${this.baseUrl}/categories`;
    
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
   * Lấy category theo ID
   * GET /api/v1/categories/{id}
   */
  async getCategoryById(id: string): Promise<{ success: boolean; data: { category: Category }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Tạo category mới
   * POST /api/v1/categories
   */
  async createCategory(data: CreateCategoryData): Promise<{ success: boolean; data: { category: Category }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/categories`, {
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
   * Cập nhật category
   * PUT /api/v1/categories/{id}
   */
  async updateCategory(id: string, data: UpdateCategoryData): Promise<{ success: boolean; data: { category: Category }; message?: string }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
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
   * Xóa category
   * DELETE /api/v1/categories/{id}
   */
  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
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

export const categoryService = new CategoryService();
