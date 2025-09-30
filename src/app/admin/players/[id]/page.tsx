'use client';

// 🏈 PLAYER DETAIL PAGE - Admin Interface
// View detailed player information

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SafeImage } from '@/utils/imageUtils';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { playerService } from '@/features/players/services/playerService';
import { Player } from '@/features/players/types/player.types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlayerDetailPage({ params }: PageProps) {
  const { id: playerId } = use(params);
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load player data
  useEffect(() => {
    const loadPlayer = async () => {
      if (!playerId) return;
      
      try {
        setLoading(true);
        const response = await playerService.getPlayerById(playerId);
        
        if (response.success && response.data.player) {
          setPlayer(response.data.player);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player');
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]);

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa player này?')) return;
    
    try {
      const response = await playerService.deletePlayer(playerId);
      if (response.success) {
        alert('Xóa player thành công!');
        router.push('/admin/players');
      } else {
        alert('Xóa player thất bại');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa player thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Player không tồn tại'}
          </div>
          <Link href="/admin/players">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Quay lại danh sách
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/players">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết Player</h1>
            <p className="text-gray-600">Thông tin chi tiết của player</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/admin/players/${player._id}/edit`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Chỉnh sửa
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Xóa
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
            <div className="aspect-square relative">
              {player.player_img && 
               typeof player.player_img === 'string' &&
               player.player_img.trim() !== '' &&
               player.player_img !== 'null' &&
               player.player_img !== 'undefined' &&
               (player.player_img.startsWith('http') || player.player_img.startsWith('/')) ? (
                <SafeImage
                  src={player.player_img}
                  alt={player.player_name || 'Player'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Player Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Player ID</label>
                <p className="text-lg text-gray-900 font-mono">{player.player_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên Player</label>
                <p className="text-lg text-gray-900">{player.player_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg text-gray-900">{player.role || player.position || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Đội</label>
                <p className="text-lg text-gray-900">{player.team_name || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Nội dung
            </h2>
            <div className="prose max-w-none">
              {player.player_content ? (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: player.player_content }}
                />
              ) : (
                <p className="text-gray-500 italic">Chưa có nội dung</p>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Thống kê
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">Sản phẩm liên quan</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Date(player.created_at).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-sm text-gray-500">Ngày tạo</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date(player.updated_at).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-sm text-gray-500">Cập nhật cuối</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}