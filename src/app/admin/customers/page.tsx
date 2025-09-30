'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { customerService } from '@/features/customers/services/customerService';
import type { UserCustomer } from '@/features/customers/services/customerService';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<UserCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const pageSize = 10;

  // Load customers from backend
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm
      };

      const response = await customerService.getUserCustomers(queryParams);
      
      // Debug log
      
      if (response && response.success && response.data && response.data.userCustomers) {
        setCustomers(response.data.userCustomers || []);
        
        // Map backend pagination format to frontend format
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
          setTotalCustomers(pagination.total || 0);
        }
      } else {
        setError('Không thể tải danh sách khách hàng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
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
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <UsersIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Khách hàng</h1>
            <p className="text-gray-600 mt-1">
              Quản lý {totalCustomers} khách hàng trong hệ thống
            </p>
          </div>
        </div>
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
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
          <button
            onClick={() => loadCustomers()}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow">
        {customers.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có khách hàng nào</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Không tìm thấy khách hàng phù hợp với từ khóa tìm kiếm.' : 'Chưa có khách hàng nào được tạo.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tài khoản
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer, index) => (
                    <motion.tr
                      key={customer._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {customer.customer_id.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.customer_id.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {customer.customer_id.customer_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.customer_id.email}</div>
                        <div className="text-sm text-gray-500">{customer.customer_id.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          @{customer.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => router.push(`/admin/customers/${customer.username}`)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/customers/${customer.username}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 p-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {customer.customer_id.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {customer.customer_id.name}
                        </h3>
                        <p className="text-sm text-gray-500">@{customer.username}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{customer.customer_id.email}</p>
                    <p className="text-sm text-gray-600">{customer.customer_id.phone_number}</p>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/admin/customers/${customer.username}`)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="text-xs">Chi tiết</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/customers/${customer.username}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="text-xs">Sửa</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCustomers)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{totalCustomers}</span> khách hàng
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
