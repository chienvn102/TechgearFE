'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { authService } from '../../../features/auth/services/authService';

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const type = authService.getUserType();
    setUser(currentUser);
    setUserType(type);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  const customerInfo = user.customer_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center space-x-4 mb-6">
            <UserCircleIcon className="w-16 h-16 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customerInfo?.name || user.username}
              </h1>
              <p className="text-gray-600 capitalize">{userType} Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Thông tin cá nhân
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                  <p className="text-sm text-gray-900">{customerInfo?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{customerInfo?.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <p className="text-sm text-gray-900">{customerInfo?.phone_number || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã khách hàng</label>
                  <p className="text-sm text-gray-900">{customerInfo?.customer_id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                Thông tin tài khoản
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <p className="text-sm text-gray-900">{user.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                  <p className="text-sm text-gray-900 capitalize">{userType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID tài khoản</label>
                  <p className="text-sm text-gray-900 font-mono">{user._id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Chỉnh sửa thông tin
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Đổi mật khẩu
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
