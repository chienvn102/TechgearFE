'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckIcon,
  UserIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { customerService } from '@/features/customers/services/customerService';
import type { UserCustomer, UpdateUserCustomerData } from '@/features/customers/services/customerService';

interface CustomerFormData {
  name: string;
  email: string;
  phone_number: string;
  username: string;
}

interface AdminResetPasswordFormData {
  new_password: string;
  confirm_password: string;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<UserCustomer | null>(null);
  
  // Form data
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone_number: '',
    username: ''
  });
  
  const [adminResetData, setAdminResetData] = useState<AdminResetPasswordFormData>({
    new_password: '',
    confirm_password: ''
  });

  const [originalData, setOriginalData] = useState<CustomerFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'admin-reset'>('info');
  const [showPasswords, setShowPasswords] = useState({
    admin_new: false
  });

  const username = params?.id as string;

  // Check if admin-reset tab should be active from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'admin-reset') {
      setActiveTab('admin-reset');
    }
  }, [searchParams]);

  // Load customer data
  const loadCustomer = async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.getUserCustomerByUsername(username);
      
      if (response.success && response.data) {
        const customerData = response.data.userCustomer;
        setCustomer(customerData);
        
        const formData = {
          name: customerData.customer_id.name,
          email: customerData.customer_id.email,
          phone_number: customerData.customer_id.phone_number,
          username: customerData.username
        };
        
        setCustomerData(formData);
        setOriginalData(formData);
      } else {
        throw new Error(response.message || 'Customer not found');
      }
    } catch (err: any) {
      alert('Lỗi khi tải khách hàng: ' + (err.message || 'Unknown error'));
      router.push('/admin/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [username]);

  // Validate customer info form
  const validateCustomerForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerData.name?.trim()) {
      newErrors.name = 'Tên khách hàng là bắt buộc';
    }

    if (!customerData.email?.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!customerData.phone_number?.trim()) {
      newErrors.phone_number = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(customerData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại phải có 10-11 chữ số';
    }

    if (!customerData.username?.trim()) {
      newErrors.username = 'Username là bắt buộc';
    } else if (customerData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate admin reset password form
  const validateAdminResetForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminResetData.new_password) {
      newErrors.admin_new_password = 'Mật khẩu mới là bắt buộc';
    } else if (adminResetData.new_password.length < 6) {
      newErrors.admin_new_password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!adminResetData.confirm_password) {
      newErrors.admin_confirm_password = 'Xác nhận mật khẩu là bắt buộc';
    } else if (adminResetData.new_password !== adminResetData.confirm_password) {
      newErrors.admin_confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if customer form has changes
  const hasCustomerChanges = (): boolean => {
    if (!originalData) return false;
    
    return (
      customerData.name !== originalData.name ||
      customerData.email !== originalData.email ||
      customerData.phone_number !== originalData.phone_number ||
      customerData.username !== originalData.username
    );
  };

  // Handle customer info submission
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCustomerForm()) {
      return;
    }

    if (!hasCustomerChanges()) {
      alert('Không có thay đổi nào để lưu');
      return;
    }

    if (!customer) {
      alert('Không tìm thấy khách hàng để cập nhật');
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const updateData: UpdateUserCustomerData = {};
      
      // Check what changed
      if (customerData.username !== originalData?.username) {
        updateData.new_username = customerData.username;
      }
      
      // Customer info changes
      const customerInfoChanges: any = {};
      if (customerData.name !== originalData?.name) {
        customerInfoChanges.name = customerData.name;
      }
      if (customerData.email !== originalData?.email) {
        customerInfoChanges.email = customerData.email;
      }
      if (customerData.phone_number !== originalData?.phone_number) {
        customerInfoChanges.phone_number = customerData.phone_number;
      }
      
      if (Object.keys(customerInfoChanges).length > 0) {
        updateData.customer_info = customerInfoChanges;
      }

      const response = await customerService.updateUserCustomer(username, updateData);
      
      if (response.success) {
        alert('Cập nhật thông tin khách hàng thành công!');
        
        // If username changed, redirect to new URL
        if (updateData.new_username) {
          router.push(`/admin/customers/${updateData.new_username}`);
        } else {
          router.push(`/admin/customers/${username}`);
        }
      } else {
        throw new Error(response.message || 'Failed to update customer');
      }
    } catch (err: any) {
      alert('Lỗi khi cập nhật khách hàng: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Handle admin reset password submission
  const handleAdminResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAdminResetForm()) {
      return;
    }

    const confirmReset = window.confirm(
      `Bạn có chắc chắn muốn đặt lại mật khẩu cho khách hàng "${customer?.username}"?\n\nHành động này sẽ không thể hoàn tác.`
    );

    if (!confirmReset) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const response = await customerService.adminResetPassword(username, adminResetData.new_password);
      
      if (response.success) {
        alert('Đặt lại mật khẩu thành công!\nKhách hàng có thể sử dụng mật khẩu mới để đăng nhập.');
        
        // Clear admin reset form
        setAdminResetData({
          new_password: '',
          confirm_password: ''
        });
        
        // Redirect to detail page
        router.push(`/admin/customers/${username}`);
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (err: any) {
      alert('Lỗi khi đặt lại mật khẩu: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAdminResetChange = (field: keyof AdminResetPasswordFormData, value: string) => {
    setAdminResetData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    const errorKey = field === 'new_password' ? 'admin_new_password' : 'admin_confirm_password';
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/admin/customers/${username}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Khách hàng</h1>
            <p className="text-gray-600 mt-1">Cập nhật thông tin của {customer.customer_id.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" />
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('admin-reset')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admin-reset'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <KeyIcon className="h-4 w-4 inline mr-2" />
            <span className="text-orange-600 font-semibold">Admin Đặt Lại MK</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'info' ? (
          /* Customer Info Form */
          <form onSubmit={handleCustomerSubmit}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân và tài khoản</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">Thông tin cá nhân</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập họ và tên khách hàng"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập email khách hàng"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.phone_number ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">Thông tin tài khoản</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Username dùng để đăng nhập vào hệ thống
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID khách hàng
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500">
                      {customer.customer_id.customer_id}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      ID khách hàng không thể thay đổi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {hasCustomerChanges() ? '• Có thay đổi chưa lưu' : '• Không có thay đổi'}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/customers/${username}`)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !hasCustomerChanges()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Admin Reset Password Form */
          <form onSubmit={handleAdminResetSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
              <h3 className="text-lg font-medium text-orange-800">Admin Đặt Lại Mật Khẩu</h3>
              <p className="text-sm text-orange-600 mt-1">
                <strong>Chú ý:</strong> Tính năng này cho phép admin đặt lại mật khẩu khách hàng mà không cần mật khẩu cũ.
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Cảnh báo bảo mật
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Hành động này sẽ đặt lại mật khẩu cho khách hàng ngay lập tức</li>
                        <li>Khách hàng sẽ cần sử dụng mật khẩu mới để đăng nhập</li>
                        <li>Không thể hoàn tác sau khi thực hiện</li>
                        <li>Hãy thông báo mật khẩu mới cho khách hàng một cách an toàn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.admin_new ? 'text' : 'password'}
                      value={adminResetData.new_password}
                      onChange={(e) => handleAdminResetChange('new_password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.admin_new_password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu mới cho khách hàng"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, admin_new: !prev.admin_new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.admin_new ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.admin_new_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.admin_new_password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={adminResetData.confirm_password}
                    onChange={(e) => handleAdminResetChange('confirm_password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.admin_confirm_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {errors.admin_confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.admin_confirm_password}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-orange-700">
                  • Mật khẩu sẽ được mã hóa và lưu tự động
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/customers/${username}`)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang đặt lại...
                      </>
                    ) : (
                      <>
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Đặt Lại Mật Khẩu
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
