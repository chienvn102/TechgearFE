// Example: Responsive Player Image Component
// Sử dụng component này thay vì thẻ img thông thường

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PlayerImageProps {
  player: {
    player_id: string;
    player_name: string;
    player_img: string;
  };
  className?: string;
  priority?: boolean;
}

export const PlayerImage: React.FC<PlayerImageProps> = ({ 
  player, 
  className = '',
  priority = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate responsive image URLs
  const getImageUrl = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    const sizeMap = {
      sm: '_400x150',   // Mobile
      md: '_800x300',   // Tablet  
      lg: '_1200x450',  // Desktop
      xl: '_1920x600'   // Large Desktop
    };
    
    const baseUrl = `/images/players/${player.player_id}`;
    return `${baseUrl}${sizeMap[size]}.webp`;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader khi ảnh đang tải */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400 opacity-50">
              {player.player_name.split(' ').map(name => name[0]).join('')}
            </span>
          </div>
        </div>
      )}

      {/* Main responsive image */}
      {!imageError && (
        <picture>
          {/* WebP sources cho modern browsers */}
          <source
            media="(max-width: 640px)"
            srcSet={getImageUrl('sm')}
            type="image/webp"
          />
          <source
            media="(max-width: 1024px)"
            srcSet={getImageUrl('md')}
            type="image/webp"
          />
          <source
            media="(max-width: 1440px)"
            srcSet={getImageUrl('lg')}
            type="image/webp"
          />
          <source
            media="(min-width: 1441px)"
            srcSet={getImageUrl('xl')}
            type="image/webp"
          />
          
          {/* Fallback JPG cho older browsers */}
          <img
            src={`/images/players/${player.player_id}.jpg`}
            alt={`${player.player_name} - Professional footballer`}
            className="w-full h-full object-cover object-center transition-all duration-500"
            style={{
              filter: imageLoaded ? 'brightness(0.7) contrast(1.1)' : 'brightness(0.5)',
              transform: imageLoaded ? 'scale(1)' : 'scale(1.05)',
            }}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </picture>
      )}

      {/* Fallback typography nếu ảnh lỗi */}
      {imageError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600"
        >
          <span className="text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-black text-white opacity-20 select-none leading-none">
            {player.player_name.split(' ').map(name => name[0]).join('')}
          </span>
        </motion.div>
      )}

      {/* Gradient overlay cho text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    </div>
  );
};

// Cách sử dụng trong PlayersSection.tsx:
/*
import { PlayerImage } from './PlayerImage';

// Thay thế phần img hiện tại bằng:
<PlayerImage
  player={currentPlayer}
  className="absolute inset-0"
  priority={index === 0} // Preload ảnh đầu tiên
/>
*/
