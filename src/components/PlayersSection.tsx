'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { playerService, Player, ApiResponse, PlayerListResponse } from '../lib/api';

interface PlayersSectionProps {
  maxPlayers?: number;
  onPlayerClick?: (player: Player) => void;
  showViewAll?: boolean;
}

export default function PlayersSection({ 
  maxPlayers = 6, 
  onPlayerClick,
  showViewAll = true 
}: PlayersSectionProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, [maxPlayers]);

  // Auto-slide effect - chuyển slide mỗi 7 giây
  useEffect(() => {
    if (!isPlaying || players.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % players.length);
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [isPlaying, players.length]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sử dụng API thật từ backend
      const response = await playerService.getPlayers({ 
        limit: maxPlayers 
      });
      
      if (response.success && response.data.players) {
        // Filter active players
        const activePlayers = response.data.players.filter(player => player.is_active);
        setPlayers(activePlayers);
      } else {
        throw new Error('Không thể tải danh sách tuyển thủ');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách tuyển thủ từ server');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (player: Player) => {
    if (onPlayerClick) {
      onPlayerClick(player);
    } else {
      // Default: navigate to products page filtered by player
      window.location.href = `/products?player=${player.player_id}`;
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + players.length) % players.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % players.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleViewAll = () => {
    window.location.href = '/products';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải tuyển thủ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchPlayers}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không có tuyển thủ nào để hiển thị</p>
      </div>
    );
  }

  const currentPlayer = players[currentSlide];

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Tuyển thủ nổi bật
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Khám phá các sản phẩm được sử dụng bởi những siêu sao bóng đá hàng đầu thế giới
        </p>
      </div>

      {/* Banner Container - Optimized viewport scaling */}
      <div className="relative max-w-6xl mx-auto w-full px-4" style={{ aspectRatio: '16/7' }}>
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl mb-8">
          <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Dynamic Background Gradient */}
            <div className={`absolute inset-0 ${
              currentPlayer.team_name === 'Al Nassr' ? 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700' :
              currentPlayer.team_name === 'Inter Miami' ? 'bg-gradient-to-br from-pink-500 via-rose-600 to-pink-700' :
              currentPlayer.team_name === 'Real Madrid' ? 'bg-gradient-to-br from-white via-blue-100 to-blue-200' :
              currentPlayer.team_name === 'Manchester City' ? 'bg-gradient-to-br from-sky-500 via-blue-600 to-sky-700' :
              currentPlayer.team_name === 'Al Hilal' ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800' :
              currentPlayer.team_name === 'Liverpool' ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-800' :
              'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800'
            }`}>
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}></div>
              </div>
            </div>

            {/* 2 Columns Layout */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full items-center">
                  
                  {/* Left Column - Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-white space-y-3 lg:space-y-4"
                  >
                    {/* Position & Team */}
                    <div className="space-y-2">
                      <p className="text-base md:text-lg lg:text-xl font-semibold text-yellow-300">
                        {currentPlayer.position} • {currentPlayer.team_name}
                      </p>
                    </div>

                    {/* Player Name */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                      {currentPlayer.player_name}
                    </h1>

                    {/* Description */}
                    <div className="space-y-3">
                      <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white/90 max-w-lg line-clamp-4">
                        {currentPlayer.player_content || 
                         `${currentPlayer.player_name} - cầu thủ xuất sắc của ${currentPlayer.team_name}, được biết đến với kỹ năng vượt trội và phong độ ổn định.`}
                      </p>

                      {/* Achievement Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-yellow-400 text-base">🏆</span>
                        <span className="font-semibold text-xs md:text-sm">
                          {currentPlayer.team_name === 'Inter Miami' ? '8 Ballon d\'Or, FIFA World Cup Winner 2022' :
                           currentPlayer.team_name === 'Al Nassr' ? '5 UEFA Champions League, 5 Ballon d\'Or' :
                           currentPlayer.team_name === 'Manchester City' ? 'Premier League Champion, UEFA Champions League' :
                           currentPlayer.team_name === 'Real Madrid' ? 'UEFA Champions League Winner' :
                           currentPlayer.team_name === 'Liverpool' ? 'Premier League, UEFA Champions League' :
                           'Professional Football Player'}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => onPlayerClick?.(currentPlayer)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-xl"
                    >
                      <span>Xem sản phẩm của {currentPlayer.player_name.split(' ')[0]}</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>

                  {/* Right Column - Player Image */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="relative h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] flex items-center justify-center"
                  >
                    {currentPlayer.player_img && currentPlayer.player_img.trim() !== '' ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`/images/players/${currentPlayer.player_img}`}
                          alt={currentPlayer.player_name}
                          className="w-full h-full object-contain object-center filter drop-shadow-2xl"
                          style={{
                            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        
                      </div>
                    ) : (
                      /* Fallback: Typography if no image */
                      <div className="flex flex-col items-center justify-center w-full h-full text-center">
                        <span className="text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-black text-white/20 leading-none mb-4">
                          {currentPlayer.player_name.split(' ').map(name => name[0]).join('')}
                        </span>
                        <p className="text-white/60 text-lg">Ảnh sẽ được cập nhật sớm</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-4 z-20">
              {/* Slide Counter */}
              <div className="flex items-center gap-3">
                <span className="text-lg md:text-xl lg:text-2xl font-bold bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  {currentSlide + 1} / {players.length}
                </span>
              </div>
            </div>

            {/* Slide Indicators - Center Right */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-3 z-20">
              {players.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-4 z-20">
              {/* Previous Button */}
              <motion.button
                onClick={goToPrevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1" />}
              </motion.button>

              {/* Next Button */}
              <motion.button
                onClick={goToNextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {showViewAll && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            onClick={handleViewAll}
          >
            Xem tất cả sản phẩm
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
