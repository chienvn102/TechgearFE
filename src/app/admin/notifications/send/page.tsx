'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '@/features/notifications/services/notificationService';

export default function SendNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    noti_type: 'PROMOTION',
    noti_title: '',
    noti_content: '',
    target_audience: 'ALL',
    customer_ids: '',
    link_to: '',
    priority: 'MEDIUM'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.noti_title || !formData.noti_content) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    if (formData.target_audience === 'SPECIFIC' && !formData.customer_ids) {
      setError('Vui lòng nhập danh sách ID khách hàng');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        noti_type: formData.noti_type,
        noti_title: formData.noti_title,
        noti_content: formData.noti_content,
        target_audience: formData.target_audience,
        priority: formData.priority
      };

      if (formData.link_to) {
        payload.link_to = formData.link_to;
      }

      if (formData.target_audience === 'SPECIFIC') {
        // Parse customer IDs from comma-separated string
        payload.customer_ids = formData.customer_ids
          .split(',')
          .map(id => id.trim())
          .filter(id => id);
      }

      const response = await notificationService.sendNotification(payload);

      if (response.success) {
        alert(`Gửi thành công ${response.data.count} thông báo!`);
        router.push('/admin/notifications');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PaperAirplaneIcon className="h-8 w-8 mr-3 text-blue-600" />
            Gửi Thông báo
          </h1>
          <p className="text-gray-600 mt-1">Tạo và gửi thông báo đến khách hàng</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label htmlFor="noti_type" className="block text-sm font-medium text-gray-700 mb-2">
              Loại thông báo <span className="text-red-500">*</span>
            </label>
            <select
              id="noti_type"
              name="noti_type"
              value={formData.noti_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROMOTION">Khuyến mãi</option>
              <option value="SYSTEM">Hệ thống</option>
              <option value="ORDER_STATUS">Trạng thái đơn hàng</option>
              <option value="PAYMENT">Thanh toán</option>
              <option value="DELIVERY">Giao hàng</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="noti_title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="noti_title"
              name="noti_title"
              value={formData.noti_title}
              onChange={handleChange}
              required
              maxLength={200}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.noti_title.length}/200 ký tự
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="noti_content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="noti_content"
              name="noti_content"
              value={formData.noti_content}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Nhập nội dung thông báo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng nhận <span className="text-red-500">*</span>
            </label>
            <select
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả khách hàng</option>
              <option value="BRONZE">Khách hàng Đồng (Bronze)</option>
              <option value="SILVER">Khách hàng Bạc (Silver)</option>
              <option value="GOLD">Khách hàng Vàng (Gold)</option>
              <option value="PLATINUM">Khách hàng Bạch Kim (Platinum)</option>
              <option value="SPECIFIC">Khách hàng cụ thể</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Chọn nhóm khách hàng hoặc khách hàng cụ thể để gửi thông báo
            </p>
          </div>

          {/* Customer IDs (conditional) */}
          {formData.target_audience === 'SPECIFIC' && (
            <div>
              <label htmlFor="customer_ids" className="block text-sm font-medium text-gray-700 mb-2">
                Danh sách ID khách hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                id="customer_ids"
                name="customer_ids"
                value={formData.customer_ids}
                onChange={handleChange}
                required={formData.target_audience === 'SPECIFIC'}
                rows={3}
                placeholder="Nhập các ID khách hàng, cách nhau bằng dấu phẩy. Ví dụ: 677eed6aecab9a3e33d9ecb7, 677eed6aecab9a3e33d9ecb8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập các MongoDB ObjectId, cách nhau bằng dấu phẩy
              </p>
            </div>
          )}

          {/* Link To */}
          <div>
            <label htmlFor="link_to" className="block text-sm font-medium text-gray-700 mb-2">
              Link liên kết (tuỳ chọn)
            </label>
            <input
              type="text"
              id="link_to"
              name="link_to"
              value={formData.link_to}
              onChange={handleChange}
              placeholder="/orders/123 hoặc /products/456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Đường dẫn để khách hàng truy cập khi nhấn vào thông báo
            </p>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Độ ưu tiên
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Gửi thông báo
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
