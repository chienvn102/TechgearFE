"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/features/products/types/product.types';
import { Button } from '@/shared/components/ui/Button';
import { CloudinaryImage } from '@/shared/components/ui/CloudinaryImage';
import { formatCurrency } from '@/shared/utils/formatters';

interface ProductCardProps {
  product: Product;
  variant?: 'customer' | 'admin';
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

function ProductCardBase({ product, variant = 'customer', onAddToCart, onToggleWishlist }: ProductCardProps) {
  // Backend đã sắp xếp primary image ở đầu tiên, chỉ cần lấy ảnh đầu tiên
  const firstImage = product.images?.[0];
  const coverImage = typeof firstImage === 'string' 
    ? firstImage 
    : firstImage?.img || firstImage?.cloudinary_secure_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
    >
      <div className="aspect-square bg-gray-50">
        {coverImage ? (
          <CloudinaryImage
            src={coverImage}
            alt={product.pd_name}
            className="w-full h-full object-cover"
            transformation="medium"
            fallbackSrc="/placeholder-product.jpg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.pd_name}</h3>
        <div className="text-blue-600 font-bold">{formatCurrency(product.pd_price)}</div>
        <div className="text-xs text-gray-500">Màu: {product.color}</div>

        {variant === 'customer' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1" onClick={() => onAddToCart?.(product._id)}>
              Thêm vào giỏ
            </Button>
            <Button size="sm" variant="outline" onClick={() => onToggleWishlist?.(product._id)}>
              Yêu thích
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const ProductCard = memo(ProductCardBase);
export default ProductCard;

