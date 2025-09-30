import { BaseService, ApiResponse, PaginationParams } from '@/shared/services/base-service';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

// Brand Entity Interface
export interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  br_img?: string;
  br_note?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
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

// Brand Creation DTO
export interface CreateBrandDto {
  br_id: string; // Required theo backend validation
  br_name: string;
  brand_description?: string;
  br_note?: string;
  website_url?: string;
  is_active?: boolean;
}

// Brand Update DTO
export interface UpdateBrandDto extends Partial<CreateBrandDto> {}

// Brand Query Parameters
export interface BrandQueryParams extends PaginationParams {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Brand List Response
export interface BrandListResponse {
  brands: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * BrandService - Quản lý API liên quan đến thương hiệu sản phẩm
 */
class BrandService extends BaseService<Brand> {
  constructor() {
    super(API_ENDPOINTS.BRAND);
  }

  /**
   * Lấy danh sách thương hiệu với phân trang và tìm kiếm
   * @param params Tham số truy vấn (trang, giới hạn, tìm kiếm, v.v.)
   */
  async getBrands(params: BrandQueryParams = {}): Promise<ApiResponse<BrandListResponse>> {
    try {
      const queryParams: Record<string, any> = {};
      
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      if (params.is_active !== undefined) queryParams.is_active = params.is_active;
      if (params.sort_by) queryParams.sort_by = params.sort_by;
      if (params.sort_order) queryParams.sort_order = params.sort_order;

      const url = this.buildUrlWithParams('', queryParams);
      return await this.get<BrandListResponse>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết một thương hiệu theo ID
   * @param id ID của thương hiệu cần lấy
   */
  async getBrandById(id: string): Promise<ApiResponse<Brand>> {
    try {
      return await this.get<Brand>(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo mới thương hiệu
   * @param data Dữ liệu thương hiệu cần tạo
   */
  async createBrand(data: CreateBrandDto): Promise<ApiResponse<Brand>> {
    try {
      return await this.post<Brand>('', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin thương hiệu
   * @param id ID của thương hiệu cần cập nhật
   * @param data Dữ liệu cập nhật
   */
  async updateBrand(id: string, data: UpdateBrandDto): Promise<ApiResponse<Brand>> {
    try {
      return await this.put<Brand>(id, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa thương hiệu
   * @param id ID của thương hiệu cần xóa
   */
  async deleteBrand(id: string): Promise<ApiResponse<void>> {
    try {
      return await this.delete<void>(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload hình ảnh cho thương hiệu sử dụng Cloudinary
   * @param id ID của thương hiệu
   * @param file File hình ảnh cần upload
   */
  async uploadBrandImage(id: string, file: File): Promise<ApiResponse<{ br_img: string; cloudinary_url?: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file); // Backend expects 'image' field for brand
      formData.append('brand_id', id);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
      const uploadUrl = `${baseUrl}/upload/brand-logo`;
      
      // Get token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Use fetch like productService for consistency
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // Transform response to match expected format
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            br_img: result.data.brand?.br_img || result.data.cloudinary_url || result.data.image_url,
            cloudinary_url: result.data.brand?.cloudinary_url || result.data.cloudinary_url
          },
          message: result.message
        };
      } else {
        return result;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload brand image');
    }
  }
  
  /**
   * Xóa hình ảnh của thương hiệu từ Cloudinary
   * @param id ID của thương hiệu
   */
  async deleteBrandImage(id: string): Promise<ApiResponse<void>> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${baseUrl}/upload-simple/brand/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `Delete failed: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const brandService = new BrandService();
