'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brand } from '@/lib/api';

interface BrandGridProps {
  maxBrands?: number;
  onBrandClick?: (brand: Brand) => void;
}

export default function BrandGrid({ 
  maxBrands = 8, 
  onBrandClick 
}: BrandGridProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load brands from API
  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/v1/brands?limit=${maxBrands}&is_active=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data && result.data.brands) {
        setBrands(result.data.brands);
        } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [maxBrands]);

  const handleBrandClick = (brand: Brand) => {
    if (onBrandClick) {
      onBrandClick(brand);
    }
  };

  // Utility function to get optimized brand image URL
  const getBrandImageUrl = (imageUrl: string, width: number = 120, height: number = 120) => {
    if (!imageUrl) return '';
    
    // If it's already a Cloudinary URL, add transformations
    if (imageUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
          const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
          const publicId = publicIdWithExt.split('.')[0];
          
          // Generate optimized URL
          return `https://res.cloudinary.com/dfcerueaq/image/upload/w_${width},h_${height},c_fit,f_auto,q_auto/${publicId}`;
        }
      } catch (error) {
        }
    }
    
    return imageUrl;
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-gray-100 aspect-square flex items-center justify-center p-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Lỗi tải thương hiệu: {error}</p>
            <button 
              onClick={loadBrands}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Chưa có thương hiệu nào</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Phân phối chính hãng
          </h2>
          <p className="text-gray-600 text-lg">
            TechGear chỉ chọn hãng có sản phẩm đủ ngon để chúng tôi muốn xài trước khi bán
          </p>
        </div>
        
        {/* Brand Grid - 5 columns layout like the reference */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer group aspect-square flex items-center justify-center p-4"
              onClick={() => handleBrandClick(brand)}
            >
              {/* Brand Logo Container */}
              <div className="w-full h-full flex items-center justify-center">
                {(brand.br_img || brand.cloudinary_secure_url) ? (
                  <img
                    src={getBrandImageUrl(brand.br_img || brand.cloudinary_secure_url, 150, 150)}
                    alt={brand.br_name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to text
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                    onLoad={() => {
                      }}
                  />
                ) : null}
                
                {/* Fallback Text Logo */}
                <div 
                  className="text-center"
                  style={{ display: (brand.br_img || brand.cloudinary_secure_url) ? 'none' : 'block' }}
                >
                  <span className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                    {brand.br_name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Brands Button - ĐÃ BỎ */}
        {/* <div className="text-center mt-12">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => window.location.href = '/brands'}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Xem tất cả thương hiệu
          </motion.button>
        </div> */}
      </div>
    </section>
  );
}
