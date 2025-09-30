'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { Button } from '@/shared/components/ui/Button';
// import { brandService, Brand, CreateBrandData, UpdateBrandData } from '@/features/products/services/brandService';

// Temporary direct API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  br_img?: string;
  br_note?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  product_count?: number;
}

interface CreateBrandData {
  br_name: string;
  brand_description?: string;
  br_note?: string;
  website_url?: string;
  is_active?: boolean;
}

interface UpdateBrandData extends Partial<CreateBrandData> {}

const brandService = {
  async getBrandById(id: string) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data: data.data.brand }; // ✅ Fix: brand nested in data.data.brand
    } catch (error: any) {
      throw new Error(error.message || 'Failed to load brand');
    }
  },

  async createBrand(data: CreateBrandData) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result.data.brand || result.data }; // ✅ Handle create response
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create brand');
    }
  },

  async updateBrand(id: string, data: UpdateBrandData) {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result.data.brand || result.data }; // ✅ Handle update response
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update brand');
    }
  },

  async uploadBrandImage(id: string, file: File) {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/brands/${id}/image`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result.data };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload brand image');
    }
  }
};

interface BrandFormProps {
  mode: 'create' | 'edit';
  brandId?: string;
  onSuccess?: (brandId: string) => void;
  onCancel?: () => void;
}

interface BrandFormData {
  br_name: string;
  brand_description: string;
  br_note: string;
  website_url: string;
  is_active: boolean;
}

const initialFormData: BrandFormData = {
  br_name: '',
  brand_description: '',
  br_note: '',
  website_url: '',
  is_active: true
};

function BrandForm({ mode, brandId, onSuccess, onCancel }: BrandFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BrandFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image management
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load brand data if editing
  useEffect(() => {
    if (mode === 'edit' && brandId) {
      loadBrandData();
    }
  }, [mode, brandId]);

  const loadBrandData = async () => {
    if (!brandId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await brandService.getBrandById(brandId);
      
      if (response.data) {
        const brand = response.data;
        setFormData({
          br_name: brand.br_name || '',
          brand_description: brand.brand_description || '',
          br_note: brand.br_note || '',
          website_url: brand.website_url || '',
          is_active: brand.is_active
        });

        if (brand.br_img) {
          setCurrentImage(brand.br_img);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load brand data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.br_name.trim()) {
      setError('Tên thương hiệu là bắt buộc');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let resultBrandId: string;

      if (mode === 'create') {
        // Create brand
        const createData: CreateBrandData = {
          br_name: formData.br_name.trim(),
          brand_description: formData.brand_description.trim() || undefined,
          br_note: formData.br_note.trim() || undefined,
          website_url: formData.website_url.trim() || undefined,
          is_active: formData.is_active
        };

        const response = await brandService.createBrand(createData);
        resultBrandId = response.data._id;
        
        } else {
        // Update brand
        if (!brandId) throw new Error('Brand ID is required for update');

        const updateData: UpdateBrandData = {
          br_name: formData.br_name.trim(),
          brand_description: formData.brand_description.trim() || undefined,
          br_note: formData.br_note.trim() || undefined,
          website_url: formData.website_url.trim() || undefined,
          is_active: formData.is_active
        };

        await brandService.updateBrand(brandId, updateData);
        resultBrandId = brandId;
        
        }

      // Upload image if selected
      if (selectedImage && resultBrandId) {
        try {
          setUploadingImage(true);
          await brandService.uploadBrandImage(resultBrandId, selectedImage);
          } catch (imageError) {
          // Don't fail the whole operation for image upload errors
        } finally {
          setUploadingImage(false);
        }
      }

      // Success callback or navigation
      if (onSuccess) {
        onSuccess(resultBrandId);
      } else {
        router.push('/admin/brands');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
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
                  onClick={handleCancel}
                  className="mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Thêm thương hiệu mới' : 'Chỉnh sửa thương hiệu'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {mode === 'create' 
                      ? 'Tạo thương hiệu mới cho hệ thống' 
                      : 'Cập nhật thông tin thương hiệu'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="br_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên thương hiệu *
                    </label>
                    <input
                      type="text"
                      id="br_name"
                      name="br_name"
                      required
                      value={formData.br_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên thương hiệu..."
                    />
                  </div>

                  {/* Website URL */}
                  <div>
                    <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website_url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      id="is_active"
                      name="is_active"
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Không hoạt động</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="brand_description" className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả thương hiệu
                    </label>
                    <textarea
                      id="brand_description"
                      name="brand_description"
                      rows={4}
                      value={formData.brand_description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả về thương hiệu..."
                    />
                  </div>

                  {/* Note */}
                  <div className="md:col-span-2">
                    <label htmlFor="br_note" className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      id="br_note"
                      name="br_note"
                      rows={3}
                      value={formData.br_note}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh thương hiệu</h2>
                
                <div className="space-y-4">
                  {/* Current Image */}
                  {currentImage && !imagePreview && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={currentImage.startsWith('http') ? currentImage : `/admin/${currentImage}`}
                        alt="Current brand image"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-brand.svg';
                        }}
                      />
                      <div>
                        <p className="text-sm text-gray-600">Hình ảnh hiện tại</p>
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Hình ảnh mới được chọn</p>
                        <p className="text-xs text-gray-500">{selectedImage?.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <PhotoIcon className="h-5 w-5 mr-2 text-gray-400" />
                      {currentImage || imagePreview ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Chấp nhận: JPG, PNG, GIF. Tối đa 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving || uploadingImage}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  variant="admin"
                  disabled={saving || uploadingImage}
                  className="flex items-center"
                >
                  {saving || uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploadingImage ? 'Đang tải ảnh...' : 'Đang lưu...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      {mode === 'create' ? 'Tạo thương hiệu' : 'Cập nhật'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default BrandForm;
