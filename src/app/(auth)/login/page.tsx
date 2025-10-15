'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '../../../shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { authService } from '../../../features/auth/services/authService';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      if (response.success && response.data) {
        // Debug: Log the user object structure
        console.log('✅ Login successful, user data:', response.data.user);
        
        // Use authService methods to determine user type
        const userType = authService.getUserType();
        console.log('👤 User type detected:', userType);
        
        // Route based on user type
        if (userType === 'admin' || userType === 'manager') {
          console.log('🔐 Redirecting to admin panel...');
          router.push('/admin'); // ✅ Redirect đến admin panel cho admin và manager
        } else if (userType === 'customer') {
          console.log('🛒 Redirecting to home page...');
          // Force a page refresh to ensure Header updates
          window.location.href = '/';
        } else {
          console.log('❓ Unknown user type, redirecting to home...');
          // Fallback for unknown user type
          window.location.href = '/';
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-blue border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Đăng nhập
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Login Buttons for Testing */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Quick Test Login:</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => setFormData({ username: 'admin', password: 'admin123' })}
                  disabled={loading}
                >
                  Admin Test
                </Button>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => setFormData({ username: 'nhanvien', password: 'chienvn102' })}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                >
                  Manager Test
                </Button>
                <Button
                  variant="customer"
                  size="sm"
                  onClick={() => setFormData({ username: 'customer01', password: 'customer123' })}
                  disabled={loading}
                >
                  Customer Test
                </Button>
              </div>
            </div>

            {/* Customer Registration Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>

            {/* Back to Home Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                ← Quay về trang chủ
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
