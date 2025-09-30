'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  TicketIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { voucherService, type Voucher } from '@/features/vouchers/services/voucherService';

// 🎯 VOUCHER DETAIL PAGE - Chi tiết voucher
// Tuân thủ nghiêm ngặt README_MongoDB.md và API_README.md

const VoucherDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const voucherId = params.id as string;
  
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setVoucher(response.data.voucher || response.data);
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

  // Handle delete voucher
  const handleDelete = async () => {
    if (!voucher) return;
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher "${voucher.voucher_name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await voucherService.deleteVoucher(voucher._id);
      
      alert('Xóa voucher thành công!');
      router.push('/admin/vouchers');
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
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
      return { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon };
    }
    
    try {
      const now = new Date();
      const startDate = new Date(voucher.start_date);
      const endDate = new Date(voucher.end_date);
      
      if (now < startDate) {
        return { label: 'Sắp bắt đầu', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon };
      } else if (now > endDate) {
        return { label: 'Đã hết hạn', color: 'bg-red-100 text-red-800', icon: XCircleIcon };
      } else {
        return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
      }
    } catch {
      return { label: 'Lỗi ngày tháng', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon };
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = (voucher: Voucher): number => {
    if (voucher.max_uses === 0) return 0;
    return Math.min((voucher.current_uses / voucher.max_uses) * 100, 100);
  };

  // Calculate days remaining
  const getDaysRemaining = (voucher: Voucher): number => {
    try {
      const now = new Date();
      const endDate = new Date(voucher.end_date);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
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
      <div className="p-6 max-w-7xl mx-auto">
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

  const status = getVoucherStatus(voucher);
  const StatusIcon = status.icon;
  const usagePercentage = getUsagePercentage(voucher);
  const daysRemaining = getDaysRemaining(voucher);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/vouchers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TicketIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết Voucher</h1>
              <p className="text-sm text-gray-500">
                Thông tin chi tiết về voucher {voucher.voucher_code}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/admin/vouchers/${voucher._id}/edit`)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Chỉnh sửa</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Xóa</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Voucher Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên voucher</label>
                <p className="text-lg font-semibold text-gray-900">{voucher.voucher_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Mã voucher</label>
                <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                  {voucher.voucher_code}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${status.color}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {status.label}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                <p className="text-gray-900">{formatDate(voucher.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Discount Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
              Thông tin giảm giá
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Loại giảm giá</label>
                <div className="flex items-center space-x-2">
                  {voucher.discount_percent ? (
                    <div className="bg-green-100 px-3 py-2 rounded-lg">
                      <span className="text-lg font-bold text-green-700">{voucher.discount_percent}%</span>
                      <span className="text-sm text-green-600 ml-1">theo phần trăm</span>
                    </div>
                  ) : voucher.discount_amount ? (
                    <div className="bg-green-100 px-3 py-2 rounded-lg">
                      <span className="text-lg font-bold text-green-700">
                        {formatCurrency(voucher.discount_amount)}
                      </span>
                      <span className="text-sm text-green-600 ml-1">cố định</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Đơn hàng tối thiểu</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(voucher.min_order_value)}
                </p>
              </div>
              
              {voucher.max_discount_amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Giảm tối đa</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(voucher.max_discount_amount)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Thời gian áp dụng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày bắt đầu</label>
                <p className="text-gray-900">{formatDate(voucher.start_date)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày kết thúc</label>
                <p className="text-gray-900">{formatDate(voucher.end_date)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Số ngày còn lại</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${
                    daysRemaining > 7 ? 'text-green-600' : 
                    daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {daysRemaining} ngày
                  </span>
                  {daysRemaining <= 7 && daysRemaining > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sắp hết hạn
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Usage Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
              Thống kê sử dụng
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Đã sử dụng</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {voucher.current_uses} / {voucher.max_uses}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      usagePercentage >= 90 ? 'bg-red-500' :
                      usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {usagePercentage.toFixed(1)}% đã sử dụng
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {voucher.max_uses - voucher.current_uses}
                  </div>
                  <div className="text-sm text-gray-600">Lượt sử dụng còn lại</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/admin/vouchers/${voucher._id}/edit`)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Chỉnh sửa voucher</span>
              </button>
              
              <button
                onClick={() => {
                  // TODO: Implement duplicate voucher functionality
                  alert('Chức năng nhân bản voucher sẽ được triển khai sau');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <TagIcon className="h-4 w-4" />
                <span>Nhân bản voucher</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Xóa voucher</span>
              </button>
            </div>
          </div>

          {/* Voucher Info */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin hệ thống</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Voucher ID:</span>
                <span className="font-mono text-xs text-gray-900">{voucher._id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Voucher Code:</span>
                <span className="font-mono text-xs text-gray-900">{voucher.voucher_id}</span>
              </div>
              
              {voucher.ranking_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ranking ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {typeof voucher.ranking_id === 'object' ? voucher.ranking_id._id : voucher.ranking_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VoucherDetailPage;
