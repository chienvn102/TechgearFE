'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { auditTrailService } from '@/features/audit/services/auditTrailService';
import { AuditTrail, AuditTrailFilters } from '@/features/audit/types/audit.types';
import { formatDate } from '@/utils/formatters';
import PermissionGuard from '@/components/PermissionGuard';

export default function AuditTrailPage() {
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditTrailFilters>({
    page: 1,
    limit: 20,
    action: 'all',
    table_name: 'all',
    role: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    create: 0,
    update: 0,
    delete: 0
  });

  // Load audit trails
  const loadAuditTrails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditTrailService.getAuditTrails(filters);
      
      if (response.success) {
        setAuditTrails(response.data.auditTrails);
        setPagination(response.data.pagination);
        
        // Calculate stats
        const all = response.data.auditTrails;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        setStats({
          total: response.data.pagination.total,
          today: all.filter(a => new Date(a.created_at) >= today).length,
          create: all.filter(a => a.action === 'CREATE').length,
          update: all.filter(a => a.action === 'UPDATE').length,
          delete: all.filter(a => a.action === 'DELETE').length
        });
      }
    } catch (err) {
      setError('Không thể tải lịch sử hoạt động');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditTrails();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key: keyof AuditTrailFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditTrails();
  };

  // Get action badge color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      default:
        return '📝';
    }
  };

  return (
    <PermissionGuard requiredPermission="/admin/audit-trail">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử hoạt động</h1>
            <p className="text-gray-600 mt-1">Theo dõi tất cả các thay đổi trong hệ thống</p>
        </div>
        <button
          onClick={loadAuditTrails}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <p className="text-sm text-gray-600">Tổng số</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <p className="text-sm text-gray-600">Hôm nay</p>
          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <p className="text-sm text-gray-600">Tạo mới</p>
          <p className="text-2xl font-bold text-green-600">{stats.create}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <p className="text-sm text-gray-600">Cập nhật</p>
          <p className="text-2xl font-bold text-blue-600">{stats.update}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <p className="text-sm text-gray-600">Xóa</p>
          <p className="text-2xl font-bold text-red-600">{stats.delete}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Username, tên người dùng..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hành động</label>
            <select
              value={filters.action || 'all'}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="CREATE">Tạo mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa</option>
            </select>
          </div>

          {/* Table Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bảng dữ liệu</label>
            <select
              value={filters.table_name || 'all'}
              onChange={(e) => handleFilterChange('table_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="product">Sản phẩm</option>
              <option value="order">Đơn hàng</option>
              <option value="customer">Khách hàng</option>
              <option value="user_management">Quản lý user</option>
              <option value="brand">Thương hiệu</option>
              <option value="category">Danh mục</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="USER">Khách hàng</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Lọc
            </button>
          </div>
        </form>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : auditTrails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Không có lịch sử hoạt động</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bảng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị cũ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditTrails.map((trail) => (
                    <motion.tr
                      key={trail._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(trail.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {/* Admin/Manager User */}
                          {typeof trail.user_id === 'object' && trail.user_id !== null && (
                            <>
                              <div className="font-medium text-gray-900">
                                {trail.user_id.username}
                              </div>
                              <div className="text-gray-500">
                                {trail.user_id.name}
                              </div>
                              {trail.user_id.role_id && (
                                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 mt-1">
                                  {typeof trail.user_id.role_id === 'object' 
                                    ? trail.user_id.role_id.role_name 
                                    : trail.user_id.role_id}
                                </span>
                              )}
                            </>
                          )}
                          
                          {/* Customer User */}
                          {typeof trail.customer_user_id === 'object' && trail.customer_user_id !== null && (
                            <>
                              <div className="font-medium text-gray-900">
                                {trail.customer_user_id.username}
                              </div>
                              {trail.customer_user_id.customer_id && typeof trail.customer_user_id.customer_id === 'object' && (
                                <div className="text-gray-500">
                                  {trail.customer_user_id.customer_id.name}
                                </div>
                              )}
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                                Khách hàng
                              </span>
                            </>
                          )}
                          
                          {/* System/No User */}
                          {!trail.user_id && !trail.customer_user_id && (
                            <div className="font-medium text-gray-500">
                              Hệ thống
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(trail.action)}`}>
                          <span className="mr-1">{getActionIcon(trail.action)}</span>
                          {trail.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {trail.table_name}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {trail.old_value || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                        {trail.audit_id}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong{' '}
                  <span className="font-medium">{pagination.total}</span> kết quả
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Trang {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </PermissionGuard>
  );
}
