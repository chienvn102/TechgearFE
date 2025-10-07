'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { userManagementService, type UserManagement, type Role } from '@/features/admin/services/userManagementService';

interface ChangeRoleModalProps {
  user: UserManagement;
  roles: Role[];
  onClose: () => void;
  onChanged: () => void;
}

export default function ChangeRoleModal({ user, roles, onClose, onChanged }: ChangeRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(user.role_id._id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = roles.find((r) => r._id === selectedRoleId);
  const currentRole = user.role_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoleId === currentRole._id) {
      setError('Vui lòng chọn vai trò khác với vai trò hiện tại');
      return;
    }

    if (!confirm(`Bạn có chắc muốn thay đổi vai trò của "${user.name}" từ ${currentRole.role_name} sang ${selectedRole?.role_name}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await userManagementService.changeUserRole(user._id, selectedRoleId);
      
      alert('Thay đổi vai trò thành công!');
      onChanged();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Thay đổi vai trò</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Thông tin người dùng</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-medium text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="text-sm font-medium text-gray-900">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tên:</span>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vai trò hiện tại:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {currentRole.role_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn vai trò mới <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.role_name} ({role.role_id})
                    {role._id === currentRole._id && ' - Hiện tại'}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Comparison */}
            {selectedRoleId !== currentRole._id && selectedRole && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Thay đổi quyền hạn
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-800">Từ:</span>
                    <span className="font-medium text-yellow-900">{currentRole.role_name}</span>
                  </div>
                  <div className="flex items-center justify-center text-yellow-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-800">Sang:</span>
                    <span className="font-medium text-yellow-900">{selectedRole.role_name}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">⚠️ Cảnh báo:</h4>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng</li>
                <li>Người dùng sẽ cần đăng xuất và đăng nhập lại để áp dụng quyền mới</li>
                <li>Hãy chắc chắn bạn hiểu rõ quyền hạn của từng vai trò</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || selectedRoleId === currentRole._id}
                className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  <span>Xác nhận thay đổi</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
