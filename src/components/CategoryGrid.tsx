// CategoryGrid Component - Hiển thị danh mục sản phẩm
// Lấy dữ liệu thực từ backend API categories

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  SpeakerWaveIcon,
  CameraIcon,
  TvIcon
} from '@heroicons/react/24/outline';
import { categoryService, Category } from '../lib/api';

// Map category icons theo cg_id từ backend
const getCategoryIcon = (cgId: string) => {
  const iconMap: { [key: string]: any } = {
    'MOBILE': DevicePhoneMobileIcon,
    'LAPTOP': ComputerDesktopIcon,
    'TABLET': DeviceTabletIcon,
    'HEADPHONE': SpeakerWaveIcon,
    'CAMERA': CameraIcon,
    'TV': TvIcon,
    // Có thể thêm các category khác
  };
  return iconMap[cgId] || DevicePhoneMobileIcon;
};

// Map category colors theo cg_id
const getCategoryColor = (cgId: string) => {
  const colorMap: { [key: string]: { bg: string; icon: string; hover: string } } = {
    'MOBILE': { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:bg-blue-100' },
    'LAPTOP': { bg: 'bg-green-50', icon: 'text-green-600', hover: 'hover:bg-green-100' },
    'TABLET': { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
    'HEADPHONE': { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:bg-orange-100' },
    'CAMERA': { bg: 'bg-red-50', icon: 'text-red-600', hover: 'hover:bg-red-100' },
    'TV': { bg: 'bg-indigo-50', icon: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
  };
  return colorMap[cgId] || { bg: 'bg-gray-50', icon: 'text-gray-600', hover: 'hover:bg-gray-100' };
};

interface CategoryGridProps {
  onCategoryClick?: (category: Category) => void;
  maxCategories?: number;
}

export default function CategoryGrid({ onCategoryClick, maxCategories = 6 }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // BẮT BUỘC: Lấy dữ liệu từ backend API
      const response = await categoryService.getCategories();
      
      if (response.success && response.data.categories) {
        // Filter active categories và limit số lượng hiển thị
        const activeCategories = response.data.categories
          .filter(cat => cat.is_active)
          .slice(0, maxCategories);
        
        setCategories(activeCategories);
      } else {
        setError('Không thể tải danh mục sản phẩm');
      }
    } catch (err) {
      setError('Lỗi khi tải danh mục sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      // Default behavior: navigate to category page
      window.location.href = `/products?category=${category.cg_id}`;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: maxCategories }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl p-6 h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchCategories}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category, index) => {
        const IconComponent = getCategoryIcon(category.cg_id);
        const colors = getCategoryColor(category.cg_id);
        
        return (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category)}
            className={`
              ${colors.bg} ${colors.hover}
              rounded-xl p-6 cursor-pointer transition-all duration-300
              border border-gray-100 shadow-sm hover:shadow-md
              group
            `}
          >
            <div className="text-center">
              {/* Category Icon */}
              <div className={`
                w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mx-auto mb-3
                group-hover:scale-110 transition-transform duration-300
              `}>
                <IconComponent className={`h-6 w-6 ${colors.icon}`} />
              </div>
              
              {/* Category Name */}
              <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700">
                {category.cg_name}
              </h3>
              
              {/* Category Description - Truncated */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {category.category_description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
