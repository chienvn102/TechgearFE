'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { brandService } from '@/features/products/services/brandService';
import type { Brand } from '@/features/products/services/brandService';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params?.id as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    br_name: '',
    brand_description: '',
    website_url: '',
    br_img: '',
    is_active: true
  });

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
        
        // Populate form
        setFormData({
          br_name: brandData.br_name || '',
          brand_description: brandData.brand_description || brandData.br_note || '',
          website_url: brandData.website_url || '',
          br_img: brandData.br_img || '',
          is_active: brandData.is_active !== false
        });
        } else {
        setError('Không thể tải thông tin thương hiệu');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Delete existing image from server
  const deleteExistingImage = async () => {
    if (!brand?.br_id) return;
    
    try {
      setUploading(true);
      await brandService.deleteBrandImage(brand.br_id);
      
      // Update local state
      setFormData(prev => ({ ...prev, br_img: '' }));
      setBrand(prev => prev ? { ...prev, br_img: '' } : null);
      
      alert('Đã xóa ảnh thành công');
    } catch (error) {
      alert('Không thể xóa ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.br_name.trim()) {
      alert('Vui lòng nhập tên thương hiệu');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        br_name: formData.br_name.trim(),
        brand_description: formData.brand_description.trim(),
        website_url: formData.website_url.trim(),
        br_img: formData.br_img.trim(),
        is_active: formData.is_active
      };

      const response = await brandService.updateBrand(brandId, updateData);
      
      if (response && response.success) {
        // Upload new image if selected
        if (imageFile && brand?.br_id) {
          try {
            setUploading(true);
            await brandService.uploadBrandImage(brand.br_id, imageFile);
            } catch (imgError) {
            alert('Thương hiệu đã được cập nhật nhưng không thể tải lên ảnh mới');
          } finally {
            setUploading(false);
          }
        }
        
        router.push('/admin/brands');
      } else {
        setError('Không thể cập nhật thương hiệu');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi cập nhật thương hiệu');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !brand) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
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
      className="max-w-2xl mx-auto px-4 py-8"
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
              Chỉnh sửa thương hiệu
            </h1>
            <p className="text-gray-600">
              Cập nhật thông tin thương hiệu {brand?.br_name}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thương hiệu *
            </label>
            <input
              type="text"
              value={formData.br_name}
              onChange={(e) => handleInputChange('br_name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Nhập tên thương hiệu..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả thương hiệu
            </label>
            <textarea
              value={formData.brand_description}
              onChange={(e) => handleInputChange('brand_description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              placeholder="Mô tả về thương hiệu..."
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="https://example.com"
            />
          </div>

          {/* Brand Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh thương hiệu
            </label>
            <div className="space-y-4">
              {/* Current Image */}
              {brand?.br_img && !imagePreview && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Ảnh hiện tại:</p>
                  <div className="relative group">
                    <img
                      src={brand.br_img}
                      alt="Current brand image"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={deleteExistingImage}
                        disabled={uploading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {uploading ? 'Đang xóa...' : 'Xóa ảnh'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {brand?.br_img ? 'Tải lên ảnh mới (sẽ thay thế ảnh cũ):' : 'Tải lên ảnh mới:'}
                </p>
                
                {/* File Input */}
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      Chọn ảnh
                    </div>
                  </label>
                  
                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">Ảnh mới đã chọn:</p>
                    <img
                      src={imagePreview}
                      alt="New image preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="text-xs text-gray-500">
                      {imageFile?.name} ({Math.round((imageFile?.size || 0) / 1024)} KB)
                    </p>
                  </div>
                )}

                {/* No Image State */}
                {!brand?.br_img && !imagePreview && (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Chưa có ảnh</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_active"
                  checked={formData.is_active === true}
                  onChange={() => handleInputChange('is_active', true)}
                  className="mr-2"
                />
                <span className="text-sm text-green-600">Hoạt động</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_active"
                  checked={formData.is_active === false}
                  onChange={() => handleInputChange('is_active', false)}
                  className="mr-2"
                />
                <span className="text-sm text-red-600">Tạm dừng</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/admin/brands"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Đang lưu...' : uploading ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
