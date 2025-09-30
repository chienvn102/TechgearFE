'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { categoryService } from '@/features/products/services/categoryService';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: string;
}

interface CategoryFormData {
  cg_id: string;
  cg_name: string;
  category_description?: string;
  is_active: boolean;
}

const initialFormData: CategoryFormData = {
  cg_id: '',
  cg_name: '',
  category_description: '',
  is_active: true
};

export function CategoryForm({ mode, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && categoryId) {
      loadCategoryData();
    }
  }, [mode, categoryId]);

  const loadCategoryData = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const response = await categoryService.getCategoryById(categoryId);
      if (response.success && response.data) {
        const category: any = response.data;
        setFormData({
          cg_id: category.cg_id || '',
          cg_name: category.cg_name || '',
          category_description: category.category_description || '',
          is_active: category.is_active !== false
        });
      }
    } catch (err: any) {
      setError(`Failed to load category: ${err.message}`);
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

  const generateCategoryId = (categoryName: string) => {
    return categoryName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cg_name.trim()) {
      setError('Tên danh mục là bắt buộc');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let response;
      if (mode === 'create') {
        const submitData = {
          ...formData,
          cg_id: formData.cg_id || generateCategoryId(formData.cg_name)
        };
        response = await categoryService.createCategory(submitData);
      } else {
        response = await categoryService.updateCategory(categoryId!, formData);
      }

      if (response.success) {
        router.push('/admin/categories');
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.back();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={handleCancel} className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục *</label>
              <input
                type="text"
                name="cg_name"
                value={formData.cg_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên danh mục"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã danh mục</label>
              <input
                type="text"
                name="cg_id"
                value={formData.cg_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tự động tạo nếu để trống"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                name="category_description"
                value={formData.category_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về danh mục..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Danh mục đang hoạt động</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            <XMarkIcon className="h-5 w-5 mr-2" />
            Hủy
          </Button>
          <Button type="submit" variant="admin" disabled={saving} loading={saving}>
            <CheckIcon className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
