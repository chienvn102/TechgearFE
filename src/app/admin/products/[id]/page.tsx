'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
// Removed AdminSidebar and AdminHeader imports - using admin layout
import { Button } from '@/shared/components/ui/Button';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { productService } from '@/features/products/services/productService';
import type { Product } from '@/features/products/types/product.types';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProductById(productId);
      if (response.success && response.data?.product) {
        setProduct(response.data.product);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      await productService.deleteProduct(productId);
      router.push('/admin/products');
    } catch (err: any) {
      alert('Không thể xóa sản phẩm');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chi tiết sản phẩm
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {product.pd_name}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={`/admin/products/${product._id}/images`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  Quản lý ảnh
                </Link>
                <Link
                  href={`/admin/products/${product._id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Link>
                <Button
                  onClick={handleDeleteProduct}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>

            {/* Product Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                    <p className="text-sm text-gray-900 mt-1">{product.pd_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã sản phẩm (PD_ID)</label>
                    <p className="text-sm text-gray-900 mt-1">{product.pd_id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã SKU</label>
                    <p className="text-sm text-gray-900 mt-1">{product.sku}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giá sản phẩm</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.pd_price)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                    <p className="text-sm text-gray-900 mt-1">{product.pd_quantity}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tồn kho</label>
                    <p className="text-sm text-gray-900 mt-1">{product.stock_quantity}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                    <p className="text-sm text-gray-900 mt-1">{product.color}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? 'Có sẵn' : 'Không có sẵn'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên quan</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thương hiệu</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {typeof product.br_id === 'object' ? product.br_id.br_name : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loại sản phẩm</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {typeof product.pdt_id === 'object' ? product.pdt_id.pdt_name : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {typeof product.category_id === 'object' ? product.category_id.cg_name : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cầu thủ</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {product.player_id && typeof product.player_id === 'object' 
                        ? product.player_id.player_name 
                        : 'Không có'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(product.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày cập nhật</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(product.pd_day_updated).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {(product.pd_note || product.product_description) && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mô tả</h2>
                
                <div className="space-y-4">
                  {product.pd_note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                      <p className="text-sm text-gray-900 mt-1">{product.pd_note}</p>
                    </div>
                  )}
                  
                  {product.product_description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {product.product_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images Preview */}
            {product.images && product.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Ảnh sản phẩm</h2>
                  <Link
                    href={`/admin/products/${product._id}/images`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Quản lý ảnh →
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {product.images.slice(0, 6).map((image) => (
                    <div key={image._id} className="relative">
                      <SafeImage
                        src={image.img}
                        alt={`Product image ${image._id}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        width={96}
                        height={96}
                      />
                      {image.is_primary && (
                        <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                          Chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {product.images.length > 6 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Và {product.images.length - 6} ảnh khác...
                  </p>
                )}
              </div>
            )}
          </motion.div>
  );
}
