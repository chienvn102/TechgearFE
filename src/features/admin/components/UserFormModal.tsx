'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { userManagementService, type UserManagement, type Role } from '@/features/admin/services/userManagementService';

interface UserFormModalProps {
  user: UserManagement | null; // null for create, UserManagement for edit
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

export default function UserFormModal({ user, roles, onClose, onSaved }: UserFormModalProps) {
  // Auto-generate User ID for create mode
  const generateUserId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `USER${timestamp}${random}`;
  };

  const [formData, setFormData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    password: '',
    name: user?.name || '',
    role_id: user?.role_id._id || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!user;

  // Auto-generate ID on mount for create mode
  useEffect(() => {
    if (!isEditMode && !formData.id) {
      setFormData(prev => ({
        ...prev,
        id: generateUserId()
      }));
    }
  }, [isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.id || !formData.username || !formData.name || !formData.role_id) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isEditMode && !formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        // Update user
        const updateData: any = {
          id: formData.id,
          username: formData.username,
          name: formData.name,
          role_id: formData.role_id
        };
        
        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userManagementService.updateUser(user._id, updateData);
        alert('Cập nhật người dùng thành công!');
      } else {
        // Create user
        await userManagementService.createUser({
          id: formData.id,
          username: formData.username,
          password: formData.password,
          name: formData.name,
          role_id: formData.role_id
        });
        alert('Thêm người dùng thành công!');
      }

      onSaved();
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
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

            {/* User ID */}
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={isEditMode} // Cannot change ID in edit mode
                required
                maxLength={50}
                placeholder="VD: USER001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID duy nhất để phân biệt người dùng (không thể thay đổi sau khi tạo)
              </p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                placeholder="VD: admin01"
                pattern="[a-zA-Z0-9_]+"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tên đăng nhập (chỉ chứa chữ cái, số và dấu gạch dưới)
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                minLength={6}
                placeholder={isEditMode ? 'Để trống nếu không muốn đổi mật khẩu' : 'Nhập mật khẩu'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEditMode
                  ? 'Chỉ nhập nếu muốn thay đổi mật khẩu (tối thiểu 6 ký tự)'
                  : 'Mật khẩu đăng nhập (tối thiểu 6 ký tự)'}
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên hiển thị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tên đầy đủ của người dùng
              </p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.role_name} ({role.role_id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Vai trò quyết định quyền hạn của người dùng trong hệ thống
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📌 Lưu ý:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>ADMIN: Toàn quyền quản lý hệ thống</li>
                <li>MANAGER: Quản lý sản phẩm, đơn hàng, nội dung</li>
                <li>Username và User ID phải là duy nhất</li>
                {isEditMode && <li>Để trống mật khẩu nếu không muốn thay đổi</li>}
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
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  <span>{isEditMode ? 'Cập nhật' : 'Thêm mới'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
