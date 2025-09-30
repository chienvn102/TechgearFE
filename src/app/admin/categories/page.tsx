'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { categoryService } from '@/features/categories/services/categoryService';
import type { Category } from '@/features/categories/services/categoryService';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const pageSize = 10;

  // Load categories from backend
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm
      };

      const response = await categoryService.getCategories(queryParams);
      
      // Debug log
      
      if (response && response.success && response.data && response.data.categories) {
        setCategories(response.data.categories || []);
        
        // Map backend pagination format to frontend format
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
          setTotalCategories(pagination.total || 0);
        }
      } else {
        setError('Không thể tải danh sách danh mục');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    const categoryName = category?.cg_name || 'danh mục này';
    
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}"?\n\nHành động này không thể hoàn tác.`)) return;
    
    try {
      await categoryService.deleteCategory(categoryId);
      alert('Xóa danh mục thành công!');
      loadCategories(); // Reload list
    } catch (err) {
      alert('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">
            Quản lý {totalCategories} danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Số sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TagIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {category.cg_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {category.cg_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {category.category_description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-900">
                      {category.product_count || 0} sản phẩm
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/categories/${category._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/categories/${category._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCategories)}</span> trong{' '}
                  <span className="font-medium">{totalCategories}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg">Không tìm thấy danh mục nào</p>
              <p className="text-sm mt-2">Hãy thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
