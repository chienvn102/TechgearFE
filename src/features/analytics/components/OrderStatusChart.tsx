// components/OrderStatusChart.tsx
// Pie Chart for Order Status Distribution

'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OrderStatusChartProps {
  byStatus: {
    PENDING: number;
    CONFIRMED: number;
    SHIPPING: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  title?: string;
}

const STATUS_COLORS = {
  PENDING: '#f59e0b',      // yellow-500
  CONFIRMED: '#3b82f6',    // blue-500
  SHIPPING: '#8b5cf6',     // purple-500
  DELIVERED: '#10b981',    // green-500
  CANCELLED: '#ef4444',    // red-500
};

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

export function OrderStatusChart({ byStatus, title = 'Order Status Distribution' }: OrderStatusChartProps) {
  // Transform data for Recharts
  const chartData = Object.entries(byStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value: count,
    status,
  }));

  const COLORS = Object.values(STATUS_COLORS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {chartData.every(d => d.value === 0) ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          Không có dữ liệu đơn hàng
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`${value} đơn hàng`, 'Số lượng']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
