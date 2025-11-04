'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, getCurrentUser, getAuthToken } from '@/lib/auth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminAuthGuard({ children, fallback }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
      }

      // Get user data
      const user = getCurrentUser();
      const token = getAuthToken();
      
      // Check if user is admin
      if (!isAdmin()) {
        router.push('/customer');
        return;
      }

      // Verify token with backend
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          window.location.href = '/login';
          return;
        }

        const data = await response.json();
        // Check if user has admin role
        if (data.user && data.user.role_id) {
          setIsAuthorized(true);
        } else {
          router.push('/customer');
          return;
        }
      } catch (error) {
        window.location.href = '/login';
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang xác thực quyền truy cập...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}
