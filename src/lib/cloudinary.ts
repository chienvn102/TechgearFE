// 🌩️ CLOUDINARY FRONTEND SERVICE
// Xử lý upload và display ảnh từ Cloudinary cho frontend

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
}

interface CloudinaryUploadResponse {
  success: boolean;
  data?: CloudinaryUploadResult;
  error?: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    this.apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

    if (!this.cloudName || !this.uploadPreset) {
      }
  }

  /**
   * Upload image directly to Cloudinary from frontend
   */
  async uploadImage(
    file: File, 
    folder: string = 'products',
    transformation?: string
  ): Promise<CloudinaryUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', `ecommerce/${folder}`);
      
      if (transformation) {
        formData.append('transformation', transformation);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          original_filename: result.original_filename,
          bytes: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fit' | 'fill' | 'scale' | 'crop';
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      effect?: string;
    } = {}
  ): string {
    if (!publicId || !this.cloudName) {
      return '/images/placeholder.jpg';
    }

    const {
      width,
      height, 
      crop = 'fit',
      quality = 'auto',
      format = 'auto',
      effect
    } = options;

    let transformations = [];

    if (width && height) {
      transformations.push(`w_${width},h_${height},c_${crop}`);
    } else if (width) {
      transformations.push(`w_${width}`);
    } else if (height) {
      transformations.push(`h_${height}`);
    }

    if (quality) {
      transformations.push(`q_${quality}`);
    }

    if (format) {
      transformations.push(`f_${format}`);
    }

    if (effect) {
      transformations.push(effect);
    }

    const transformationString = transformations.length > 0 
      ? transformations.join(',') + '/' 
      : '';

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}${publicId}`;
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: Deleting requires backend API call với admin credentials
      // Frontend không thể delete trực tiếp vì security
      const response = await fetch('/api/v1/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveUrls(publicId: string) {
    return {
      mobile: this.getOptimizedUrl(publicId, { width: 400, quality: 'auto', format: 'webp' }),
      tablet: this.getOptimizedUrl(publicId, { width: 800, quality: 'auto', format: 'webp' }),
      desktop: this.getOptimizedUrl(publicId, { width: 1200, quality: 'auto', format: 'webp' }),
      thumbnail: this.getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill', quality: 'auto', format: 'webp' })
    };
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Helper functions
export const getImageUrl = (imagePath: string | null, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string => {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it's a Cloudinary public_id, generate optimized URL
  const sizeMap = {
    thumbnail: { width: 150, height: 150, crop: 'fill' as const },
    medium: { width: 400, height: 300, crop: 'fit' as const },
    large: { width: 800, height: 600, crop: 'fit' as const }
  };

  return cloudinaryService.getOptimizedUrl(imagePath, sizeMap[size]);
};

export type { CloudinaryUploadResult, CloudinaryUploadResponse };
