'use client';

import { useEffect, useState } from 'react';
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Squares2X2Icon },
  { href: '/admin/products', label: 'Products', icon: ShoppingBagIcon },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
  { href: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { href: '/admin/vouchers', label: 'Vouchers', icon: TicketIcon },
  { href: '/admin/categories', label: 'Categories', icon: TagIcon },
  { href: '/admin/product-types', label: 'Product Types', icon: FolderIcon },
  { href: '/admin/brands', label: 'Brands', icon: BuildingStorefrontIcon },
  { href: '/admin/players', label: 'Players', icon: UserGroupIcon },
  { href: '/admin/banners', label: 'Banners', icon: PhotoIcon },
  { href: '/admin/posts', label: 'Posts', icon: NewspaperIcon },
  { href: '/admin/notifications', label: 'Notifications', icon: BellIcon },
  { href: '/admin/users-management', label: 'Users & Roles', icon: ShieldCheckIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
  { href: '/admin/audit-trail', label: 'Lịch sử hoạt động', icon: ClockIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      router.replace('/login');
    }
    setMounted(true);
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
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
            <Badge variant="success" className="text-xs">Admin</Badge>
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
          <div className="border-t p-4">
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

