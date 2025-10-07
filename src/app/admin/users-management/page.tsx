'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { userManagementService, type UserManagement, type Role } from '@/features/admin/services/userManagementService';
import UserFormModal from '@/features/admin/components/UserFormModal';
import ChangeRoleModal from '@/features/admin/components/ChangeRoleModal';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [changingRoleUser, setChangingRoleUser] = useState<UserManagement | null>(null);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role_id = roleFilter;
      
      const response = await userManagementService.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setTotal(response.data.pagination.total);
        setPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Load roles for filter
  const loadRoles = async () => {
    try {
      console.log('🔄 Starting to load roles...');
      const response = await userManagementService.getAllRoles();
      console.log('📊 Roles API Response:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', response ? Object.keys(response) : 'null');
      
      if (response && response.success) {
        const rolesData = response.data?.roles || response.data || [];
        console.log('✅ Loaded Roles:', rolesData);
        console.log('✅ Roles count:', rolesData.length);
        setRoles(rolesData);
      } else {
        console.warn('⚠️ Response not successful:', response);
        setRoles([]);
      }
    } catch (err: any) {
      console.error('❌ Failed to load roles - Full error:', err);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Error response data:', err?.response?.data);
      console.error('❌ Error response status:', err?.response?.status);
      setRoles([]);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery, roleFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page
  };

  // Handle filter
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  // Handle create user
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  // Handle edit user
  const handleEditUser = (user: UserManagement) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async (user: UserManagement) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"?`)) return;
    
    try {
      const response = await userManagementService.deleteUser(user._id);
      if (response.success) {
        alert('Xóa người dùng thành công!');
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  // Handle change role
  const handleChangeRole = (user: UserManagement) => {
    setChangingRoleUser(user);
    setShowRoleModal(true);
  };

  // Handle user saved
  const handleUserSaved = () => {
    setShowUserModal(false);
    setEditingUser(null);
    loadUsers();
  };

  // Handle role changed
  const handleRoleChanged = () => {
    setShowRoleModal(false);
    setChangingRoleUser(null);
    loadUsers();
  };

  // Get role badge color
  const getRoleBadgeColor = (roleId: string) => {
    switch (roleId) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-blue-600" />
              Quản lý Người dùng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tài khoản nhân viên và phân quyền hệ thống
            </p>
          </div>
          
          <button
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm người dùng
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo username, tên..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc
            {roleFilter && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                1
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Bộ lọc</h3>
                <button
                  onClick={() => {
                    setRoleFilter('');
                    setShowFilters(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Xóa bộ lọc
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả vai trò</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
            <UsersIcon className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admin</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {users.filter((u) => u.role_id.role_id === 'ADMIN').length}
              </p>
            </div>
            <ShieldCheckIcon className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Manager</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {users.filter((u) => u.role_id.role_id === 'MANAGER').length}
              </p>
            </div>
            <UsersIcon className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trang hiện tại</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {page}/{pages || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {user.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {user.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                            user.role_id.role_id
                          )}`}
                        >
                          {user.role_id.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Change Role */}
                          <button
                            onClick={() => handleChangeRole(user)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Thay đổi vai trò"
                          >
                            <ShieldCheckIcon className="h-5 w-5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> trong{' '}
                  <span className="font-medium">{total}</span> kết quả
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Trước
                  </button>

                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    let pageNum;
                    if (pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pages - 2) {
                      pageNum = pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 border rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Form Modal */}
      {showUserModal && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSaved={handleUserSaved}
        />
      )}

      {/* Change Role Modal */}
      {showRoleModal && changingRoleUser && (
        <ChangeRoleModal
          user={changingRoleUser}
          roles={roles}
          onClose={() => {
            setShowRoleModal(false);
            setChangingRoleUser(null);
          }}
          onChanged={handleRoleChanged}
        />
      )}
    </div>
  );
}
