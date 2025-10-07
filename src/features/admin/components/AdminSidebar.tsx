'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils';
import { 
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ShoppingCartIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    title: 'Sản phẩm',
    icon: CubeIcon,
    children: [
      { title: 'Danh sách sản phẩm', href: '/admin/products' },
      { title: 'Thêm sản phẩm', href: '/admin/products/create' },
      { title: 'Danh mục', href: '/admin/categories' },
      { title: 'Thương hiệu', href: '/admin/brands' },
      { title: 'Loại sản phẩm', href: '/admin/product-types' },
    ],
  },
  {
    title: 'Đơn hàng',
    href: '/admin/orders',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Khách hàng',
    icon: UserGroupIcon,
    children: [
      { title: 'Danh sách khách hàng', href: '/admin/customers' },
      { title: 'Xếp hạng khách hàng', href: '/admin/rankings' },
      { title: 'Địa chỉ khách hàng', href: '/admin/customer-addresses' },
    ],
  },
  {
    title: 'Voucher',
    href: '/admin/vouchers',
    icon: GiftIcon,
  },
  {
    title: 'Nội dung',
    icon: DocumentTextIcon,
    children: [
      { title: 'Bài viết', href: '/admin/posts' },
      { title: 'Banner', href: '/admin/banners' },
      { title: 'Cầu thủ', href: '/admin/players' },
    ],
  },
  {
    title: 'Báo cáo',
    href: '/admin/analytics',
    icon: ChartBarIcon,
  },
  {
    title: 'Lịch sử hoạt động',
    href: '/admin/audit-trail',
    icon: ClockIcon,
  },
  {
    title: 'Quản trị',
    icon: CogIcon,
    children: [
      { title: 'Người dùng', href: '/admin/users' },
      { title: 'Vai trò & Quyền', href: '/admin/roles' },
    ],
  },
];

interface MenuItemProps {
  item: typeof menuItems[0];
  isActive: boolean;
  pathname: string;
}

function MenuItem({ item, isActive, pathname }: MenuItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  React.useEffect(() => {
    if (hasChildren && item.children?.some(child => pathname.startsWith(child.href))) {
      setIsOpen(true);
    }
  }, [pathname, hasChildren, item.children]);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isActive
              ? 'bg-primary-100 text-primary-900'
              : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
          )}
        >
          <div className="flex items-center">
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </div>
          <svg
            className={cn(
              'h-4 w-4 transform transition-transform',
              isOpen ? 'rotate-180' : ''
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-4 py-2 text-sm rounded-lg transition-colors',
                  pathname === child.href
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-900'
          : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
      )}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.title}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-soft border-r border-neutral-200 h-screen overflow-y-auto">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-primary-900">Admin Panel</span>
        </Link>
      </div>
      
      <nav className="px-4 pb-4 space-y-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.title}
            item={item}
            isActive={pathname === item.href}
            pathname={pathname}
          />
        ))}
      </nav>
    </div>
  );
}
