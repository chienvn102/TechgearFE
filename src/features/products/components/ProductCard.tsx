'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/formatters';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  variant?: 'customer' | 'admin';
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  className?: string;
  isInWishlist?: boolean;
  loading?: boolean;
}

/**
 * ProductCard Component - CACHE CLEARED 2025-09-03 14:30
 * Displays product information with customer/admin variants
 * Integrates with real backend data via Product type
 * Fixed: Removed productImageService dependency - NO getMainImage function
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'customer',
  onAddToCart,
  onToggleWishlist,
  onProductClick,
  onEdit,
  onDelete,
  className,
  isInWishlist = false,
  loading = false
}) => {
  
  // Handle add to cart
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product._id);
  }, [product._id, onAddToCart]);

  // Handle wishlist toggle
  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(product._id);
  }, [product._id, onToggleWishlist]);

  // Handle edit (admin only)
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(product._id);
  }, [product._id, onEdit]);

  // Handle delete (admin only)
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      onDelete?.(product._id);
    }
  }, [product._id, onDelete]);

  // Handle product click
  const handleProductClick = useCallback(() => {
    onProductClick?.(product._id);
  }, [product._id, onProductClick]);

  // Get product image (first image or placeholder)
  // Note: Images are stored in separate product_image collection, not in product.product_images
  const productImage = product.images?.[0]?.img || product.product_images?.[0]?.img || '/images/placeholder-product.svg';
  
  // Calculate discount percentage
  const discountPercentage = product.pd_sale_price && product.pd_price > product.pd_sale_price
    ? Math.round(((product.pd_price - product.pd_sale_price) / product.pd_price) * 100)
    : 0;

  // Display price (sale price or regular price)
  const displayPrice = product.pd_sale_price && product.pd_sale_price < product.pd_price 
    ? product.pd_sale_price 
    : product.pd_price;

  // Stock status
  const isOutOfStock = product.pd_quantity <= 0;
  const isLowStock = product.pd_quantity > 0 && product.pd_quantity <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)" 
      }}
      className={cn(
        "product-card group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer",
        variant === 'customer' && "border border-blue-100 hover:border-blue-300",
        variant === 'admin' && "border border-gray-200 hover:border-gray-400",
        isOutOfStock && "opacity-75",
        className
      )}
      onClick={handleProductClick}
    >
      <Card className="h-full border-0 shadow-none">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <SafeImage
            src={productImage}
            alt={product.pd_name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="/images/placeholder-product.svg"
            loading="lazy"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              -{discountPercentage}%
            </Badge>
          )}

          {/* Brand Badge */}
          {product.brand_id && typeof product.brand_id === 'object' && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {product.brand_id.br_name}
            </Badge>
          )}

          {/* Player Badge */}
          {product.player_id && typeof product.player_id === 'object' && (
            <Badge variant="outline" className="absolute bottom-2 left-2">
              {product.player_id.player_name}
            </Badge>
          )}

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute bottom-2 right-2">
              Hết hàng
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge variant="warning" className="absolute bottom-2 right-2">
              Sắp hết
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          {/* Category */}
          {product.category_id && typeof product.category_id === 'object' && (
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              {product.category_id.cg_name}
            </p>
          )}

          {/* Product Name */}
          <h3 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors"
          >
            {product.pd_name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(displayPrice)}
            </span>
            {product.pd_sale_price && product.pd_sale_price < product.pd_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.pd_price)}
              </span>
            )}
          </div>

          {/* Player Team Info */}
          {product.player_id && typeof product.player_id === 'object' && product.player_id.team_name && (
            <p className="text-sm text-gray-600 mb-2">
              Đội: {product.player_id.team_name}
            </p>
          )}

          {/* Product Description */}
          {product.pd_description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.pd_description}
            </p>
          )}

          {/* Stock Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>Còn lại: {product.pd_quantity}</span>
            {product.pd_sold && (
              <span>Đã bán: {product.pd_sold}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {variant === 'customer' ? (
            /* Customer Actions */
            <div className="flex gap-2 w-full">
              <Button
                variant="customer"
                size="sm"
                className="flex-1"
                disabled={isOutOfStock || loading}
                onClick={handleAddToCart}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang thêm...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🛒 Thêm vào giỏ
                  </span>
                )}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleWishlist}
                className={cn(
                  "px-3",
                  isInWishlist && "text-red-500 bg-red-50"
                )}
              >
                {isInWishlist ? '❤️' : '🤍'}
              </Button>
            </div>
          ) : (
            /* Admin Actions */
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleEdit}
              >
                ✏️
              </Button>
              <Button
                variant="error"
                size="sm"
                onClick={handleDelete}
              >
                🗑️
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
