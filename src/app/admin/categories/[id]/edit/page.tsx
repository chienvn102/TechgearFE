'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { categoryService } from '@/features/categories/services/categoryService';
import type { Category } from '@/features/categories/services/categoryService';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cg_name: '',
    category_description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load category details
  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getCategoryById(categoryId);
      
      if (response && response.success && response.data) {
        // Backend trả về {success: true, data: {category: {...}}}
        const categoryData = response.data.category || response.data;
        
        // Đảm bảo categoryData là Category object
        const category = 'cg_name' in categoryData ? categoryData : categoryData.category;
        
        setCategory(category);
        setFormData({
          cg_name: category.cg_name || '',
          category_description: category.category_description || '',
          is_active: category.is_active ?? true
        });
        } else {
        setError('Không thể tải thông tin danh mục');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cg_name.trim()) {
      newErrors.cg_name = 'Tên danh mục là bắt buộc';
    } else if (formData.cg_name.length < 2) {
      newErrors.cg_name = 'Tên danh mục phải có ít nhất 2 ký tự';
    }

    if (!formData.category_description.trim()) {
      newErrors.category_description = 'Mô tả danh mục là bắt buộc';
    } else if (formData.category_description.length < 10) {
      newErrors.category_description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Generate cg_id từ cg_name nếu cần update
      const generateCgId = (name: string): string => {
        return name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '');
      };

      const updateData = {
        cg_id: generateCgId(formData.cg_name.trim()),
        cg_name: formData.cg_name.trim(),
        category_description: formData.category_description.trim(),
        is_active: formData.is_active
      };

      const response = await categoryService.updateCategory(categoryId, updateData);
      
      if (response && response.success) {
        alert('Cập nhật danh mục thành công!');
        router.push(`/admin/categories/${categoryId}`);
      } else {
        throw new Error('Không thể cập nhật danh mục');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi khi cập nhật danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Không tìm thấy danh mục'}
        </div>
        <Link href="/admin/categories" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Quay lại danh sách danh mục
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/admin/categories/${categoryId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
            <p className="text-gray-600">Cập nhật thông tin danh mục "{category.cg_name}"</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tên danh mục */}
          <div>
            <label htmlFor="cg_name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cg_name"
              name="cg_name"
              value={formData.cg_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cg_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên danh mục..."
              disabled={saving}
            />
            {errors.cg_name && (
              <p className="mt-1 text-sm text-red-600">{errors.cg_name}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor="category_description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả danh mục <span className="text-red-500">*</span>
            </label>
            <textarea
              id="category_description"
              name="category_description"
              value={formData.category_description}
              onChange={handleInputChange}
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mô tả chi tiết về danh mục..."
              disabled={saving}
            />
            {errors.category_description && (
              <p className="mt-1 text-sm text-red-600">{errors.category_description}</p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={saving}
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Danh mục đang hoạt động
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Chỉ những danh mục hoạt động mới hiển thị cho khách hàng
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href={`/admin/categories/${categoryId}`}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Info */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Thông tin danh mục hiện tại:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>ID:</strong> {category.cg_id}</p>
          <p><strong>Số sản phẩm:</strong> {category.product_count || 0}</p>
          <p><strong>Ngày tạo:</strong> {new Date(category.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      {/* Helper Information */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Lưu ý khi chỉnh sửa:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Thay đổi tên danh mục có thể ảnh hưởng đến việc tìm kiếm của khách hàng</li>
          <li>• Tắt danh mục sẽ ẩn tất cả sản phẩm trong danh mục này khỏi khách hàng</li>
          <li>• Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm trong danh mục</li>
        </ul>
      </div>
    </motion.div>
  );
}
