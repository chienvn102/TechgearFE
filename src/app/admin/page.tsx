'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { authService } from '@/features/auth/services/authService';
import { productService } from '@/features/products/services/productService';
import { analyticsService } from '@/features/analytics/services/analyticsService';
import { formatCurrency } from '@/shared/utils/formatters';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface RecentProduct {
  _id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  is_available: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication - Allow both ADMIN and MANAGER
    const userType = authService.getUserType();
    if (!authService.isAuthenticated() || (userType !== 'admin' && userType !== 'manager')) {
      console.log('❌ Dashboard access denied:', { userType, isAuth: authService.isAuthenticated() });
      window.location.href = 'http://localhost:5000/login';
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complete dashboard analytics from backend
      const analyticsResponse = await analyticsService.getDashboardData();
      
      if (analyticsResponse.success && analyticsResponse.data) {
        const data = analyticsResponse.data;
        
        // Update stats with real data from analytics
        // Try multiple possible field names
        const newStats = {
          totalProducts: data.products?.total || data.products?.totalProducts || 0,
          totalOrders: data.orders?.total || data.orders?.totalOrders || 0,
          totalCustomers: data.customers?.total || data.customers?.totalCustomers || 0,
          totalRevenue: data.revenue?.total || data.revenue?.totalRevenue || 0
        };
        
        setStats(newStats);
      } else {
        setError('Không thể tải dữ liệu thống kê');
      }

      // Fetch products for recent products list
      const productsResponse = await productService.getProducts({ page: 1, limit: 5 });
      if (productsResponse.success && productsResponse.data?.products) {
        const products = productsResponse.data.products;
        
        // Get recent products (last 5)
        const recent = products
          .sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentProducts(recent);
      }

    } catch (err: any) {
      // More specific error handling
      if (err.message?.includes('401')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        authService.logout();
        window.location.href = 'http://localhost:5000/login';
      } else if (err.message?.includes('403')) {
        setError('Bạn không có quyền truy cập trang này.');
      } else if (err.message?.includes('404')) {
        setError('API endpoint không tồn tại. Vui lòng kiểm tra backend.');
      } else {
        setError(`Lỗi khi tải dữ liệu: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = 'http://localhost:5000/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Quản lý hệ thống E-Commerce</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success">Admin</Badge>
            <Button variant="outline" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="primary"
                  onClick={() => router.push('/admin/products/create')}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Thêm sản phẩm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/products')}
                  className="flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  Quản lý sản phẩm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/orders')}
                  className="flex items-center gap-2"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Đơn hàng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/customers')}
                  className="flex items-center gap-2"
                >
                  <UsersIcon className="h-4 w-4" />
                  Khách hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sản phẩm gần đây</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/products')}
                >
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.pd_name}</h4>
                        <p className="text-sm text-gray-600">
                          Giá: {formatCurrency(product.pd_price)} | 
                          Tồn kho: {product.pd_quantity} | 
                          Trạng thái: {product.is_available ? 'Có sẵn' : 'Hết hàng'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/products/${product._id}/images`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có sản phẩm nào</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => router.push('/admin/products/create')}
                  >
                    Thêm sản phẩm đầu tiên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}
