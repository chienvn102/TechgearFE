'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/shared/store';
import { selectUser, logoutAsync } from '@/features/auth/store/authSlice';
import { Button } from '@/shared/components/ui/Button';
import { 
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <header className="bg-white shadow-soft border-b border-neutral-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-primary-900">Dashboard</h1>
            <p className="text-sm text-neutral-600">
              Quản lý hệ thống thương mại điện tử
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Home Button */}
            <button 
              onClick={handleGoHome}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Về trang chủ"
            >
              <HomeIcon className="h-6 w-6" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            <button className="p-2 text-neutral-400 hover:text-primary-600 transition-colors">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-primary-400" />
                <div className="text-sm">
                  <p className="font-medium text-neutral-900">{user?.name || 'Admin'}</p>
                  <p className="text-neutral-500">{user?.username}</p>
                </div>
              </div>
              
              <Button 
                variant="admin" 
                size="sm"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
