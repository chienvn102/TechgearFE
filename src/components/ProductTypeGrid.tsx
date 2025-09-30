// ProductTypeGrid Component - Hiển thị product types với ảnh như MCHOSE
// Lấy dữ liệu thực từ backend API product-types

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { productTypeService, ProductType } from '@/features/products/services/productTypeService';
import { SafeImage } from '@/shared/components/ui/SafeImage';

interface ProductTypeGridProps {
  onProductTypeClick?: (productType: ProductType) => void;
  maxProductTypes?: number;
}

export default function ProductTypeGrid({ onProductTypeClick, maxProductTypes = 5 }: ProductTypeGridProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // BẮT BUỘC: Lấy dữ liệu từ backend API
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
      const url = `${baseUrl}/product-types?limit=${maxProductTypes}&is_active=true&sort_by=pdt_name&sort_order=asc`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      if (data.success && data.data && data.data.productTypes) {
        setProductTypes(data.data.productTypes);
      } else {
        setError('Không thể tải loại sản phẩm');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải loại sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleProductTypeClick = (productType: ProductType) => {
    if (onProductTypeClick) {
      onProductTypeClick(productType);
    } else {
      // Default behavior: navigate to products page with product type filter
      window.location.href = `/products?productType=${productType.pdt_id}`;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: Math.min(maxProductTypes, 4) }).map((_, index) => (
          <div key={index}>
            <div className="bg-gray-200 rounded-2xl h-80"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProductTypes}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {productTypes.map((productType, index) => (
        <motion.div
          key={productType._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleProductTypeClick(productType)}
          className="group cursor-pointer"
        >
          <Link href={`/products?productType=${productType.pdt_id}`}>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group">
              {/* Product Type Image - Large như MCHOSE */}
              <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {productType.pdt_img || productType.cloudinary_secure_url ? (
                  <SafeImage
                    src={productType.pdt_img || productType.cloudinary_secure_url || ''}
                    alt={productType.pdt_name}
                    width={600}
                    height={320}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">📦</span>
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có ảnh</p>
                    </div>
                  </div>
                )}
                
                {/* Gradient Overlay như MCHOSE */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Text Overlay với background đậm để text hiển thị rõ */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {/* Background overlay để text hiển thị rõ */}
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                      {productType.pdt_name}
                    </h3>
                    
                    {productType.pdt_note && (
                      <p className="text-gray-200 text-sm leading-relaxed line-clamp-2 mb-3">
                        {productType.pdt_note}
                      </p>
                    )}

                    {/* Product Count Badge */}
                    {productType.product_count !== undefined && (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-black border border-white/50">
                          {productType.product_count} sản phẩm
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect - Subtle border glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-500"></div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
