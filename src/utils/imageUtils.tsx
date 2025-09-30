// 🔧 IMAGE UTILITIES - Safe URL validation for Next.js Image components
// Prevents "TypeError: Invalid URL" errors

/**
 * Safely validates if a URL is valid for Next.js Image component
 * @param url - The URL to validate
 * @returns boolean - true if URL is valid, false otherwise
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  const trimmedUrl = url.trim();
  
  // Check for common valid URL patterns
  const validPatterns = [
    /^https?:\/\/.+/,           // http:// or https://
    /^\/[^\/].*/,               // /path (relative from root)
    /^data:image\/.+;base64,/,  // data:image URLs
  ];

  return validPatterns.some(pattern => pattern.test(trimmedUrl));
};

/**
 * Safely gets a valid image URL or returns a fallback
 * @param url - The URL to validate
 * @param fallback - Fallback URL if original is invalid
 * @returns string - Valid URL or fallback
 */
export const getSafeImageUrl = (
  url: string | null | undefined, 
  fallback: string = '/placeholder-image.jpg'
): string => {
  return isValidImageUrl(url) ? url!.trim() : fallback;
};

/**
 * Custom Image component wrapper with built-in URL validation
 */
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
  fallbackElement?: React.ReactNode;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = '/placeholder-image.jpg',
  fallbackElement,
  alt,
  ...props
}) => {
  if (!isValidImageUrl(src)) {
    if (fallbackElement) {
      return <>{fallbackElement}</>;
    }
    
    // Return a placeholder div if no fallback URL
    if (!isValidImageUrl(fallbackSrc)) {
      return (
        <div 
          className={`bg-gray-200 flex items-center justify-center ${props.className || ''}`}
          style={{ width: props.width, height: props.height }}
        >
          <span className="text-gray-500 text-sm">No Image</span>
        </div>
      );
    }
    
    src = fallbackSrc;
  }

  return (
    <Image
      {...props}
      src={src!.trim()}
      alt={alt}
      onError={(e) => {
        // Hide broken image
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};
