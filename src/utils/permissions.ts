// utils/permissions.ts
// Permission configuration for different roles

export type UserRole = 'admin' | 'manager' | 'customer' | 'unknown';

export interface Permission {
  path: string;
  label: string;
  allowedRoles: UserRole[];
}

// Define permissions for each admin route
export const ADMIN_PERMISSIONS: Permission[] = [
  {
    path: '/admin',
    label: 'Tổng quan',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/products',
    label: 'Sản phẩm',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/orders',
    label: 'Đơn hàng',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/customers',
    label: 'Khách hàng',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/vouchers',
    label: 'Vouchers',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/categories',
    label: 'Danh mục',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/product-types',
    label: 'Loại sản phẩm',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/brands',
    label: 'Thương hiệu',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/banners',
    label: 'Banner',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/posts',
    label: 'Bài viết',
    allowedRoles: ['admin', 'manager']
  },
  {
    path: '/admin/notifications',
    label: 'Thông báo',
    allowedRoles: ['admin', 'manager'] // ✅ Manager được truy cập
  },
  {
    path: '/admin/users-management',
    label: 'Người dùng & Vai trò',
    allowedRoles: ['admin'] // ❌ Chỉ admin mới được truy cập
  },
  {
    path: '/admin/analytics',
    label: 'Phân tích',
    allowedRoles: ['admin'] // ❌ Chỉ admin mới được truy cập
  },
  {
    path: '/admin/audit-trail',
    label: 'Lịch sử hoạt động',
    allowedRoles: ['admin'] // ❌ Chỉ admin mới được truy cập
  }
];

/**
 * Check if user has permission to access a route
 */
export function hasPermission(userRole: UserRole, path: string): boolean {
  // Admin has access to everything
  if (userRole === 'admin') {
    return true;
  }

  // Find permission for the path
  const permission = ADMIN_PERMISSIONS.find(p => {
    // Check exact match or if path starts with the permission path
    return path === p.path || path.startsWith(p.path + '/');
  });

  if (!permission) {
    // If no permission defined, only admin can access
    return userRole === 'admin';
  }

  return permission.allowedRoles.includes(userRole);
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole): Permission[] {
  return ADMIN_PERMISSIONS.filter(permission => 
    permission.allowedRoles.includes(userRole)
  );
}

/**
 * Check if current path requires admin-only access
 */
export function isAdminOnlyRoute(path: string): boolean {
  const permission = ADMIN_PERMISSIONS.find(p => 
    path === p.path || path.startsWith(p.path + '/')
  );
  
  if (!permission) return true; // Unknown routes are admin-only
  
  return permission.allowedRoles.length === 1 && permission.allowedRoles[0] === 'admin';
}
