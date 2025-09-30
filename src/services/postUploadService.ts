// services/postUploadService.ts
// Post image upload service với Cloudinary integration

import { api } from './api';

export interface PostUploadResponse {
  success: boolean;
  message: string;
  data: {
    post: {
      _id: string;
      post_id: string;
      post_title: string;
      post_content: string;
      post_img: string;
      cloudinary_public_id?: string;
      cloudinary_secure_url?: string;
    };
    cloudinary: {
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    };
  };
}

export interface PostImageInfo {
  success: boolean;
  message: string;
  data: {
    post: {
      _id: string;
      post_id: string;
      post_title: string;
      post_content: string;
      post_img: string | null;
      cloudinary_public_id?: string;
      cloudinary_secure_url?: string;
    };
    has_image: boolean;
    image_url: string | null;
    cloudinary_public_id: string | null;
  };
}

class PostUploadService {
  private baseUrl = '/upload/post';

  // Upload post image
  async uploadPostImage(postId: string, imageFile: File): Promise<PostUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('post_id', postId);

      const response = await api.post<PostUploadResponse>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Lỗi khi upload ảnh bài viết'
      );
    }
  }

  // Get post image info
  async getPostImageInfo(postId: string): Promise<PostImageInfo> {
    try {
      const response = await api.get<PostImageInfo>(`${this.baseUrl}/${postId}/image-info`);
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Lỗi khi lấy thông tin ảnh bài viết'
      );
    }
  }

  // Delete post image
  async deletePostImage(postId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${postId}`);
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Lỗi khi xóa ảnh bài viết'
      );
    }
  }

  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Chỉ chấp nhận file ảnh: JPG, JPEG, PNG, WEBP'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File ảnh không được vượt quá 5MB'
      };
    }

    return { isValid: true };
  }

  // Generate Cloudinary URL with transformations
  getImageUrl(publicId: string, transformation?: string): string {
    const baseUrl = 'https://res.cloudinary.com/dqpo9h5s2/image/upload';
    
    if (!transformation) {
      return `${baseUrl}/${publicId}`;
    }

    return `${baseUrl}/${transformation}/${publicId}`;
  }

  // Get optimized image URLs for posts (16:9 ratio)
  getOptimizedImageUrls(publicId: string) {
    return {
      // List thumbnail - small size for post cards
      thumbnail: this.getImageUrl(publicId, 'w_150,h_84,c_fill,f_auto,q_auto,g_center'),
      // Card size - medium size for post previews
      card: this.getImageUrl(publicId, 'w_400,h_225,c_fill,f_auto,q_auto,g_center'),
      // Mobile optimized - good for mobile devices
      mobile: this.getImageUrl(publicId, 'w_800,h_450,c_fill,f_auto,q_auto,g_center'),
      // Hero size - full size for post detail page
      hero: this.getImageUrl(publicId, 'w_1200,h_675,c_fill,f_auto,q_auto,g_center'),
      // Original with auto optimization
      original: this.getImageUrl(publicId, 'f_auto,q_auto')
    };
  }
}

export const postUploadService = new PostUploadService();
