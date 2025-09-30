'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  TrophyIcon, 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

interface Ranking {
  _id: string;
  rank_id: string;
  rank_name: string;
  min_spending: number;
  max_spending: number;
  discount_percent: number;
  benefits: string[];
  is_active: boolean;
  created_at: string;
}

export default function CustomerRankingPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load rankings
  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/rankings');
        const data = await response.json();
        
        if (data.success) {
          setRankings(data.data.rankings || []);
        } else {
          setError(data.message || 'Lỗi khi tải danh sách ranking');
        }
      } catch (err) {
        setError('Lỗi khi tải danh sách ranking');
        } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRankingColor = (rankName: string) => {
    switch (rankName.toLowerCase()) {
      case 'bronze':
      case 'đồng':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
      case 'bạc':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold':
      case 'vàng':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum':
      case 'bạch kim':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'diamond':
      case 'kim cương':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankingIcon = (rankName: string) => {
    switch (rankName.toLowerCase()) {
      case 'bronze':
      case 'đồng':
        return '🥉';
      case 'silver':
      case 'bạc':
        return '🥈';
      case 'gold':
      case 'vàng':
        return '🥇';
      case 'platinum':
      case 'bạch kim':
        return '💎';
      case 'diamond':
      case 'kim cương':
        return '💠';
      default:
        return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              Hệ thống Ranking Khách hàng
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các cấp độ thành viên và ưu đãi cho khách hàng
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Ranking
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankings.map((ranking, index) => (
            <motion.div
              key={ranking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Ranking Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getRankingIcon(ranking.rank_name)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {ranking.rank_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {ranking.rank_id}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={ranking.is_active ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {ranking.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>

                {/* Spending Range */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Mức chi tiêu yêu cầu:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      Từ {formatCurrency(ranking.min_spending)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Đến {formatCurrency(ranking.max_spending)}
                    </p>
                  </div>
                </div>

                {/* Discount */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Giảm giá:
                  </h4>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-green-600">
                      {ranking.discount_percent}%
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Quyền lợi:
                  </h4>
                  <ul className="space-y-1">
                    {ranking.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {rankings.length === 0 && !loading && (
          <div className="text-center py-12">
            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có ranking nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bắt đầu tạo hệ thống ranking cho khách hàng của bạn
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo Ranking đầu tiên
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
