'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Types
interface Product {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  is_available: boolean;
  br_id?: {
    _id: string;
    br_name: string;
  };
  pdt_id?: {
    _id: string;
    pdt_name: string;
  };
  category_id?: {
    _id: string;
    category_name: string;
  };
}

interface Banner {
  _id: string;
  banner_id: string;
  pd_id: Product;
  banner_image_url: string;
  cloudinary_public_id?: string;
  banner_order: number;
  is_active: boolean;
  banner_link_url?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth utilities
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('auth-token') || 
                localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// API service
const apiService = {
  async getBanner(bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.status}`);
    }

    return response.json();
  },

  async deleteBanner(bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Delete banner failed: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async toggleBannerStatus(bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}/toggle-status`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Toggle status failed: ${response.status} - ${error}`);
    }

    return response.json();
  }
};

export default function BannerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (bannerId) {
      loadBanner();
    }
  }, [bannerId]);

  const loadBanner = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getBanner(bannerId);
      
      if (response.success) {
        setBanner(response.data.banner);
      } else {
        setError('Không tìm thấy banner');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!banner) return;

    const confirmMessage = `Bạn có chắc chắn muốn xóa banner "${banner.banner_id}"?\n\nHành động này không thể hoàn tác.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteBanner(bannerId);

      if (response.success) {
        alert('Banner đã được xóa thành công!');
        router.push('/admin/banners');
      } else {
        throw new Error(response.message || 'Failed to delete banner');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa banner');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!banner) return;

    try {
      setToggling(true);
      const response = await apiService.toggleBannerStatus(bannerId);
      
      if (response.success) {
        setBanner(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
        const newStatus = response.data.banner.is_active;
        alert(`Banner đã được ${newStatus ? 'kích hoạt' : 'tắt'}!`);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Banner không tồn tại</h1>
          <Link
            href="/admin/banners"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách banner
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/banners"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại danh sách
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner {banner.banner_id}</h1>
            <div className="text-gray-600">
              <span>Banner ID: {banner.banner_id}</span>
              <span className="mx-2">•</span>
              <span>Tạo lúc: {new Date(banner.createdAt).toLocaleString('vi-VN')}</span>
              <span className="mx-2">•</span>
              <span>Sửa lần cuối: {new Date(banner.updatedAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                banner.is_active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {toggling ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : banner.is_active ? (
                <XCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              )}
              {toggling ? 'Đang xử lý...' : (banner.is_active ? 'Tắt Banner' : 'Kích hoạt Banner')}
            </button>

            <Link
              href={`/admin/banners/${banner._id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Chỉnh sửa
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Xóa Banner
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Banner Image */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Banner Image */}
            <div className="aspect-video bg-gray-100">
              {banner.banner_image_url ? (
                <img
                  src={banner.banner_image_url}
                  alt={`Banner ${banner.banner_id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Info */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin ảnh</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">URL:</span>
                  <p className="break-all text-blue-600">
                    <a href={banner.banner_image_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {banner.banner_image_url}
                    </a>
                  </p>
                </div>
                {banner.cloudinary_public_id && (
                  <div>
                    <span className="text-gray-500">Cloudinary ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{banner.cloudinary_public_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
            
            <div className="space-y-4">
              {/* Active Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Kích hoạt:</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  banner.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {banner.is_active ? (
                    <>
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Hoạt động
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-3 h-3 mr-1" />
                      Tắt
                    </>
                  )}
                </span>
              </div>

              {/* Banner Order */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Thứ tự hiển thị:</span>
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  #{banner.banner_order}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Product */}
          {banner.pd_id && typeof banner.pd_id === 'object' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <LinkIcon className="h-5 w-5 inline mr-2" />
                Sản phẩm liên kết
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{banner.pd_id.pd_name}</h4>
                  <p className="text-sm text-gray-500">ID: {banner.pd_id.pd_id}</p>
                </div>

                <div className="flex items-center text-sm">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(banner.pd_id.pd_price)}
                  </span>
                </div>

                {banner.pd_id.br_id && (
                  <div className="text-sm">
                    <span className="text-gray-500">Thương hiệu:</span>
                    <span className="ml-1 text-gray-900">{banner.pd_id.br_id.br_name}</span>
                  </div>
                )}

                {banner.pd_id.category_id && (
                  <div className="text-sm">
                    <span className="text-gray-500">Danh mục:</span>
                    <span className="ml-1 text-gray-900">{banner.pd_id.category_id.category_name}</span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-gray-500">Tồn kho:</span>
                  <span className="ml-1 text-gray-900">{banner.pd_id.pd_quantity}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    banner.pd_id.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {banner.pd_id.is_available ? 'Có sẵn' : 'Hết hàng'}
                  </span>
                </div>

                <Link
                  href={`/admin/products/${banner.pd_id._id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Xem chi tiết sản phẩm
                </Link>
              </div>
            </div>
          )}

          {/* Custom Link */}
          {banner.banner_link_url && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Link tùy chỉnh</h3>
              <a
                href={banner.banner_link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                {banner.banner_link_url}
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
