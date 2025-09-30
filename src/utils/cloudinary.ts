// 🖼️ CLOUDINARY UTILITIES - Product Image Transformations
// Tuân thủ backend Cloudinary config

/**
 * Generate optimized Cloudinary URL for product images
 * @param imageUrl - Original image URL or Cloudinary public_id
 * @param width - Desired width
 * @param height - Desired height
 * @param crop - Crop mode (fill, fit, scale, etc.)
 * @returns Optimized Cloudinary URL
 */
export const getProductImageUrl = (
  imageUrl: string, 
  width: number = 500, 
  height: number = 500, 
  crop: 'fill' | 'fit' | 'scale' | 'crop' = 'fill'
): string => {
  if (!imageUrl) {
    return '';
  }

  // Don't process placeholder images
  if (imageUrl.includes('placeholder-product') || imageUrl.includes('placeholder')) {
    return imageUrl;
  }

  // If it's already a Cloudinary URL, add transformations
  if (imageUrl.includes('cloudinary.com')) {
    try {
      // Extract public_id from URL
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
        const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        
        // Generate optimized URL with transformations
        const optimizedUrl = `https://res.cloudinary.com/dfcerueaq/image/upload/w_${width},h_${height},c_${crop},f_auto,q_auto/${publicId}`;
        return optimizedUrl;
      }
    } catch (error) {
      }
  }

  // If it's a local file path, convert to full URL
  if (imageUrl.startsWith('/') || imageUrl.startsWith('uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}/${imageUrl.replace(/^\//, '')}`;
    return fullUrl;
  }

  // Return original URL if it's already a full URL
  return imageUrl;
};

/**
 * Get product image URLs for different sizes
 * @param imageUrl - Original image URL
 * @returns Object with different size URLs
 */
export const getProductImageUrls = (imageUrl: string) => {
  return {
    thumbnail: getProductImageUrl(imageUrl, 200, 200, 'fill'),
    medium: getProductImageUrl(imageUrl, 500, 500, 'fill'),
    large: getProductImageUrl(imageUrl, 1000, 1000, 'fill'),
    original: getProductImageUrl(imageUrl, 0, 0, 'fit')
  };
};

/**
 * Get banner image URLs for different sizes
 * @param imageUrl - Original image URL
 * @returns Object with different size URLs
 */
export const getBannerImageUrls = (imageUrl: string) => {
  return {
    thumbnail: getProductImageUrl(imageUrl, 300, 169, 'fit'),
    medium: getProductImageUrl(imageUrl, 800, 450, 'fit'),
    large: getProductImageUrl(imageUrl, 1920, 1080, 'fit'),
    display: getProductImageUrl(imageUrl, 2560, 1440, 'fill')
  };
};

/**
 * Get brand image URLs for different sizes
 * @param imageUrl - Original image URL
 * @returns Object with different size URLs
 */
export const getBrandImageUrls = (imageUrl: string) => {
  return {
    thumbnail: getProductImageUrl(imageUrl, 150, 150, 'fit'),
    medium: getProductImageUrl(imageUrl, 300, 300, 'fit'),
    large: getProductImageUrl(imageUrl, 600, 600, 'fit')
  };
};

/**
 * Check if URL is a Cloudinary URL
 * @param url - URL to check
 * @returns boolean
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com');
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id or null
 */
export const extractPublicId = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
      const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
      return publicIdWithExt.split('.')[0];
    }
  } catch (error) {
    }

  return null;
};
