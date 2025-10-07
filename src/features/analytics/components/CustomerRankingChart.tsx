// components/CustomerRankingChart.tsx
// Bar Chart for Customer Ranking Distribution

'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface CustomerRankingChartProps {
  byRanking: {
    BRONZE: { name: string; count: number };
    SILVER: { name: string; count: number };
    GOLD: { name: string; count: number };
    PLATINUM: { name: string; count: number };
  };
  title?: string;
}

const RANKING_COLORS = {
  BRONZE: '#cd7f32',    // Bronze color
  SILVER: '#c0c0c0',    // Silver color
  GOLD: '#ffd700',      // Gold color
  PLATINUM: '#e5e4e2',  // Platinum color
};

export function CustomerRankingChart({ byRanking, title = 'Customer Ranking Distribution' }: CustomerRankingChartProps) {
  // Transform data for Recharts
  const chartData = [
    { name: 'Bronze', count: byRanking.BRONZE.count, color: RANKING_COLORS.BRONZE },
    { name: 'Silver', count: byRanking.SILVER.count, color: RANKING_COLORS.SILVER },
    { name: 'Gold', count: byRanking.GOLD.count, color: RANKING_COLORS.GOLD },
    { name: 'Platinum', count: byRanking.PLATINUM.count, color: RANKING_COLORS.PLATINUM },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {chartData.every(d => d.count === 0) ? (
        <div className="flex items-center justify-center h-80 text-gray-500">
          Không có dữ liệu khách hàng
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
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
              formatter={(value: number) => [`${value} khách hàng`, 'Số lượng']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            />
            <Bar 
              dataKey="count" 
              name="Khách hàng"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
