// components/StatCard.tsx
// Reusable Stat Card Component for Analytics Dashboard

'use client';

import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'gray';
  subtitle?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  gray: {
    bg: 'bg-gray-100',
    icon: 'text-gray-600',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  subtitle 
}: StatCardProps) {
  const colors = colorClasses[color];
  const isPositiveChange = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className={`bg-white rounded-xl shadow-md border ${colors.border} p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {isPositiveChange ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveChange ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`p-4 ${colors.bg} rounded-lg`}>
          <Icon className={`h-8 w-8 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
