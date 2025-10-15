/**
 * Permission System for TechGear
 * Quản lý quyền hạn cho Admin, Manager và Customer
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'CUSTOMER';

export type Permission = 
  // Product permissions
  | 'product.view'
  | 'product.create'
  | 'product.edit'
  | 'product.delete'
  
  // Order permissions
  | 'order.view'
  | 'order.create'
  | 'order.edit'
  | 'order.delete'
  | 'order.update_status'
  
  // Customer permissions
  | 'customer.view'
  | 'customer.create'
  | 'customer.edit'
  | 'customer.delete'
  
  // User management permissions
  | 'user.view'
  | 'user.create'
  | 'user.edit'
  | 'user.delete'
  
  // Voucher permissions
  | 'voucher.view'
  | 'voucher.create'
  | 'voucher.edit'
  | 'voucher.delete'
  
  // Banner permissions
  | 'banner.view'
  | 'banner.create'
  | 'banner.edit'
  | 'banner.delete'
  
  // Post permissions
  | 'post.view'
  | 'post.create'
  | 'post.edit'
  | 'post.delete'
  
  // Analytics permissions
  | 'analytics.view'
  | 'analytics.export'
  
  // Audit trail permissions
  | 'audit.view'
  
  // Settings permissions
  | 'settings.view'
  | 'settings.edit';

/**
 * Permission mapping for each role
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  // Admin - Full access
  ADMIN: [
    // Products
    'product.view',
    'product.create',
    'product.edit',
    'product.delete',
    
    // Orders
    'order.view',
    'order.create',
    'order.edit',
    'order.delete',
    'order.update_status',
    
    // Customers
    'customer.view',
    'customer.create',
    'customer.edit',
    'customer.delete',
    
    // Users
    'user.view',
    'user.create',
    'user.edit',
    'user.delete',
    
    // Vouchers
    'voucher.view',
    'voucher.create',
    'voucher.edit',
    'voucher.delete',
    
    // Banners
    'banner.view',
    'banner.create',
    'banner.edit',
    'banner.delete',
    
    // Posts
    'post.view',
    'post.create',
    'post.edit',
    'post.delete',
    
    // Analytics
    'analytics.view',
    'analytics.export',
    
    // Audit
    'audit.view',
    
    // Settings
    'settings.view',
    'settings.edit',
  ],

  // Manager - Limited access (no delete, no user management)
  MANAGER: [
    // Products - View, Create, Edit only
    'product.view',
    'product.create',
    'product.edit',
    
    // Orders - Full access
    'order.view',
    'order.create',
    'order.edit',
    'order.update_status',
    
    // Customers - View only
    'customer.view',
    
    // Vouchers - View, Create, Edit
    'voucher.view',
    'voucher.create',
    'voucher.edit',
    
    // Banners - View, Create, Edit
    'banner.view',
    'banner.create',
    'banner.edit',
    
    // Posts - View, Create, Edit
    'post.view',
    'post.create',
    'post.edit',
    
    // Analytics - View only
    'analytics.view',
  ],

  // User - Basic staff access
  USER: [
    // Products - View only
    'product.view',
    
    // Orders - View and Update status
    'order.view',
    'order.update_status',
    
    // Customers - View only
    'customer.view',
  ],

  // Customer - No admin permissions
  CUSTOMER: [],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole | null | undefined): Permission[] {
  if (!role) return [];
  return rolePermissions[role] || [];
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(role: UserRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'MANAGER' || role === 'USER';
}

/**
 * Get menu items based on role permissions
 */
export interface MenuItem {
  href: string;
  label: string;
  icon?: string;
  permission?: Permission;
}

export function getAuthorizedMenuItems(role: UserRole | null | undefined, allMenuItems: MenuItem[]): MenuItem[] {
  if (!role) return [];
  
  return allMenuItems.filter(item => {
    if (!item.permission) return true; // No permission required
    return hasPermission(role, item.permission);
  });
}
