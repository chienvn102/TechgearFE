'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  TicketIcon,
  CheckCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { voucherService, type Voucher, type UpdateVoucherData } from '@/features/vouchers/services/voucherService';

// 🎯 EDIT VOUCHER PAGE - Chỉnh sửa voucher
// Tuân thủ nghiêm ngặt README_MongoDB.md và API_README.md

const EditVoucherPage = () => {
  const params = useParams();
  const router = useRouter();
  const voucherId = params.id as string;
  
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<UpdateVoucherData>({
    voucher_code: '',
    voucher_name: '',
    discount_percent: undefined,
    min_order_value: 0,
    start_date: '',
    end_date: '',
    discount_amount: undefined,
    max_discount_amount: undefined,
    max_uses: 1,
    ranking_id: undefined,
    is_active: true
  });

  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');

  /**
   * Load voucher detail từ backend API
   */
  const loadVoucherDetail = async () => {
    if (!voucherId) {
      setError('Voucher ID không hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await voucherService.getVoucherById(voucherId);
      if (response.success && response.data) {
        const voucherData = response.data.voucher || response.data;
        setVoucher(voucherData);
        
        // Populate form data
        setFormData({
          voucher_code: voucherData.voucher_code || '',
          voucher_name: voucherData.voucher_name || '',
          discount_percent: voucherData.discount_percent,
          min_order_value: voucherData.min_order_value || 0,
          start_date: voucherData.start_date ? formatDateForInput(voucherData.start_date) : '',
          end_date: voucherData.end_date ? formatDateForInput(voucherData.end_date) : '',
          discount_amount: voucherData.discount_amount,
          max_discount_amount: voucherData.max_discount_amount,
          max_uses: voucherData.max_uses || 1,
          ranking_id: voucherData.ranking_id,
          is_active: voucherData.is_active !== false
        });
        
        // Set discount type
        if (voucherData.discount_percent) {
          setDiscountType('percent');
        } else if (voucherData.discount_amount) {
          setDiscountType('amount');
        }
        
        } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voucher detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucherDetail();
  }, [voucherId]);

  // Format date for datetime-local input
  const formatDateForInput = (dateStr: string | Date): string => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof UpdateVoucherData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle discount type change
  const handleDiscountTypeChange = (type: 'percent' | 'amount') => {
    setDiscountType(type);
    if (type === 'percent') {
      setFormData(prev => ({
        ...prev,
        discount_amount: undefined,
        discount_percent: prev.discount_percent || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        discount_percent: undefined,
        discount_amount: prev.discount_amount || 0
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.voucher_code?.trim()) {
      setError('Mã voucher không được để trống');
      return false;
    }
    
    if (!formData.voucher_name?.trim()) {
      setError('Tên voucher không được để trống');
      return false;
    }
    
    if (discountType === 'percent') {
      if (!formData.discount_percent || formData.discount_percent <= 0 || formData.discount_percent > 100) {
        setError('Phần trăm giảm giá phải từ 1 đến 100');
        return false;
      }
    } else {
      if (!formData.discount_amount || formData.discount_amount <= 0) {
        setError('Số tiền giảm giá phải lớn hơn 0');
        return false;
      }
    }
    
    if ((formData.min_order_value || 0) < 0) {
      setError('Giá trị đơn hàng tối thiểu không được âm');
      return false;
    }
    
    if (!formData.start_date) {
      setError('Ngày bắt đầu không được để trống');
      return false;
    }
    
    if (!formData.end_date) {
      setError('Ngày kết thúc không được để trống');
      return false;
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    
    if ((formData.max_uses || 0) <= 0) {
      setError('Số lần sử dụng tối đa phải lớn hơn 0');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await voucherService.updateVoucher(voucherId, formData);
      alert('Cập nhật voucher thành công!');
      router.push(`/admin/vouchers/${voucherId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update voucher');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error && !voucher) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => loadVoucherDetail()}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push('/admin/vouchers')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy voucher</h3>
          <p className="text-gray-500 mb-4">Voucher với ID "{voucherId}" không tồn tại.</p>
          <button
            onClick={() => router.push('/admin/vouchers')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/admin/vouchers/${voucherId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TicketIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Voucher</h1>
              <p className="text-sm text-gray-500">
                Cập nhật thông tin voucher {voucher.voucher_code}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Lỗi:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TagIcon className="h-5 w-5 mr-2 text-purple-600" />
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã voucher *
                </label>
                <input
                  type="text"
                  value={formData.voucher_code}
                  onChange={(e) => handleInputChange('voucher_code', e.target.value.toUpperCase())}
                  placeholder="VD: DISCOUNT50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên voucher *
                </label>
                <input
                  type="text"
                  value={formData.voucher_name}
                  onChange={(e) => handleInputChange('voucher_name', e.target.value)}
                  placeholder="VD: Giảm giá 50% cho đơn hàng đầu tiên"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Discount Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
              Thông tin giảm giá
            </h2>
            
            {/* Discount Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giảm giá *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="percent"
                    checked={discountType === 'percent'}
                    onChange={() => handleDiscountTypeChange('percent')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Phần trăm (%)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="amount"
                    checked={discountType === 'amount'}
                    onChange={() => handleDiscountTypeChange('amount')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Số tiền cố định</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {discountType === 'percent' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phần trăm giảm (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent || ''}
                    onChange={(e) => handleInputChange('discount_percent', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền giảm (VND) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.discount_amount || ''}
                    onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn hàng tối thiểu (VND) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.min_order_value}
                  onChange={(e) => handleInputChange('min_order_value', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              {discountType === 'percent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giảm tối đa (VND)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.max_discount_amount || ''}
                    onChange={(e) => handleInputChange('max_discount_amount', parseFloat(e.target.value) || undefined)}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Thời gian áp dụng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Giới hạn sử dụng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lần sử dụng tối đa *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => handleInputChange('max_uses', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hiện tại đã sử dụng: {voucher.current_uses} lần
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Kích hoạt voucher</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push(`/admin/vouchers/${voucherId}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditVoucherPage;
