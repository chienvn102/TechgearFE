'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { brandService } from '@/features/products/services/brandService';
import type { Brand } from '@/features/products/services/brandService';

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params?.id as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brandId) {
      loadBrand();
    }
  }, [brandId]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await brandService.getBrandById(brandId);
      if (response && response.success && response.data) {
        // Backend returns: { success: true, data: { brand: {...} } }
        const brandData = (response.data as any).brand || response.data;
        setBrand(brandData);
      } else {
        setError('Không thể tải thông tin thương hiệu');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    
    try {
      await brandService.deleteBrand(brandId);
      router.push('/admin/brands');
    } catch (err) {
      alert('Không thể xóa thương hiệu');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Không thể tải thông tin thương hiệu
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/brands"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/brands"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết thương hiệu
            </h1>
            <p className="text-gray-600">
              Thông tin chi tiết về thương hiệu {brand.br_name}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/brands/${brandId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Brand Info */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Section */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
          {brand.br_img ? (
            <img
              src={brand.br_img}
              alt={brand.br_name || 'Brand'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold">
                    {(brand.br_name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-lg">Chưa có hình ảnh</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên thương hiệu</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {brand.br_name || 'Chưa có tên'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID thương hiệu</label>
                    <p className="text-sm text-gray-700 font-mono">
                      {brand.br_id || 'Chưa có ID'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        brand.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>

                  {/* Product Count */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số lượng sản phẩm</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {(brand as any).product_count || 0} sản phẩm
                    </p>
                  </div>

                  {/* Storage Type */}
                  {(brand as any).storage_type && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Loại lưu trữ ảnh</label>
                      <p className="text-sm text-gray-700">
                        {(brand as any).storage_type === 'cloudinary' ? 'Cloudinary' : 'Local Storage'}
                      </p>
                    </div>
                  )}

                  {/* Cloudinary Info */}
                  {(brand as any).cloudinary_public_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cloudinary ID</label>
                      <p className="text-xs text-gray-600 font-mono">
                        {(brand as any).cloudinary_public_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Website */}
              {brand.website_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Website
                  </h3>
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    {brand.website_url}
                  </a>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mô tả
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {brand.brand_description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mô tả chi tiết:</label>
                      <p className="text-gray-700 leading-relaxed mt-1">
                        {brand.brand_description}
                      </p>
                    </div>
                  )}
                  
                  {(brand as any).br_note && (brand as any).br_note !== brand.brand_description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ghi chú:</label>
                      <p className="text-gray-700 leading-relaxed mt-1">
                        {(brand as any).br_note}
                      </p>
                    </div>
                  )}
                  
                  {!brand.brand_description && !(brand as any).br_note && (
                    <p className="text-gray-500 italic">Chưa có mô tả cho thương hiệu này.</p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Thông tin hệ thống
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      Tạo: {brand.created_at ? new Date(brand.created_at).toLocaleDateString('vi-VN') : 'Không xác định'}
                    </span>
                  </div>
                  {brand.updated_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        Cập nhật: {new Date(brand.updated_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Database ID:</span>
                    <span className="ml-2 font-mono text-xs">{brand._id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Link
          href="/admin/brands"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Quay lại danh sách
        </Link>
        <Link
          href={`/admin/brands/${brandId}/edit`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chỉnh sửa thương hiệu
        </Link>
      </div>
    </motion.div>
  );
}
