// components/RevenueChart.tsx
// Line Chart for Revenue Timeline with Flexible Filtering

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimelineDataPoint } from '../types/analytics.types';
import { analyticsService } from '../services/analyticsService';

interface RevenueChartProps {
  data?: TimelineDataPoint[]; // Optional - can fetch internally
  title?: string;
}

type ViewType = 'day' | 'week' | 'month' | 'year';

export function RevenueChart({ data: externalData, title }: RevenueChartProps) {
  const [viewType, setViewType] = useState<ViewType>('day');
  const [specificYear, setSpecificYear] = useState<string>(new Date().getFullYear().toString());
  const [specificMonth, setSpecificMonth] = useState<string>('');
  const [data, setData] = useState<TimelineDataPoint[]>(externalData || []);
  const [dateLabel, setDateLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Fetch data when filters change
  useEffect(() => {
    if (!externalData) {
      fetchRevenueData();
    }
  }, [viewType, specificYear, specificMonth, externalData]);
  
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const options: any = {};
      
      if (viewType === 'day' || viewType === 'month' || viewType === 'week') {
        options.specificYear = specificYear;
      }
      
      if (viewType === 'day' && specificMonth) {
        options.specificMonth = `${specificYear}-${specificMonth}`;
      }
      
      const response = await analyticsService.getRevenueTimeline(viewType, options);
      
      if (response.success) {
        setData(response.data.timeline);
        setDateLabel(response.data.dateLabel);
      }
    } catch (error) {
      console.error('Error fetching revenue timeline:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate year options (last 5 years + current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  // Month options
  const monthOptions = [
    { value: '01', label: 'Tháng 1' },
    { value: '02', label: 'Tháng 2' },
    { value: '03', label: 'Tháng 3' },
    { value: '04', label: 'Tháng 4' },
    { value: '05', label: 'Tháng 5' },
    { value: '06', label: 'Tháng 6' },
    { value: '07', label: 'Tháng 7' },
    { value: '08', label: 'Tháng 8' },
    { value: '09', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
  ];

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Format date for x-axis based on view type
  const formatDate = (dateString: string) => {
    if (viewType === 'year') {
      return dateString; // Just show year: 2025
    } else if (viewType === 'month') {
      const [year, month] = dateString.split('-');
      return `T${parseInt(month)}/${year}`;
    } else if (viewType === 'week') {
      const [year, week] = dateString.split('-W');
      return `T${week}/${year}`;
    } else {
      // day view
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      {/* Header with Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title || dateLabel || 'Biểu đồ doanh thu'}
        </h3>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* View Type Selector */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xem theo
            </label>
            <select
              value={viewType}
              onChange={(e) => {
                setViewType(e.target.value as ViewType);
                setSpecificMonth(''); // Reset month when changing view
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
          
          {/* Year Selector - Show for day/week/month views */}
          {viewType !== 'year' && (
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn năm
              </label>
              <select
                value={specificYear}
                onChange={(e) => setSpecificYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Month Selector - Show only for day view */}
          {viewType === 'day' && (
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng (tùy chọn)
              </label>
              <select
                value={specificMonth}
                onChange={(e) => setSpecificMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả tháng</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={fetchRevenueData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>
      
      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
              labelFormatter={formatDate}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Doanh thu"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
