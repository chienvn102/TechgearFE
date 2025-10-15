// components/PermissionGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/features/auth/services/authService';
import { hasPermission } from '@/utils/permissions';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkPermission = () => {
      const userRole = authService.getUserType();
      const pathToCheck = requiredPermission || pathname;

      console.log('🔒 Permission check:', {
        userRole,
        pathToCheck,
        pathname
      });

      const allowed = hasPermission(userRole, pathToCheck);

      console.log(allowed ? '✅ Access granted' : '❌ Access denied');

      if (!allowed) {
        setHasAccess(false);
        setShowDialog(true);
      } else {
        setHasAccess(true);
      }
    };

    checkPermission();
  }, [pathname, requiredPermission]);

  const handleBackToAdmin = () => {
    setShowDialog(false);
    router.push('/admin');
  };

  // Show loading while checking
  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Show permission denied dialog
  if (!hasAccess && showDialog) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          {/* Dialog */}
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <XCircleIcon className="w-8 h-8 text-white" />
                <h3 className="text-xl font-bold text-white">
                  Không có quyền truy cập
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-lg mb-2">
                Bạn không có quyền truy cập chức năng này.
              </p>
              <p className="text-gray-600 text-sm">
                Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={handleBackToAdmin}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Quay lại Admin Panel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render children if has access
  return <>{children}</>;
}
