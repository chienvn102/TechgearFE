'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  TrophyIcon,
  StarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

interface CustomerRanking {
  _id: string;
  customer_id: {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
  rank_id: {
    _id: string;
    rank_id: string;
    rank_name: string;
    min_spending: number;
    max_spending: number;
    discount_percent: number;
  };
  total_spending: number;
  created_at: string;
  updated_at: string;
}

export default function CustomerRankingManagementPage() {
  const [customerRankings, setCustomerRankings] = useState<CustomerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('all');

  // Load customer rankings
  useEffect(() => {
    const loadCustomerRankings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/customer-rankings');
        const data = await response.json();
        
        if (data.success) {
          setCustomerRankings(data.data.customer_rankings || []);
        } else {
          setError(data.message || 'Lỗi khi tải danh sách customer ranking');
        }
      } catch (err) {
        setError('Lỗi khi tải danh sách customer ranking');
        } finally {
        setLoading(false);
      }
    };

    loadCustomerRankings();
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

  // Filter customers
  const filteredCustomers = customerRankings.filter(customer => {
    const matchesSearch = customer.customer_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_id.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_id.phone_number.includes(searchTerm);
    
    const matchesRank = selectedRank === 'all' || customer.rank_id.rank_id === selectedRank;
    
    return matchesSearch && matchesRank;
  });

  // Get unique ranks for filter
  const uniqueRanks = [...new Set(customerRankings.map(c => c.rank_id.rank_id))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            Quản lý Ranking Khách hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và quản lý cấp độ thành viên của khách hàng
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{customerRankings.length}</p>
              </div>
            </div>
          </div>

          {uniqueRanks.map(rank => {
            const count = customerRankings.filter(c => c.rank_id.rank_id === rank).length;
            const rankData = customerRankings.find(c => c.rank_id.rank_id === rank)?.rank_id;
            
            return (
              <div key={rank} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{rankData?.rank_name}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm khách hàng
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tên, email, hoặc số điện thoại..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo ranking
              </label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả ranking</option>
                {uniqueRanks.map(rank => {
                  const rankData = customerRankings.find(c => c.rank_id.rank_id === rank)?.rank_id;
                  return (
                    <option key={rank} value={rank}>
                      {rankData?.rank_name} ({rank})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Customer Rankings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày cập nhật
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {customer.customer_id.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.customer_id.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.customer_id.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.customer_id.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getRankingIcon(customer.rank_id.rank_name)}
                        </span>
                        <div>
                          <Badge className={getRankingColor(customer.rank_id.rank_name)}>
                            {customer.rank_id.rank_name}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {customer.rank_id.rank_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.total_spending)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Yêu cầu: {formatCurrency(customer.rank_id.min_spending)} - {formatCurrency(customer.rank_id.max_spending)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {customer.rank_id.discount_percent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.updated_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy khách hàng nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc tìm kiếm khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
