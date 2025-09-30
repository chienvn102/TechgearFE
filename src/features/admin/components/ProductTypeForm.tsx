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
import { Button } from '@/shared/components/ui/Button';
import { productTypeService } from '@/features/products/services/productTypeService';

interface ProductTypeFormProps {
  mode: 'create' | 'edit';
  productTypeId?: string;
}

interface ProductTypeFormData {
  pdt_id: string;
  pdt_name: string;
  pdt_description?: string;
  is_active: boolean;
}

const initialFormData: ProductTypeFormData = {
  pdt_id: '',
  pdt_name: '',
  pdt_description: '',
  is_active: true
};

export function ProductTypeForm({ mode, productTypeId }: ProductTypeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductTypeFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load product type data for edit mode
  useEffect(() => {
    if (mode === 'edit' && productTypeId) {
      loadProductTypeData();
    }
  }, [mode, productTypeId]);

  const loadProductTypeData = async () => {
    if (!productTypeId) return;
    
    setLoading(true);
    try {
      const response = await productTypeService.getProductTypeById(productTypeId);
      if (response.success && response.data) {
        const productType = response.data as any;
        setFormData({
          pdt_id: productType.pdt_id || '',
          pdt_name: productType.pdt_name || '',
          pdt_description: productType.pdt_description || '',
          is_active: productType.is_active !== false
        });
      }
    } catch (err: any) {
      setError(`Failed to load product type: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          pt_img: file.name // For now, just use filename
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateProductTypeId = (productTypeName: string) => {
    return productTypeName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pdt_name.trim()) {
      setError('Tên loại sản phẩm là bắt buộc');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let response;

      if (mode === 'create') {
        // Auto-generate product type ID if not provided
        const submitData = {
          ...formData,
          pdt_id: formData.pdt_id || generateProductTypeId(formData.pdt_name)
        };
        
        response = await productTypeService.createProductType(submitData);
      } else {
        response = await productTypeService.updateProductType(productTypeId!, formData);
      }

      if (response.success) {
        router.push('/admin/product-types');
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Thêm loại sản phẩm mới' : 'Chỉnh sửa loại sản phẩm'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên loại sản phẩm *
              </label>
              <input
                type="text"
                name="pdt_name"
                value={formData.pdt_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên loại sản phẩm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã loại sản phẩm
              </label>
              <input
                type="text"
                name="pdt_id"
                value={formData.pdt_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tự động tạo nếu để trống"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mã định danh duy nhất (VD: SMARTPHONE, LAPTOP)
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Loại sản phẩm đang hoạt động</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                name="pdt_description"
                value={formData.pdt_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về loại sản phẩm, đặc điểm, ứng dụng..."
              />
            </div>
          </div>
        </div>

        {/* Product Type Image */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh loại sản phẩm</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload hình ảnh
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF tối đa 5MB
              </p>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            <XMarkIcon className="h-5 w-5 mr-2" />
            Hủy
          </Button>
          
          <Button
            type="submit"
            variant="admin"
            disabled={saving}
            loading={saving}
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Tạo loại sản phẩm' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
