'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Types theo schema mới
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Auth utilities
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('auth-token') || 
                localStorage.getItem('token');
                
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }

  const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
  return {
    'Authorization': `Bearer ${cleanToken}`,
    'Content-Type': 'application/json'
  };
};

const checkUserRole = () => {
  const userData = localStorage.getItem('user_data') || localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    const isAdmin = user.role_id?.role_id === 'ADMIN';
    return { user, isAdmin };
  } catch (error) {
    return null;
  }
};

// API service
const bannerService = {
  async getBanners(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/v1/banners?${queryString}`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch banners: ${response.status} - ${error}`);
    }
    
    return response.json();
  },

  async deleteBanner(bannerId: string) {
    // Check permissions
    const roleCheck = checkUserRole();
    if (!roleCheck?.isAdmin) {
      throw new Error('Insufficient permissions - Admin role required');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });
      
      if (!response.ok) {
        let errorMessage = `Delete failed: ${response.status}`;
        try {
          const errorData = await response.text();
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Delete request timeout - please try again');
      }
      throw error;
    }
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

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Check permissions on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const roleCheck = checkUserRole();
    if (!roleCheck?.isAdmin) {
      setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.');
      return;
    }
    loadBanners();
  }, [pagination.page, statusFilter]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm.trim(),
        ...(statusFilter !== 'ALL' && { is_active: statusFilter === 'ACTIVE' })
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await bannerService.getBanners(params);

      if (response.success) {
        setBanners(response.data.banners || []);
        setPagination(response.data.pagination || pagination);
        } else {
        setError(response.message || 'Failed to load banners');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while loading banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string, bannerDisplayId: string) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa banner "${bannerDisplayId}"?\n\nHành động này không thể hoàn tác.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Retry mechanism for delete
      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          // Add timeout to prevent hanging (increased to 30 seconds)
          const deletePromise = bannerService.deleteBanner(bannerId);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Delete request timeout after 30 seconds')), 30000)
          );

          response = await Promise.race([deletePromise, timeoutPromise]) as any;
          break; // Success, exit retry loop
          
        } catch (retryError: any) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw retryError; // Final attempt failed
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (response.success) {
        alert(`Banner "${bannerDisplayId}" đã được xóa thành công!`);
        await loadBanners(); // Reload list
      } else {
        alert(`Lỗi khi xóa banner: ${response.message}`);
      }

    } catch (err: any) {
      setError(`Lỗi khi xóa banner: ${err.message}`);
      alert(`Lỗi khi xóa banner: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      setLoading(true);
      const response = await bannerService.toggleBannerStatus(banner._id);
      
      if (response.success) {
        const newStatus = response.data.banner.is_active;
        alert(`Banner "${banner.banner_id}" đã được ${newStatus ? 'kích hoạt' : 'tắt'}!`);
        loadBanners(); // Reload list
      }
    } catch (err: any) {
      alert(`Lỗi khi thay đổi trạng thái: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadBanners();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Banner</h1>
        <p className="text-gray-600">Quản lý banner quảng cáo và liên kết sản phẩm</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Banner</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">
                {banners.filter(b => b.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thứ tự cao nhất</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.max(...banners.map(b => b.banner_order), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Có hình ảnh</p>
              <p className="text-2xl font-semibold text-gray-900">
                {banners.filter(b => b.banner_image_url).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                alert('Debug info logged to console');
              }}
              className="inline-flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Debug
            </button>
            <Link
              href="/admin/banners/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm Banner
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Banners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm liên kết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <motion.tr
                  key={banner._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  {/* Banner Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-28">
                        {banner.banner_image_url ? (
                          <img
                            className="h-16 w-28 rounded-lg object-cover border border-gray-200"
                            src={banner.banner_image_url}
                            alt="Banner"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-28 bg-gray-200 rounded-lg flex items-center justify-center">
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Banner {banner.banner_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(banner.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Linked Product */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {banner.pd_id?.pd_name || 'Chưa liên kết'}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {banner.pd_id?.br_id && (
                        <div>Thương hiệu: {banner.pd_id.br_id.br_name}</div>
                      )}
                      {banner.pd_id?.category_id && (
                        <div>Danh mục: {banner.pd_id.category_id.category_name}</div>
                      )}
                      {banner.pd_id && (
                        <div>Giá: {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(banner.pd_id.pd_price)}</div>
                      )}
                    </div>
                  </td>

                  {/* Order */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      #{banner.banner_order}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        banner.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
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
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/banners/${banner._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/banners/${banner._id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteBanner(banner._id, banner.banner_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa banner"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {banners.length === 0 && !loading && (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có banner</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu bằng cách tạo banner đầu tiên của bạn
            </p>
            <div className="mt-6">
              <Link
                href="/admin/banners/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm Banner
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} đến{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} banner
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            <span className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-blue-50">
              {pagination.page} / {pagination.pages}
            </span>
            
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
