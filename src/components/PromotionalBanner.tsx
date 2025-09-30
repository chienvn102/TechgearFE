'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Utility function to get optimized banner image URL
const getBannerImageUrl = (imageUrl: string, width: number = 2560, height: number = 1440) => {
  if (!imageUrl) {
    return '';
  }
  
  // If it's already a Cloudinary URL, add transformations
  if (imageUrl.includes('cloudinary.com')) {
    try {
      // Extract public_id from URL - handle different URL formats
      const urlParts = imageUrl.split('/');
      // Find the part after 'upload/' or 'image/upload/'
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
        const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        // Generate optimized URL with fill crop to cover entire container
        const optimizedUrl = `https://res.cloudinary.com/dfcerueaq/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto,g_center/${publicId}`;
        return optimizedUrl;
      }
    } catch (error) {
      }
  }
  
  return imageUrl;
};

interface Banner {
  _id: string;
  banner_id: string;
  pd_id: {
    _id: string;
    pd_name: string;
    pd_id: string;
  };
  is_active: boolean;
  banner_image_url?: string;
  banner_title?: string;
  banner_description?: string;
  banner_order?: number;
}

interface PromotionalBannerProps {
  autoSlide?: boolean;
  slideInterval?: number;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  autoSlide = true,
  slideInterval = 5000
}) => {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load banners from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/banners?is_active=true&limit=10`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data && data.data.banners) {
          const activeBanners = data.data.banners.filter((banner: Banner) => 
            banner.is_active && banner.banner_image_url
          );
          setBanners(activeBanners);
        } else {
          }
      } catch (err) {
        setError('Không thể tải banner');
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, banners.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Handle banner click - navigate to product page
  const handleBannerClick = (banner: Banner) => {
    if (banner.pd_id && banner.pd_id._id) {
      router.push(`/products/${banner.pd_id._id}`);
    }
  };

  // Don't render if loading or no banners
  if (loading) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px] bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Đang tải banner...</div>
        </div>
      </section>
    );
  }

  if (error || banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px] overflow-hidden bg-gray-900">
      {/* Main Banner */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full cursor-pointer"
        onClick={() => handleBannerClick(currentBanner)}
      >
        {/* Banner Image */}
        <div className="absolute inset-0">
          <img
            src={getBannerImageUrl(currentBanner.banner_image_url || '', 2560, 1440)}
            alt={currentBanner.banner_title || 'Banner'}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Fallback to original URL if optimized URL fails
              if (e.currentTarget.src !== currentBanner.banner_image_url) {
                e.currentTarget.src = currentBanner.banner_image_url || '';
              }
            }}
            onLoad={() => {
              }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Banner Content - MCHOSE Style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full text-center">
            
            {/* Product Features - Top */}
            {currentBanner.pd_id && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <p className="text-sm md:text-base text-white/80 font-medium tracking-wide">
                  {currentBanner.pd_id.br_id?.br_name && `${currentBanner.pd_id.br_id.br_name} | `}
                  {currentBanner.pd_id.pdt_id?.pdt_name && `${currentBanner.pd_id.pdt_id.pdt_name} | `}
                  {currentBanner.pd_id.category_id?.category_name && `${currentBanner.pd_id.category_id.category_name}`}
                </p>
              </motion.div>
            )}

            {/* Product Name - Large */}
            {currentBanner.pd_id && (
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 drop-shadow-2xl"
              >
                {currentBanner.pd_id.pd_name}
              </motion.h1>
            )}

            {/* Shop Now Button - Centered */}
            {currentBanner.pd_id && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <button 
                  onClick={() => handleBannerClick(currentBanner)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <span className="relative z-10">Shop Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </motion.div>
            )}

            {/* Price Display - Optional */}
            {currentBanner.pd_id && currentBanner.pd_id.pd_price && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <p className="text-xl md:text-2xl text-white/90 font-semibold">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(currentBanner.pd_id.pd_price)}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
            aria-label="Next banner"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PromotionalBanner;