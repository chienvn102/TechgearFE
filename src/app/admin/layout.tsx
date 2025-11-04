'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TicketIcon,
  TagIcon,
  FolderIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  PhotoIcon,
  NewspaperIcon,
  BellIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { authService } from '@/features/auth/services/authService';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { hasPermission, type UserRole } from '@/utils/permissions';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const allNavItems = [
  { href: '/admin', label: 'Tổng quan', icon: Squares2X2Icon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/products', label: 'Sản phẩm', icon: ShoppingBagIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ClipboardDocumentListIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/customers', label: 'Khách hàng', icon: UsersIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/vouchers', label: 'Vouchers', icon: TicketIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/categories', label: 'Danh mục', icon: TagIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/product-types', label: 'Loại sản phẩm', icon: FolderIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/brands', label: 'Thương hiệu', icon: BuildingStorefrontIcon, roles: ['admin', 'manager'] as UserRole[] },
  // { href: '/admin/players', label: 'Cầu thủ', icon: UserGroupIcon, roles: ['admin', 'manager'] as UserRole[] }, // Hidden
  { href: '/admin/banners', label: 'Banner', icon: PhotoIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/posts', label: 'Bài viết', icon: NewspaperIcon, roles: ['admin', 'manager'] as UserRole[] },
  { href: '/admin/notifications', label: 'Thông báo', icon: BellIcon, roles: ['admin', 'manager'] as UserRole[] }, // ✅ Manager có quyền
  { href: '/admin/users-management', label: 'Người dùng & Vai trò', icon: ShieldCheckIcon, roles: ['admin'] as UserRole[] }, // ❌ Chỉ admin
  { href: '/admin/analytics', label: 'Phân tích', icon: ChartBarIcon, roles: ['admin'] as UserRole[] }, // ❌ Chỉ admin
  { href: '/admin/audit-trail', label: 'Lịch sử', icon: ClockIcon, roles: ['admin'] as UserRole[] }, // ❌ Chỉ admin
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userRole = authService.getUserType();
  const currentUser = authService.getCurrentUser();
  
  // Filter navigation items based on user role
  const navItems = useMemo(() => {
    return allNavItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  useEffect(() => {
    // Allow both ADMIN and MANAGER to access admin panel
    if (!authService.isAuthenticated() || (!authService.isAdmin() && !authService.isManager())) {
      console.log('isAuthenticated:', authService.isAuthenticated());
      console.log('isAdmin:', authService.isAdmin());
      console.log('isManager:', authService.isManager());
      window.location.href = 'http://localhost:5000/login';
    } else {
      console.log('User role:', authService.getUserRole());
    }
    setMounted(true);
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = 'http://localhost:5000/login';
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Link href="/admin" className="font-semibold text-gray-900 text-lg">
              Admin Panel
            </Link>
            <Badge variant="success" className="text-xs">
              {userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </Badge>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map(item => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      active 
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t p-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.username || 'User'}
                </p>
                <p className="text-xs text-gray-600">
                  {userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle sidebar"
                onClick={() => setSidebarOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Breadcrumb or Page Title could go here */}
              <div className="hidden lg:block">
                <h1 className="text-lg font-medium text-gray-900">
                  {navItems.find(item => 
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  )?.label || 'Admin Panel'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Home Button */}
              <button 
                onClick={() => router.push('/')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Về trang chủ"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              
              {/* Quick Actions or User Menu could go here */}
              <div className="lg:hidden">
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-sm"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

