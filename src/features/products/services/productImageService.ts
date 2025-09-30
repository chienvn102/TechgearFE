// productImageService.ts - Dịch vụ xử lý ảnh sản phẩm
// ✅ TUÂN THỦ: Tích hợp với backend API theo API_README.md
// ✅ BACKEND COMPATIBILITY: Hỗ trợ cấu trúc lưu trữ ảnh mới
// ✅ STORAGE STRUCTURE: public/uploads/{type}/{year}/{month}/{size}/

import { apiClient } from '@/shared/services/api';

// ✅ TYPE DEFINITIONS: Local types for product image service
interface ProductImage {
  pdi_id: string;
  pd_id: string;
  pdi_url: string;
  color?: string;
  is_primary: boolean;
  pdi_note?: string;
  created_at: Date;
  updated_at: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ✅ BACKEND INTEGRATION: Field names theo MongoDB schema
export interface ProductImageData {
  pd_id: string;         // ✅ BẮT BUỘC: Product ID từ backend
  color?: string;        // ✅ OPTIONAL: Color variant 
  is_primary?: boolean;  // ✅ BACKEND: Ảnh chính hay không
  pdi_note?: string;     // ✅ BACKEND: Ghi chú về ảnh
}

// ✅ UPLOAD RESPONSE: Cấu trúc response từ backend
export interface UploadImageResponse {
  success: boolean;
  data: {
    product_image: ProductImage;
    image_urls: {
      thumbnail: string;   // ✅ 200px - cho danh sách sản phẩm
      medium: string;      // ✅ 500px - cho chi tiết sản phẩm  
      large: string;       // ✅ 1000px - cho zoom/popup
      original?: string;   // ✅ Ảnh gốc nếu cần
    };
  };
  message?: string;
}

class ProductImageService {
  private baseUrl = '/upload';  // ✅ API endpoint cho product images upload

  /**
   * ✅ UPLOAD IMAGE: Upload ảnh với tất cả thông tin cần thiết
   * Backend API: POST /api/v1/products/images
   * Required: pd_id, image file
   * Optional: color, is_primary, pdi_note
   */
  async uploadImage(
    file: File, 
    data: ProductImageData
  ): Promise<UploadImageResponse> {
    try {
      // ✅ VALIDATION: Kiểm tra required fields
      if (!data.pd_id) {
        throw new Error('Product ID (pd_id) is required');
      }

      if (!file) {
        throw new Error('Image file is required');
      }

      // ✅ FORM DATA: Chuẩn bị data cho multipart upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('pd_id', data.pd_id);
      
      if (data.color) {
        formData.append('color', data.color);
      }
      
      if (data.is_primary !== undefined) {
        formData.append('is_primary', data.is_primary.toString());
      }
      
      if (data.pdi_note) {
        formData.append('pdi_note', data.pdi_note);
      }

      // ✅ API CALL: Upload với proper headers
      const response = await apiClient.post<UploadImageResponse>(
        '/upload/product-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds cho upload
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload image'
      );
    }
  }

  /**
   * ✅ GET PRODUCT IMAGES: Lấy tất cả ảnh của sản phẩm
   * Backend API: GET /api/v1/products/{pd_id}/images
   */
  async getProductImages(pd_id: string): Promise<ApiResponse<ProductImage[]>> {
    try {
      const response = await apiClient.get<ApiResponse<ProductImage[]>>(
        `/upload/product/${pd_id}/images`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch product images'
      );
    }
  }

  /**
   * ✅ DELETE IMAGE: Xóa ảnh sản phẩm
   * Backend API: DELETE /api/v1/products/images/{pdi_id}
   */
  async deleteImage(pdi_id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/upload/product-image/${pdi_id}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to delete image'
      );
    }
  }

  /**
   * ✅ UPDATE IMAGE INFO: Cập nhật thông tin ảnh (không upload lại file)
   * Backend API: PUT /api/v1/products/images/{pdi_id}
   */
  async updateImageInfo(
    pdi_id: string, 
    data: Partial<ProductImageData>
  ): Promise<ApiResponse<ProductImage>> {
    try {
      const response = await apiClient.put<ApiResponse<ProductImage>>(
        `${this.baseUrl}/${pdi_id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update image info'
      );
    }
  }

  /**
   * ✅ SET PRIMARY IMAGE: Đặt ảnh làm ảnh chính
   * Backend API: PUT /api/v1/upload/product-image/{pdi_id}/set-default
   */
  async setPrimaryImage(pdi_id: string): Promise<ApiResponse<ProductImage>> {
    try {
      const response = await apiClient.put<ApiResponse<ProductImage>>(
        `/upload/product-image/${pdi_id}/set-default`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to set primary image'
      );
    }
  }

  /**
   * ✅ UPLOAD MULTIPLE IMAGES: Upload nhiều ảnh cùng lúc
   * Backend API: POST /api/v1/upload/product-images/multiple
   */
  async uploadMultipleImages(
    files: File[], 
    data: ProductImageData
  ): Promise<UploadImageResponse[]> {
    try {
      if (!data.pd_id) {
        throw new Error('Product ID (pd_id) is required');
      }

      if (!files || files.length === 0) {
        throw new Error('At least one image file is required');
      }

      const formData = new FormData();
      
      // Append all image files
      files.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('pd_id', data.pd_id);
      
      if (data.color) {
        formData.append('color', data.color);
      }
      
      if (data.pdi_note) {
        formData.append('pdi_note', data.pdi_note);
      }

      const response = await apiClient.post<UploadImageResponse[]>(
        '/upload/product-images/multiple',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for multiple uploads
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload multiple images'
      );
    }
  }

  /**
   * ✅ GET IMAGE URL: Xây dựng URL cho ảnh theo size
   * BACKEND STORAGE: /uploads/{type}/{year}/{month}/{size}/filename.webp
   * STATIC SERVING: Backend serves at /uploads endpoint
   */
  getImageUrl(imagePath: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    try {
      if (!imagePath) {
        return '/images/placeholder-product.png'; // ✅ Fallback image
      }

      // ✅ BACKEND COMPATIBILITY: Handle relative paths từ backend
      if (imagePath.startsWith('/uploads/')) {
        // Backend trả về full path: /uploads/products/2024/01/medium/filename.webp
        return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${imagePath}`;
      }

      // ✅ LEGACY SUPPORT: Handle old format nếu cần
      if (imagePath.startsWith('http')) {
        return imagePath; // Full URL
      }

      // ✅ CONSTRUCT URL: Xây dựng URL từ relative path
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${baseUrl}/uploads${cleanPath}`;

    } catch (error) {
      return '/images/placeholder-product.png';
    }
  }

  /**
   * ✅ GET IMAGE URL BY SIZE: Lấy URL theo size cụ thể
   * Tự động thay đổi size trong path nếu cần
   */
  getImageUrlBySize(imagePath: string, targetSize: 'thumbnail' | 'medium' | 'large'): string {
    try {
      if (!imagePath) {
        return '/images/placeholder-product.png';
      }

      // ✅ SIZE REPLACEMENT: Thay đổi size trong path
      const sizeMap = {
        'thumbnail': 'thumbnail',
        'medium': 'medium', 
        'large': 'large'
      };

      // Pattern: /uploads/products/2024/01/{currentSize}/filename.webp
      const pathWithNewSize = imagePath.replace(
        /(\/uploads\/[^\/]+\/\d{4}\/\d{2}\/)([^\/]+)(\/)/,
        `$1${sizeMap[targetSize]}$3`
      );

      return this.getImageUrl(pathWithNewSize);

    } catch (error) {
      return '/images/placeholder-product.png';
    }
  }

  /**
   * ✅ GET MULTIPLE IMAGE URLS: Lấy tất cả sizes cho một ảnh
   * Return object với thumbnail, medium, large URLs
   */
  getMultipleImageUrls(imagePath: string) {
    return {
      thumbnail: this.getImageUrlBySize(imagePath, 'thumbnail'),
      medium: this.getImageUrlBySize(imagePath, 'medium'),
      large: this.getImageUrlBySize(imagePath, 'large')
    };
  }

  /**
   * ✅ VALIDATE IMAGE FILE: Kiểm tra file hợp lệ trước upload
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be JPEG, PNG, WebP, or GIF' };
    }

    return { valid: true };
  }

  /**
   * ✅ COMPRESS IMAGE: Nén ảnh trước upload (optional)
   * Chỉ compress phía client nếu cần, backend sẽ process lại
   */
  async compressImage(file: File, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // ✅ CALCULATE DIMENSIONS: Giữ tỷ lệ
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // ✅ DRAW AND COMPRESS
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          0.9 // Quality 90%
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

// ✅ EXPORT: Singleton instance
export const productImageService = new ProductImageService();
export default productImageService;

/* 
✅ SUMMARY - PRODUCTIMAGESERVICE FEATURES:

1. **Upload Image**: uploadImage(file, data) với pd_id required
2. **Get Images**: getProductImages(pd_id) - lấy tất cả ảnh sản phẩm  
3. **Delete Image**: deleteImage(pdi_id) - xóa ảnh
4. **Update Info**: updateImageInfo(pdi_id, data) - cập nhật thông tin
5. **Set Primary**: setPrimaryImage(pdi_id) - đặt ảnh chính
6. **Get URL**: getImageUrl(path, size) - xây dựng URL đúng format
7. **Get URL by Size**: getImageUrlBySize(path, size) - thay đổi size
8. **Multiple URLs**: getMultipleImageUrls(path) - tất cả sizes
9. **Validate File**: validateImageFile(file) - kiểm tra file hợp lệ
10. **Compress**: compressImage(file) - nén ảnh phía client

🔗 **Backend Integration**: 
- Storage: public/uploads/{type}/{year}/{month}/{size}/
- API: /api/v1/products/images
- Static: Backend serves at /uploads endpoint
- Fields: pd_id, color, is_primary, pdi_note theo MongoDB schema

📝 **Usage Example**:
```typescript
// Upload ảnh sản phẩm
const file = selectedFile;
const data = { pd_id: "product123", color: "red", is_primary: true };
const result = await productImageService.uploadImage(file, data);

// Lấy URL ảnh
const thumbnailUrl = productImageService.getImageUrl(imagePath, 'thumbnail');
const allSizes = productImageService.getMultipleImageUrls(imagePath);
```
*/

