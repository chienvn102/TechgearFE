'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/shared/store';
import { selectIsAuthenticated, selectUser, logoutAsync } from '@/features/auth/store/authSlice';
import { Button } from '@/shared/components/ui/Button';
import { ShoppingBagIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function CustomerHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <header className="bg-white shadow-soft border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/customer" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-primary-900">ECommerce</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/customer/products" className="nav-link text-neutral-600 hover:text-primary-600 transition-colors">
              Sản phẩm
            </Link>
            <Link href="/customer/brands" className="nav-link text-neutral-600 hover:text-primary-600 transition-colors">
              Thương hiệu
            </Link>
            <Link href="/customer/players" className="nav-link text-neutral-600 hover:text-primary-600 transition-colors">
              Cầu thủ
            </Link>
            <Link href="/customer/about" className="nav-link text-neutral-600 hover:text-primary-600 transition-colors">
              Về chúng tôi
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg leading-5 bg-white placeholder-neutral-400 focus:outline-none focus:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/customer/cart" className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Xin chào, {user?.name}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="customer" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-700 hover:text-orange-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                <Link href="/products" className="block py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Sản phẩm
                </Link>
                <Link href="/brands" className="block py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Thương hiệu
                </Link>
                <Link href="/players" className="block py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Cầu thủ
                </Link>
                <Link href="/about" className="block py-2 text-gray-700 hover:text-orange-600 transition-colors">
                  Về chúng tôi
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
