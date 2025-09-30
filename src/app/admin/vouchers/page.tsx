'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TicketIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { voucherService, type Voucher, type VoucherFilters } from '@/features/vouchers/services/voucherService';

// 🎯 VOUCHER MANAGEMENT PAGE - Giao diện tương tự Brand
// Tuân thủ nghiêm ngặt README_MongoDB.md và API_README.md

const VouchersPage = () => {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;

  /**
   * Load vouchers với pagination và search
   * Sử dụng đúng format response từ backend: {success: true, data: {...}}
   */
  const loadVouchers = async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const filters: VoucherFilters = {
        page: page,
        limit: itemsPerPage,
      };

      if (search.trim()) {
        filters.search = search.trim();
      }

      const response = await voucherService.getVouchers(filters);
      // ✅ Handle backend response format: {success: true, data: {vouchers: [], pagination: {}}}
      if (response.success && response.data) {
        const { vouchers: voucherList, pagination } = response.data;
        
        setVouchers(voucherList || []);
        setCurrentPage(pagination?.page || 1);
        setTotalPages(pagination?.pages || 1);
        setTotalItems(pagination?.total || 0);
        
        } else {
        setVouchers([]);
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vouchers');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load vouchers khi component mount
  useEffect(() => {
    loadVouchers(1, searchTerm);
  }, []);

  // Handle search với debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadVouchers(1, searchTerm);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadVouchers(page, searchTerm);
  };

  // Handle delete voucher
  const handleDelete = async (voucher: Voucher) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher "${voucher.voucher_name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await voucherService.deleteVoucher(voucher._id);
      
      // Reload current page
      await loadVouchers(currentPage, searchTerm);
      
      alert('Xóa voucher thành công!');
    } catch (err) {
      alert('Lỗi khi xóa voucher: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return 'Invalid Date';
    }
  };

  // Check if voucher is active and not expired
  const isVoucherValid = (voucher: Voucher): boolean => {
    if (!voucher.is_active) return false;
    
    try {
      const now = new Date();
      const startDate = new Date(voucher.start_date);
      const endDate = new Date(voucher.end_date);
      
      return now >= startDate && now <= endDate;
    } catch {
      return false;
    }
  };

  // Get voucher status
  const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.is_active) {
      return { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' };
    }
    
    try {
      const now = new Date();
      const startDate = new Date(voucher.start_date);
      const endDate = new Date(voucher.end_date);
      
      if (now < startDate) {
        return { label: 'Sắp bắt đầu', color: 'bg-yellow-100 text-yellow-800' };
      } else if (now > endDate) {
        return { label: 'Đã hết hạn', color: 'bg-red-100 text-red-800' };
      } else {
        return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' };
      }
    } catch {
      return { label: 'Lỗi ngày tháng', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <TicketIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h1>
            <p className="text-sm text-gray-500">
              Quản lý tất cả voucher giảm giá trong hệ thống
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => router.push('/admin/vouchers/create')}
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm Voucher</span>
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm voucher theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Voucher</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <TicketIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {vouchers.filter(v => isVoucherValid(v)).length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
              <p className="text-2xl font-bold text-red-600">
                {vouchers.filter(v => {
                  try {
                    return new Date() > new Date(v.end_date);
                  } catch {
                    return false;
                  }
                }).length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-yellow-600">
                {vouchers.filter(v => {
                  try {
                    const now = new Date();
                    const endDate = new Date(v.end_date);
                    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 7 && diffDays > 0 && v.is_active;
                  } catch {
                    return false;
                  }
                }).length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Lỗi:</p>
              <p>{error}</p>
              <button
                onClick={() => loadVouchers(currentPage, searchTerm)}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Vouchers Table */}
        {!loading && !error && (
          <>
            {vouchers.length === 0 ? (
              <div className="p-12 text-center">
                <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có voucher nào</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Không tìm thấy voucher phù hợp với từ khóa tìm kiếm.' : 'Chưa có voucher nào được tạo.'}
                </p>
                <button
                  onClick={() => {
                    router.push('/admin/vouchers/create');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Tạo voucher đầu tiên</span>
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Voucher
                        </th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giảm giá
                        </th>
                        <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn tối thiểu
                        </th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sử dụng
                        </th>
                        <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vouchers.map((voucher, index) => {
                        const status = getVoucherStatus(voucher);
                        
                        return (
                          <motion.tr
                            key={voucher._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="max-w-[200px]">
                                <div className="text-sm font-medium text-gray-900 truncate" title={voucher.voucher_name}>
                                  {voucher.voucher_name.length > 30 
                                    ? `${voucher.voucher_name.substring(0, 30)}...` 
                                    : voucher.voucher_name
                                  }
                                </div>
                                <div className="text-sm text-gray-500 font-mono">
                                  {voucher.voucher_code}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {voucher.discount_percent ? (
                                  <span className="font-semibold text-green-600">
                                    {voucher.discount_percent}%
                                  </span>
                                ) : voucher.discount_amount ? (
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(voucher.discount_amount)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </div>
                              {voucher.max_discount_amount && (
                                <div className="text-xs text-gray-500">
                                  Tối đa: {formatCurrency(voucher.max_discount_amount)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(voucher.min_order_value)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {voucher.current_uses} / {voucher.max_uses}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-purple-600 h-1.5 rounded-full" 
                                  style={{
                                    width: `${Math.min((voucher.current_uses / voucher.max_uses) * 100, 100)}%`
                                  }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => {
                                    router.push(`/admin/vouchers/${voucher._id}`);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200"
                                  title="Xem chi tiết"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    router.push(`/admin/vouchers/${voucher._id}/edit`);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200"
                                  title="Chỉnh sửa"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(voucher)}
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-all duration-200"
                                  title="Xóa"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {vouchers.map((voucher, index) => {
                    const status = getVoucherStatus(voucher);
                    
                    return (
                      <motion.div
                        key={voucher._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-200 p-4 last:border-b-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate" title={voucher.voucher_name}>
                              {voucher.voucher_name.length > 25 
                                ? `${voucher.voucher_name.substring(0, 25)}...` 
                                : voucher.voucher_name
                              }
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mt-1">
                              {voucher.voucher_code}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color} ml-2 flex-shrink-0`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">Giảm giá:</span>
                            <div className="font-semibold text-green-600">
                              {voucher.discount_percent ? (
                                `${voucher.discount_percent}%`
                              ) : voucher.discount_amount ? (
                                formatCurrency(voucher.discount_amount)
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Đơn tối thiểu:</span>
                            <div className="font-semibold">
                              {formatCurrency(voucher.min_order_value)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Sử dụng:</span>
                            <div>{voucher.current_uses} / {voucher.max_uses}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Hết hạn:</span>
                            <div>{formatDate(voucher.end_date)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              router.push(`/admin/vouchers/${voucher._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="text-xs">Chi tiết</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/admin/vouchers/${voucher._id}/edit`);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="text-xs">Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDelete(voucher)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                            title="Xóa"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="text-xs">Xóa</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> đến{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{' '}
                        trong tổng số <span className="font-medium">{totalItems}</span> voucher
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (page > totalPages) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 border text-sm font-medium rounded-md transition-colors ${
                                currentPage === page
                                  ? 'border-purple-500 bg-purple-600 text-white'
                                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VouchersPage;
