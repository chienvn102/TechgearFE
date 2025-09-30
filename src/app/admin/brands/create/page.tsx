'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { brandService } from '@/features/products/services/brandService';

interface CreateBrandData {
  br_id: string;
  br_name: string;
  br_note?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
}

export default function CreateBrandPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateBrandData>({
    br_id: '',
    br_name: '',
    br_note: '',
    brand_description: '',
    website_url: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Generate brand ID from name
  const generateBrandId = (name: string): string => {
    return 'BR' + Date.now() + name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.br_name.trim()) {
      newErrors.br_name = 'Tên thương hiệu là bắt buộc';
    }

    if (!formData.br_id.trim()) {
      newErrors.br_id = 'Mã thương hiệu là bắt buộc';
    }

    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'URL website không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate br_id if not provided BEFORE validation
    if (!formData.br_id.trim()) {
      const generatedId = generateBrandId(formData.br_name);
      setFormData(prev => ({
        ...prev,
        br_id: generatedId
      }));
      formData.br_id = generatedId; // Update current formData for validation
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create brand
      const response = await brandService.createBrand(formData);
      
      if (response.success && response.data) {
        // Backend returns: { success: true, data: { brand: {...} } }
        const brandData = (response.data as any).brand || response.data;
        
        // Upload image if selected
        if (imageFile && brandData?.br_id) {
          try {
            await brandService.uploadBrandImage(brandData.br_id, imageFile);
            } catch (imgError) {
            }
        }
        
        // Redirect to brands list
        router.push('/admin/brands');
      } else {
        alert('Có lỗi xảy ra khi tạo thương hiệu: ' + response.message);
      }
    } catch (error: any) {
      alert('Có lỗi xảy ra khi tạo thương hiệu: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateBrandData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate br_id when name changes
    if (field === 'br_name' && value && !formData.br_id) {
      setFormData(prev => ({
        ...prev,
        br_id: generateBrandId(value)
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">Thêm thương hiệu mới</h1>
          <p className="text-gray-600 mt-1">
            Tạo thương hiệu mới cho hệ thống
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>
            
            <div className="space-y-4">
              {/* Brand ID */}
              <div>
                <label htmlFor="br_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã thương hiệu *
                </label>
                <Input
                  id="br_id"
                  name="br_id"
                  value={formData.br_id}
                  onChange={(e) => handleInputChange('br_id', e.target.value)}
                  placeholder="Ví dụ: BR123456"
                  className={errors.br_id ? 'border-red-500' : ''}
                />
                {errors.br_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.br_id}</p>
                )}
              </div>

              {/* Brand Name */}
              <div>
                <label htmlFor="br_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên thương hiệu *
                </label>
                <Input
                  id="br_name"
                  name="br_name"
                  value={formData.br_name}
                  onChange={(e) => handleInputChange('br_name', e.target.value)}
                  placeholder="Ví dụ: Nike, Adidas, Apple..."
                  className={errors.br_name ? 'border-red-500' : ''}
                />
                {errors.br_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.br_name}</p>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <Input
                  id="website_url"
                  name="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.website_url ? 'border-red-500' : ''}
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kích hoạt thương hiệu</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Brand Image */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hình ảnh thương hiệu
            </h2>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo thương hiệu
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Brand preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">
                          Chọn hình ảnh
                        </span>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF tối đa 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin mô tả
          </h2>
          
          <div className="space-y-4">
            {/* Short Note */}
            <div>
              <label htmlFor="br_note" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú ngắn
              </label>
              <Input
                id="br_note"
                name="br_note"
                value={formData.br_note}
                onChange={(e) => handleInputChange('br_note', e.target.value)}
                placeholder="Ghi chú ngắn về thương hiệu..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="brand_description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                id="brand_description"
                name="brand_description"
                rows={4}
                value={formData.brand_description}
                onChange={(e) => handleInputChange('brand_description', e.target.value)}
                placeholder="Mô tả chi tiết về thương hiệu, lịch sử, đặc điểm..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Tạo thương hiệu
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
