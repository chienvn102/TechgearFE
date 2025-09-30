'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { categoryService } from '@/features/categories/services/categoryService';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cg_name: '',
    category_description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setLoading(true);
      
      // Generate cg_id từ cg_name
      const generateCgId = (name: string): string => {
        return name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '');
      };

      const categoryData = {
        cg_id: generateCgId(formData.cg_name.trim()),
        cg_name: formData.cg_name.trim(),
        category_description: formData.category_description.trim(),
        is_active: formData.is_active
      };

      const response = await categoryService.createCategory(categoryData);
      
      if (response && response.success) {
        alert('Tạo danh mục thành công!');
        router.push('/admin/categories');
      } else {
        throw new Error('Không thể tạo danh mục');
      }
    } catch (err: any) {
      alert(err.message || 'Đã xảy ra lỗi khi tạo danh mục');
    } finally {
      setLoading(false);
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
            href="/admin/categories"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thêm danh mục mới</h1>
            <p className="text-gray-600">Tạo danh mục sản phẩm cho hệ thống</p>
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
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
              href="/admin/categories"
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                'Tạo danh mục'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Helper Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Lưu ý khi tạo danh mục:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tên danh mục nên ngắn gọn và dễ hiểu</li>
          <li>• Mô tả chi tiết giúp khách hàng hiểu rõ về sản phẩm trong danh mục</li>
          <li>• Danh mục mới tạo sẽ cần được thêm sản phẩm để hoạt động hiệu quả</li>
          <li>• Bạn có thể chỉnh sửa thông tin danh mục sau khi tạo</li>
        </ul>
      </div>
    </motion.div>
  );
}
