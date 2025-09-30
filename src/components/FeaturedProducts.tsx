// FeaturedProducts Component - Hiển thị sản phẩm nổi bật theo style MCHOSE
// Lấy dữ liệu thực từ backend API products

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { productService } from '@/lib/api';
import type { Product } from '@/lib/api';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { Button } from '@/shared/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import ClientOnlyWrapper from './ClientOnlyWrapper';

interface FeaturedProductsProps {
  maxProducts?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onProductClick?: (product: Product) => void;
}

export default function FeaturedProducts({ 
  maxProducts = 6, 
  showViewAll = true,
  onViewAll,
  onProductClick 
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [maxProducts]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy dữ liệu từ backend API (giới hạn theo maxProducts)
      const response = await productService.getProducts({ limit: maxProducts });
      if (response.success && response.data?.products) {
        setProducts(response.data.products as Product[]);
      } else {
        setError('Không thể tải sản phẩm nổi bật');
      }
    } catch (err) {
      setError('Lỗi khi tải sản phẩm nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const { addItem, openCart } = useCart();

  const handleAddToCart = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering product click
    const product = products.find(p => p._id === productId);
    if (product) {
      addItem({
        _id: product._id,
        pd_id: product.pd_id,
        pd_name: product.pd_name,
        pd_price: product.pd_price,
        img: product.images?.[0]?.img,
        color: product.images?.[0]?.color,
        brand: product.br_id?.br_name
      });
      openCart(); // Mở cart dialog sau khi thêm
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Default: navigate to product detail page
      window.location.href = `/products/${product._id}`;
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Default: navigate to products page
      window.location.href = '/products';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Horizontal Scroll Skeleton */}
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: maxProducts }).map((_, index) => (
            <div key={`loading-${index}`} className="flex-shrink-0 w-80">
              <div className="bg-gray-200 rounded-xl aspect-square mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchFeaturedProducts}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không có sản phẩm nào để hiển thị</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Sản phẩm nổi bật
          </h2>
          <p className="text-gray-600 mt-1">
            Những sản phẩm được yêu thích nhất
          </p>
        </div>
        
        {showViewAll && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewAll}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Xem tất cả
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Products Horizontal Scroll Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Products Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80 group cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <SafeImage
                      src={product.images[0].img}
                      alt={product.pd_name}
                      width={320}
                      height={320}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crop="fit"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}

                  {/* Quick Add Button - Hiện khi hover vào ảnh */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      className="bg-black text-white px-6 py-3 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                      onClick={(e) => handleAddToCart(product._id, e)}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.pd_name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.pd_price)}
                    </span>
                    
                    {product.pd_quantity > 0 ? (
                      <span className="text-sm text-green-600 font-medium">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">
                        Hết hàng
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
