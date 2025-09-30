import { BaseService, ApiResponse, apiClient } from '@/shared/services/api';

// Product Type Entity Interface
export interface ProductType {
  _id: string;
  pdt_id: string;
  pdt_name: string;
  pdt_img?: string;
  pdt_note?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product_count?: number;
  // Cloudinary fields
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  cloudinary_secure_url?: string;
  storage_type?: 'local' | 'cloudinary';
  img_metadata?: {
    size?: number;
    format?: string;
    width?: number;
    height?: number;
    resource_type?: string;
  };
}

// Product Type Creation DTO
export interface CreateProductTypeDto {
  pdt_id: string; // Required theo backend validation
  pdt_name: string;
  pdt_note?: string;
  is_active?: boolean;
}

// Product Type Update DTO
export interface UpdateProductTypeDto extends Partial<CreateProductTypeDto> {}

// Product Type Query Parameters
export interface ProductTypeQueryParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Product Type List Response
export interface ProductTypeListResponse {
  productTypes: ProductType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Product Type Service
class ProductTypeService extends BaseService {
  constructor() {
    super('product-types');
  }

  // Get all product types with pagination
  async getProductTypes(params?: ProductTypeQueryParams): Promise<ApiResponse<ProductTypeListResponse>> {
    try {
      const url = this.buildUrlWithParams('', params);
      const response = await this.get<ProductTypeListResponse>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get product type by ID
  async getProductTypeById(id: string): Promise<ApiResponse<{ productType: ProductType }>> {
    try {
      const response = await this.get<{ productType: ProductType }>(`/${id}`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new product type
  async createProductType(data: CreateProductTypeDto): Promise<ApiResponse<{ productType: ProductType }>> {
    try {
      const response = await this.post<{ productType: ProductType }>('/', data);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update product type
  async updateProductType(id: string, data: UpdateProductTypeDto): Promise<ApiResponse<{ productType: ProductType }>> {
    try {
      const response = await this.put<{ productType: ProductType }>(`/${id}`, data);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete product type
  async deleteProductType(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete<void>(`/${id}`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get active product types only
  async getActiveProductTypes(params?: ProductTypeQueryParams): Promise<ApiResponse<ProductTypeListResponse>> {
    try {
      const url = this.buildUrlWithParams('active', params);
      const response = await this.get<ProductTypeListResponse>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle product type status
  async toggleProductTypeStatus(id: string): Promise<ApiResponse<{ productType: ProductType }>> {
    try {
      const response = await this.put<{ productType: ProductType }>(`/${id}/toggle-status`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload product type image
  async uploadProductTypeImage(id: string, imageFile: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Direct upload endpoint
      const response = await apiClient.post(`/upload/product-type/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete product type image
  async deleteProductTypeImage(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete(`/upload/product-type/${id}`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get product type image info
  async getProductTypeImageInfo(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/upload/product-type/${id}/image-info`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get products for specific product type
  async getProductTypeProducts(id: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const url = this.buildUrlWithParams(`${id}/products`, params);
      const response = await this.get(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get product type statistics
  async getProductTypeStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/statistics');
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const productTypeService = new ProductTypeService();
