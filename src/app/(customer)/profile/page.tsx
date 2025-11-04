'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { authService } from '@/features/auth/services/authService';
import { customerService } from '@/features/customers/services/customerService';
import { AddressSelection } from '@/features/address/components/AddressSelection';
import { CustomerAddress } from '@/features/customers/services/customerAddressService';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: ''
  });

  useEffect(() => {
    loadCustomerProfile();
  }, []);

  const loadCustomerProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser && currentUser.customer_id) {
        // Fetch full customer details
        const customerResponse = await customerService.getCustomerById(currentUser.customer_id._id);
        if (customerResponse.success && customerResponse.data) {
          const customer = customerResponse.data.customer;
          setCustomerData(customer);
          setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone_number: customer.phone_number || ''
          });
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = useCallback((address: CustomerAddress | null) => {
    setSelectedAddress(address);
  }, []);

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update customer information
      // TODO: Implement customer update API call
      setIsEditingPersonal(false);
      // Reload profile after update
      await loadCustomerProfile();
    } catch (error) {
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user || !customerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy thông tin khách hàng</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600 mt-2">Quản lý thông tin tài khoản và địa chỉ giao hàng của bạn</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Thông tin cá nhân
                </h2>
                <button
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  {isEditingPersonal ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {isEditingPersonal ? (
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPersonal(false);
                        setFormData({
                          name: customerData.name || '',
                          email: customerData.email || '',
                          phone_number: customerData.phone_number || ''
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <UserCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Họ và tên</label>
                      <p className="text-base text-gray-900 font-medium">{customerData.name || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base text-gray-900">{customerData.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Số điện thoại</label>
                      <p className="text-base text-gray-900">{customerData.phone_number || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Account Security Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <ShoppingBagIcon className="w-6 h-6 mr-2 text-blue-600" />
                Thông tin đăng nhập
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <UserCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500">Tên đăng nhập</label>
                    <p className="text-base text-gray-900 font-medium">{user?.username || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500">Mật khẩu</label>
                    <p className="text-base text-gray-900 font-medium">••••••••</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>
            </motion.div>
          </div>

          {/* Shipping Address Section - Same as Checkout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-white rounded-lg shadow-sm p-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
                Địa chỉ giao hàng
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý địa chỉ giao hàng của bạn. Bạn có thể thêm, sửa, xóa hoặc đặt địa chỉ mặc định.
              </p>
            </div>

            {/* Address Selection Component - Same as Checkout */}
            <AddressSelection
              onAddressSelect={handleAddressSelect}
              selectedAddressId={selectedAddress?._id}
              className="w-full"
            />

            {selectedAddress && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm font-medium text-blue-900 mb-2">Địa chỉ đang chọn:</p>
                <div className="space-y-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Người nhận:</span> {selectedAddress.name}
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Số điện thoại:</span> {selectedAddress.phone_number}
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Địa chỉ:</span> {selectedAddress.address}
                  </p>
                  {selectedAddress.is_default && (
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      Địa chỉ mặc định
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSuccess={() => {
          // Optional: Show success message or reload user data
          }}
      />
    </>
  );
}
