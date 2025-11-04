// components/RevenueTable.tsx
// Revenue Data Table with Flexible Filtering (Day/Month/Year)

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analyticsService';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface RevenueDataPoint {
  date: string;
  value: number;
  orders: number;
}

type ViewType = 'day' | 'month' | 'year';

export function RevenueTable() {
  const [viewType, setViewType] = useState<ViewType>('day');
  const [specificYear, setSpecificYear] = useState<string>(new Date().getFullYear().toString());
  const [specificMonth, setSpecificMonth] = useState<string>('');
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [dateLabel, setDateLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchRevenueData();
  }, [viewType, specificYear, specificMonth]);
  
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const options: any = {};
      
      if (viewType === 'day' || viewType === 'month') {
        options.specificYear = specificYear;
      }
      
      if (viewType === 'day' && specificMonth) {
        options.specificMonth = `${specificYear}-${specificMonth}`;
      }
      
      const response = await analyticsService.getRevenueTimeline(viewType, options);
      
      if (response.success) {
        setData(response.data.timeline);
        setDateLabel(response.data.dateLabel);
        setTotalRevenue(response.data.totalRevenue || 0);
      }
    } catch (error) {
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
    }).format(value) + ' đ';
  };

  // Format date display based on view type
  const formatDateDisplay = (dateString: string) => {
    if (viewType === 'year') {
      return dateString; // Just show year: 2025
    } else if (viewType === 'month') {
      const [year, month] = dateString.split('-');
      return `${month}-${year}`; // Format: 10-2025
    } else {
      // day view: YYYY-MM-DD
      return dateString;
    }
  };

  // Get filter label text
  const getFilterLabel = () => {
    if (viewType === 'day') {
      return specificMonth ? `Chọn ngày (${monthOptions.find(m => m.value === specificMonth)?.label})` : 'Chọn ngày';
    } else if (viewType === 'month') {
      return 'Chọn tháng';
    } else {
      return 'Nhập năm';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-blue-600 mb-4 text-center">
          Báo Cáo Thống Kê
        </h3>
        
        {/* View Type Tabs */}
        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => {
              setViewType('day');
              setSpecificMonth('');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewType === 'day'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Theo ngày
          </button>
          <button
            onClick={() => {
              setViewType('month');
              setSpecificMonth('');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewType === 'month'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Theo tháng
          </button>
          <button
            onClick={() => setViewType('year')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewType === 'year'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Theo năm
          </button>
        </div>
        
        {/* Filter Controls */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Year Selector - Show for day/month views */}
            {viewType !== 'year' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {viewType === 'month' ? 'Chọn năm:' : 'Chọn năm:'}
                </label>
                <select
                  value={specificYear}
                  onChange={(e) => setSpecificYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn tháng (tùy chọn):
                </label>
                <select
                  value={specificMonth}
                  onChange={(e) => setSpecificMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            
            {/* Year Input - Show only for year view */}
            {viewType === 'year' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập năm:
                </label>
                <input
                  type="text"
                  placeholder="VD: 2025"
                  value={specificYear}
                  onChange={(e) => setSpecificYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {/* Search Button */}
            <button
              onClick={fetchRevenueData}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              🔍 Tìm kiếm
            </button>
          </div>
        </div>
      </div>
      
      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-center">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Không có dữ liệu để hiển thị</p>
            <p className="text-sm text-gray-400 mt-2">Vui lòng chọn khoảng thời gian khác</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-800">
                  Thời gian
                </th>
                <th className="border border-gray-300 px-6 py-3 text-center font-semibold text-gray-800">
                  Doanh thu bán hàng
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <motion.tr
                  key={item.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border border-gray-300 px-6 py-3 text-center text-gray-700">
                    {formatDateDisplay(item.date)}
                  </td>
                  <td className="border border-gray-300 px-6 py-3 text-center text-green-600 font-medium">
                    {formatCurrency(item.value)}
                  </td>
                </motion.tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-blue-50 font-bold">
                <td className="border border-gray-300 px-6 py-3 text-center text-gray-900">
                  Tổng cộng
                </td>
                <td className="border border-gray-300 px-6 py-3 text-center text-blue-600 text-lg">
                  {formatCurrency(totalRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Summary Info */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>
              Hiển thị <span className="font-semibold text-blue-600">{data.length}</span> kết quả
              {dateLabel && <span> - {dateLabel}</span>}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
