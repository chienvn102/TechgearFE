'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { categoryService } from '@/features/categories/services/categoryService';
import type { Category } from '@/features/categories/services/categoryService';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load category details
  const loadCategoryDetail = async () => {
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
        } else {
        setError('Không thể tải thông tin danh mục');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!category) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa danh mục "${category.cg_name}"?\n\nHành động này không thể hoàn tác.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await categoryService.deleteCategory(category._id);
      alert('Xóa danh mục thành công!');
      router.push('/admin/categories');
    } catch (err: any) {
      alert(err.message || 'Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Không xác định';
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadCategoryDetail();
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
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/categories"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.cg_name}</h1>
              <p className="text-gray-600">Chi tiết danh mục sản phẩm</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/categories/${category._id}/edit`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
            <button
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Xóa
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tên danh mục</dt>
                  <dd className="text-lg text-gray-900">{category.cg_name}</dd>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-400 mr-3 mt-1">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="text-gray-900 leading-relaxed">
                    {category.category_description || 'Chưa có mô tả'}
                  </dd>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                  <dd className="text-gray-900">{formatDate(category.created_at)}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái</h2>
            
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-3 ${
                category.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                category.is_active ? 'text-green-800' : 'text-red-800'
              }`}>
                {category.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {category.is_active 
                ? 'Danh mục này đang hiển thị và có thể được khách hàng xem' 
                : 'Danh mục này đang tạm dừng và không hiển thị cho khách hàng'
              }
            </p>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Product Count */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Số sản phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {category.product_count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin kỹ thuật</h3>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID Danh mục</dt>
                <dd className="text-sm text-gray-900 font-mono">{category.cg_id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Database ID</dt>
                <dd className="text-sm text-gray-900 font-mono break-all">{category._id}</dd>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
            
            <div className="space-y-3">
              <Link
                href={`/admin/categories/${category._id}/edit`}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Chỉnh sửa danh mục
              </Link>
              
              <Link
                href="/admin/categories"
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
