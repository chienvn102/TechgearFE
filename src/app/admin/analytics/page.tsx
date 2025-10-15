// app/(admin)/analytics/page.tsx
// Main Analytics Dashboard Page

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CubeIcon,
  TicketIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StatCard } from '@/features/analytics/components/StatCard';
import { RevenueChart } from '@/features/analytics/components/RevenueChart';
import { OrderStatusChart } from '@/features/analytics/components/OrderStatusChart';
import { TopProductsTable } from '@/features/analytics/components/TopProductsTable';
import { CustomerRankingChart } from '@/features/analytics/components/CustomerRankingChart';
import { LoadingSkeleton } from '@/features/analytics/components/LoadingSkeleton';
import { analyticsService } from '@/features/analytics/services/analyticsService';
import { AnalyticsDashboardData } from '@/features/analytics/types/analytics.types';
import PermissionGuard from '@/components/PermissionGuard';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getDashboardData();
      if (response.success && response.data) {
        setData(response.data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 1 minute
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4"
        >
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-1">Failed to Load Analytics</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <PermissionGuard requiredPermission="/admin/analytics">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.revenue.total)}
          change={data.revenue.growth.monthly}
          icon={BanknotesIcon}
          color="green"
          subtitle={`AOV: ${formatCurrency(data.revenue.averageOrderValue)}`}
        />
        <StatCard
          title="Total Orders"
          value={data.orders.total}
          change={data.orders.growth?.monthly || 0}
          icon={ShoppingBagIcon}
          color="blue"
          subtitle={`Completion: ${data.orders.completionRate.toFixed(1)}%`}
        />
        <StatCard
          title="Total Customers"
          value={data.customers.total}
          icon={UsersIcon}
          color="purple"
          subtitle={`Active: ${data.customers.active}`}
        />
        <StatCard
          title="Total Products"
          value={data.products.total}
          icon={CubeIcon}
          color="yellow"
          subtitle={`Out of stock: ${data.products.outOfStock}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenue.timeline} />
        <OrderStatusChart byStatus={data.orders.byStatus} />
      </div>

      {/* Top Products Table */}
      <TopProductsTable products={data.orders.topProducts} />

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerRankingChart byRanking={data.customers.byRanking} />
        
        {/* Voucher Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TicketIcon className="h-6 w-6 mr-2 text-purple-600" />
            Voucher Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Vouchers</span>
              <span className="text-lg font-semibold text-gray-900">{data.vouchers.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Vouchers</span>
              <span className="text-lg font-semibold text-green-600">{data.vouchers.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Usage</span>
              <span className="text-lg font-semibold text-blue-600">{data.vouchers.totalUsage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Discount Given</span>
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(data.vouchers.totalDiscount)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Voucher ROI</span>
              <span className="text-xl font-bold text-purple-600">
                {data.vouchers.voucherROI.toFixed(2)}x
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </PermissionGuard>
  );
}
