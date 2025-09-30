'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { playerService } from '@/features/players/services/playerService';

interface Player {
  _id: string;
  player_id: string;
  player_name: string;
  player_content: string;
  player_img: string;
  team_name?: string;
  is_active: boolean;
}

export default function HeroBanner() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await playerService.getPlayers();
        if (response.success && response.data.players) {
          setPlayers(response.data.players.filter((player: Player) => player.is_active));
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!isPlaying || players.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % players.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, players.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + players.length) % players.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Không có tuyển thủ nào</div>
      </div>
    );
  }

  const currentPlayer = players[currentIndex];

  return (
    <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={currentPlayer.player_img || '/images/placeholder.svg'}
              alt={currentPlayer.player_name}
              fill
              className="object-cover object-center opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent" />
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                
                {/* Left Content - Player Info */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Top Banner */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="inline-flex items-center px-4 py-2 bg-blue-900/80 backdrop-blur-sm rounded-full border border-blue-400/30"
                  >
                    <span className="text-white text-sm font-medium">
                      Khám phá gaming gear của các tuyển thủ nổi bật
                    </span>
                  </motion.div>

                  {/* Player Name */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="space-y-2"
                  >
                    <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                      {currentPlayer.player_name}
                    </h1>
                    <p className="text-xl lg:text-2xl text-blue-200 font-medium">
                      {currentPlayer.team_name || 'Anyone\'s Legend'}
                    </p>
                  </motion.div>

                  {/* Player Description */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="max-w-2xl"
                  >
                    <p className="text-lg text-gray-200 leading-relaxed">
                      {currentPlayer.player_content && currentPlayer.player_content.length > 150 
                        ? `${currentPlayer.player_content.substring(0, 150)}...`
                        : currentPlayer.player_content
                      }
                    </p>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                  >
                    <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <span>Xem sản phẩm của {currentPlayer.player_name.split(' ')[0]}</span>
                      <ChevronRightIcon className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>

                  {/* Navigation Controls */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex items-center space-x-4 pt-4"
                  >
                    {/* Pagination Dots */}
                    <div className="flex space-x-2">
                      {players.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'bg-yellow-400 scale-125'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className="p-2 text-white hover:text-yellow-400 transition-colors duration-300"
                    >
                      {isPlaying ? (
                        <PauseIcon className="h-5 w-5" />
                      ) : (
                        <PlayIcon className="h-5 w-5" />
                      )}
                    </button>

                    {/* Navigation Arrows */}
                    <div className="flex space-x-2">
                      <button
                        onClick={prevSlide}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Content - Player Image */}
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="hidden lg:flex justify-center items-center relative"
                >
                  <div className="relative">
                    {/* Main player image container */}
                    <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                      <Image
                        src={currentPlayer.player_img || '/images/placeholder.svg'}
                        alt={currentPlayer.player_name}
                        fill
                        className="object-cover object-center"
                        priority
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}