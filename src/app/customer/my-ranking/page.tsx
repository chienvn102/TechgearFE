'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  TrophyIcon, 
  StarIcon,
  ArrowLeftIcon,
  GiftIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authService } from '@/features/auth/services/authService';
import { customerService } from '@/features/customers/services/customerService';
import { customerRankingService, CustomerRanking, Ranking } from '@/features/customers/services/customerRankingService';
import { orderService } from '@/features/orders/services/orderService';

interface NextRanking {
  rank_id: string;
  rank_name: string;
  min_spending: number;
  max_spending: number;
  discount_percent: number;
  benefits: string[];
}

export default function MyRankingPage() {
  const router = useRouter();
  const [customerRanking, setCustomerRanking] = useState<CustomerRanking | null>(null);
  const [nextRanking, setNextRanking] = useState<NextRanking | null>(null);
  const [actualTotalSpending, setActualTotalSpending] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMyRanking = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const user = authService.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Get customer info first
        const customerResponse = await customerService.getCurrentCustomerInfo();
        if (customerResponse.success && customerResponse.data.customer) {
          const customer = customerResponse.data.customer;
          
          // Get actual total spending from orders
          const ordersResponse = await orderService.getMyOrders();
          if (ordersResponse.success && ordersResponse.data.orders) {
            const totalSpending = ordersResponse.data.orders.reduce((sum: number, order: any) => 
              sum + (order.order_total || 0), 0);
            setActualTotalSpending(totalSpending);
            }
          
          // Get customer ranking from API
          const rankingResponse = await customerRankingService.getCustomerRankings(customer._id);
          
          if (rankingResponse.success && rankingResponse.data.customerRankings.length > 0) {
            // Get the latest ranking (first in sorted array)
            const latestRanking = rankingResponse.data.customerRankings[0];
            setCustomerRanking(latestRanking);

            // Get all rankings to find next ranking
            const allRankingsResponse = await customerRankingService.getAllRankings();
            if (allRankingsResponse.success) {
              const allRankings = allRankingsResponse.data.rankings;
              
              // Find next ranking based on min_spending
              const nextRank = allRankings.find(rank => 
                rank.min_spending > latestRanking.rank_id.min_spending
              );
              
              if (nextRank) {
                setNextRanking({
                  rank_id: nextRank.rank_id,
                  rank_name: nextRank.rank_name,
                  min_spending: nextRank.min_spending,
                  max_spending: nextRank.max_spending,
                  discount_percent: nextRank.discount_percent,
                  benefits: nextRank.benefits
                });
              }
            }
          } else {
            // No ranking found, create default Bronze ranking
            const allRankingsResponse = await customerRankingService.getAllRankings();
            if (allRankingsResponse.success) {
              const allRankings = allRankingsResponse.data.rankings;
              const bronzeRank = allRankings.find(rank => rank.rank_name.toLowerCase().includes('bronze') || rank.rank_name.toLowerCase().includes('đồng'));
              
              if (bronzeRank) {
                const defaultRanking: CustomerRanking = {
                  _id: 'default-ranking',
                  customer_id: {
                    _id: customer._id,
                    customer_id: customer.customer_id,
                    name: customer.name,
                    email: customer.email,
                    phone_number: customer.phone_number
                  },
                  rank_id: {
                    _id: bronzeRank._id,
                    rank_id: bronzeRank.rank_id,
                    rank_name: bronzeRank.rank_name,
                    min_spending: bronzeRank.min_spending,
                    max_spending: bronzeRank.max_spending,
                    discount_percent: bronzeRank.discount_percent,
                    benefits: bronzeRank.benefits
                  },
                  total_spending: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                
                setCustomerRanking(defaultRanking);
                
                // Find next ranking
                const nextRank = allRankings.find(rank => 
                  rank.min_spending > bronzeRank.min_spending
                );
                
                if (nextRank) {
                  setNextRanking({
                    rank_id: nextRank.rank_id,
                    rank_name: nextRank.rank_name,
                    min_spending: nextRank.min_spending,
                    max_spending: nextRank.max_spending,
                    discount_percent: nextRank.discount_percent,
                    benefits: nextRank.benefits
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin ranking');
        } finally {
        setLoading(false);
      }
    };

    loadMyRanking();
  }, [router]);

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

  const getDefaultBenefits = (rankName: string) => {
    switch (rankName.toLowerCase()) {
      case 'bronze':
      case 'đồng':
      case 'thành viên đồng':
        return [
          'Miễn phí vận chuyển cho đơn hàng từ 500.000₫',
          'Ưu tiên hỗ trợ khách hàng',
          'Thông báo sớm về sản phẩm mới'
        ];
      case 'silver':
      case 'bạc':
      case 'thành viên bạc':
        return [
          'Tất cả quyền lợi của hạng Đồng',
          'Giảm giá 10% cho tất cả sản phẩm',
          'Giao hàng 1 ngày cho đơn hàng từ 300.000₫',
          'Tặng quà sinh nhật'
        ];
      case 'gold':
      case 'vàng':
      case 'thành viên vàng':
        return [
          'Tất cả quyền lợi của hạng Bạc',
          'Giảm giá 15% cho tất cả sản phẩm',
          'Giao hàng miễn phí cho mọi đơn hàng',
          'Tặng quà sinh nhật cao cấp',
          'Ưu tiên đặt hàng sản phẩm hot'
        ];
      case 'platinum':
      case 'bạch kim':
      case 'thành viên bạch kim':
        return [
          'Tất cả quyền lợi của hạng Vàng',
          'Giảm giá 20% cho tất cả sản phẩm',
          'Giao hàng trong ngày',
          'Tặng quà sinh nhật VIP',
          'Ưu tiên đặt hàng sản phẩm hot',
          'Hỗ trợ khách hàng 24/7',
          'Quyền truy cập sản phẩm độc quyền'
        ];
      default:
        return [
          'Quyền lợi cơ bản',
          'Hỗ trợ khách hàng'
        ];
    }
  };

  const calculateProgress = () => {
    if (!customerRanking || !nextRanking) return 0;
    const current = actualTotalSpending; // Use actual spending from orders
    const target = nextRanking.min_spending;
    return Math.min((current / target) * 100, 100);
  };

  const getRemainingAmount = () => {
    if (!customerRanking || !nextRanking) return 0;
    return Math.max(nextRanking.min_spending - actualTotalSpending, 0); // Use actual spending
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customerRanking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Chưa có thông tin ranking
            </h3>
            <p className="text-yellow-600 mb-4">
              Bạn chưa có thông tin ranking. Hãy mua sắm để tích lũy điểm và nâng cấp ranking!
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Bắt đầu mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Về trang chủ
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              Ranking của tôi
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi cấp độ thành viên và quyền lợi của bạn
            </p>
          </div>
        </div>

        {/* Current Ranking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{getRankingIcon(customerRanking.rank_id.rank_name)}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {customerRanking.rank_id.rank_name}
                </h2>
                <p className="text-gray-500">
                  ID: {customerRanking.rank_id.rank_id}
                </p>
                <Badge className={`mt-2 ${getRankingColor(customerRanking.rank_id.rank_name)}`}>
                  Giảm giá {customerRanking.rank_id.discount_percent}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Spending Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tổng chi tiêu thực tế</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(actualTotalSpending)}
              </p>
              {actualTotalSpending !== customerRanking.total_spending && (
                <p className="text-xs text-red-600 mt-1">
                  (Database: {formatCurrency(customerRanking.total_spending)})
                </p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mức ranking hiện tại</h3>
              <p className="text-sm text-gray-600">
                {formatCurrency(customerRanking.rank_id.min_spending)} - {formatCurrency(customerRanking.rank_id.max_spending)}
              </p>
            </div>
          </div>

          {/* Current Benefits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-green-500" />
              Quyền lợi hiện tại
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(() => {
                const benefits = customerRanking.rank_id.benefits && customerRanking.rank_id.benefits.length > 0 
                  ? customerRanking.rank_id.benefits 
                  : getDefaultBenefits(customerRanking.rank_id.rank_name);
                
                return benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </motion.div>

        {/* Next Ranking Progress */}
        {nextRanking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{getRankingIcon(nextRanking.rank_name)}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Hạng tiếp theo: {nextRanking.rank_name}
                </h3>
                <p className="text-gray-500">
                  Cần chi tiêu thêm {formatCurrency(getRemainingAmount())} để nâng cấp
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tiến độ</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Next Ranking Benefits */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                Quyền lợi hạng {nextRanking.rank_name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const benefits = nextRanking.benefits && nextRanking.benefits.length > 0 
                    ? nextRanking.benefits 
                    : getDefaultBenefits(nextRanking.rank_name);
                  
                  return benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <StarIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-800 font-medium mb-2">
                Chỉ còn {formatCurrency(getRemainingAmount())} để nâng cấp lên hạng {nextRanking.rank_name}!
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
