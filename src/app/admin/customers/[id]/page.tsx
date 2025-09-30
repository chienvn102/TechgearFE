'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  KeyIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { customerService } from '@/features/customers/services/customerService';
import type { UserCustomer, CustomerAddress } from '@/features/customers/services/customerService';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<UserCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = params?.id as string;

  // Load customer details
  const loadCustomer = async () => {
    if (!username) {
      setError('Username không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await customerService.getUserCustomerByUsername(username);
      
      if (response.success && response.data && response.data.userCustomer) {
        setCustomer(response.data.userCustomer);
      } else {
        throw new Error(response.message || 'Failed to load customer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [username]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => loadCustomer()}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push('/admin/customers')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khách hàng</h3>
          <p className="text-gray-500 mb-4">Khách hàng với username "{username}" không tồn tại.</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết Khách hàng</h1>
            <p className="text-gray-600 mt-1">
              Thông tin chi tiết của khách hàng {customer.customer_id.name}
            </p>
          </div>
        </div>
        
        <Link
          href={`/admin/customers/${username}/edit`}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Chỉnh sửa</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                Thông tin cá nhân
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID khách hàng
                    </label>
                    <div className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      {customer.customer_id.customer_id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {customer.customer_id.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="text-gray-900">
                      {customer.customer_id.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <div className="text-gray-900">
                      {customer.customer_id.phone_number}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <KeyIcon className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin tài khoản
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    @{customer.username}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="text-gray-500">
                    ••••••••••••
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mật khẩu được mã hóa để bảo mật
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Addresses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                Địa chỉ khách hàng
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {customer.customer_id.addresses?.length || 0} địa chỉ
                </span>
              </h3>
            </div>
            <div className="p-6">
              {customer.customer_id.addresses && customer.customer_id.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.customer_id.addresses.map((address: CustomerAddress, index: number) => (
                    <motion.div
                      key={address._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 ${
                        index === 0 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{address.name}</h4>
                            {index === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <PhoneIcon className="h-4 w-4 inline mr-1" />
                            {address.phone_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 inline mr-1" />
                            {address.address}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Chưa có địa chỉ</h3>
                  <p className="text-sm text-gray-500">Khách hàng chưa thêm địa chỉ nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thống kê mua hàng</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(customer.customer_id as any).total_orders || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                    <p className="text-lg font-bold text-green-600">
                      {((customer.customer_id as any).total_spent || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>

              {(customer.customer_id as any).total_orders && (customer.customer_id as any).total_orders > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trung bình mỗi đơn:</span>
                    <span className="font-medium text-gray-900">
                      {(((customer.customer_id as any).total_spent || 0) / (customer.customer_id as any).total_orders).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link
                href={`/admin/customers/${username}/edit`}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Chỉnh sửa thông tin</span>
              </Link>
              
              <Link
                href={`/admin/customers/${username}/edit?tab=password`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <KeyIcon className="h-4 w-4" />
                <span>Đổi mật khẩu</span>
              </Link>
            </div>
          </div>

          {/* Customer Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Trạng thái</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Hoạt động</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tài khoản khách hàng đang hoạt động bình thường
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
