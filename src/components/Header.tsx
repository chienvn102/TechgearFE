'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TagIcon,
  UserGroupIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  InformationCircleIcon,
  PhoneIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { CartDialog } from './CartDialog';
import { authService } from '@/features/auth/services/authService';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'admin' | 'customer' | 'unknown'>('unknown');
  
  // Cart functionality
  const { 
    getTotalItems, 
    openCart, 
    closeCart, 
    isOpen, 
    items, 
    updateQuantity, 
    removeItem,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems
  } = useCart();
  const cartItemCount = getTotalItems();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      const type = authService.getUserType();
      
      // Debug logs
      setIsAuthenticated(isAuth);
      setCurrentUser(user);
      setUserType(type);
    };

    checkAuth();
    
    // Check auth every 1 second to catch localStorage changes
    const interval = setInterval(checkAuth, 1000);
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserType('unknown');
      setIsUserDropdownOpen(false);
      
      // Stay on current page if already on home, otherwise go to home
      if (window.location.pathname !== '/') {
        router.push('/');
      } else {
        // Force a small delay to ensure localStorage is cleared, then check auth again
        setTimeout(() => {
          const isAuth = authService.isAuthenticated();
          if (isAuth) {
            window.location.reload();
          }
        }, 100);
      }
      
      } catch (error) {
      }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    if (userType === 'admin') {
      return currentUser.name || currentUser.username;
    } else if (userType === 'customer') {
      return currentUser.customer_id?.name || currentUser.username;
    }
    
    return currentUser.username || 'User';
  };

  // Icon navigation for top bar (complete navigation) - Loại bỏ Home vì logo đã link về trang chủ
  const iconNavigation = [
    { href: '/products', label: 'Sản phẩm', icon: CubeIcon },
    { href: '/categories', label: 'Danh mục', icon: TagIcon },
    { href: '/brands', label: 'Thương hiệu', icon: BuildingStorefrontIcon },
    { href: '/players', label: 'Tuyển thủ', icon: UserGroupIcon },
    { href: '/about', label: 'Giới thiệu', icon: InformationCircleIcon },
    { href: '/contact', label: 'Liên hệ', icon: PhoneIcon },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              TechGear
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Icon Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {iconNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title={item.label}
                >
                  <IconComponent className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link 
              href="/wishlist"
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
            >
              <HeartIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            <button 
              onClick={openCart}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative user-dropdown-container">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 capitalize">{userType}</p>
                    </div>
                    
                    {/* Customer Menu Items */}
                    {userType === 'customer' && (
                      <>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <UserCircleIcon className="w-4 h-4 mr-2" />
                          Thông tin cá nhân
                        </Link>
                        <Link
                          href="/customer/my-ranking"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <TrophyIcon className="w-4 h-4 mr-2" />
                          Ranking của tôi
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            router.push('/orders');
                            }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                          <ShoppingCartIcon className="w-4 h-4 mr-2" />
                          Đơn hàng của tôi
                        </button>
                      </>
                    )}
                    
                    {/* Admin Menu Items */}
                    {userType === 'admin' && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-2" />
                          Trang quản trị
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <CubeIcon className="w-4 h-4 mr-2" />
                          Quản lý sản phẩm
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <ShoppingCartIcon className="w-4 h-4 mr-2" />
                          Quản lý đơn hàng
                        </Link>
                        <Link
                          href="/admin/customers"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <UserGroupIcon className="w-4 h-4 mr-2" />
                          Quản lý khách hàng
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            {/* Mobile Search */}
            <div className="p-4 border-b">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="py-2">
              {/* Complete Icon Navigation for Mobile */}
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {iconNavigation.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Cart Dialog */}
      <CartDialog
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          closeCart();
          router.push('/checkout');
        }}
        onToggleSelection={toggleItemSelection}
        onSelectAll={selectAllItems}
        onDeselectAll={deselectAllItems}
      />
    </header>
  );
}
