'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { SafeImage } from '@/shared/components/ui/SafeImage';

// Types
interface Post {
  _id: string;
  post_id: string;
  post_title: string;
  post_content: string;
  post_img?: string;
  cloudinary_secure_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogSectionProps {
  maxPosts?: number;
  onPostClick?: (post: Post) => void;
  onViewAll?: () => void;
}

// API service
const apiService = {
  async getPosts(limit = 3) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    
    const response = await fetch(`${baseUrl}/posts?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  }
};

export default function BlogSection({ 
  maxPosts = 3, 
  onPostClick,
  onViewAll 
}: BlogSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [maxPosts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPosts(maxPosts);
      
      if (response.success) {
        setPosts(response.data.posts || []);
      } else {
        setError('Không thể tải bài viết');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: Post) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  const nextPost = () => {
    setCurrentPostIndex((prev) => (prev + 1) % posts.length);
  };

  const prevPost = () => {
    setCurrentPostIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bài viết mới nhất
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {error || 'Chưa có bài viết nào'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentPost = posts[currentPostIndex];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bài viết mới nhất
            </h2>
            <p className="text-gray-600 text-lg">
              Cập nhật tin tức và xu hướng gaming mới nhất
            </p>
          </motion.div>
        </div>

        {/* Main Content - Layout tương tự MCHOSE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Featured Post Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image Container với tilt effect như MCHOSE */}
            <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                  {currentPost.post_img || currentPost.cloudinary_secure_url ? (
                    <SafeImage
                      src={currentPost.post_img || currentPost.cloudinary_secure_url || ''}
                      alt={currentPost.post_title}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                      crop="fit"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📝</span>
                        </div>
                        <p className="text-gray-500 font-medium">Bài viết</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {posts.length > 1 && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={prevPost}
                  className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <button
                  onClick={nextPost}
                  className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Post Meta */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>
                  {currentPost.createdAt 
                    ? new Date(currentPost.createdAt).toLocaleDateString('vi-VN')
                    : 'Gần đây'
                  }
                </span>
              </div>
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>Admin</span>
              </div>
            </div>

            {/* Post Title */}
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {currentPost.post_title}
            </h3>

            {/* Post Excerpt */}
            <p className="text-lg text-gray-600 leading-relaxed">
              {currentPost.post_content.length > 200 
                ? `${currentPost.post_content.substring(0, 200)}...`
                : currentPost.post_content
              }
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handlePostClick(currentPost)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <span>Đọc thêm</span>
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
              
              {onViewAll && (
                <button
                  onClick={handleViewAll}
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Xem tất cả bài viết
                </button>
              )}
            </div>

            {/* Post Indicators */}
            {posts.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Bài viết:</span>
                <div className="flex space-x-1">
                  {posts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPostIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPostIndex 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {currentPostIndex + 1} / {posts.length}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Posts Grid (if more than 1 post) */}
        {posts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Bài viết khác
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  onClick={() => handlePostClick(post)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                >
                  <div className="aspect-video overflow-hidden">
                    {post.post_img || post.cloudinary_secure_url ? (
                      <SafeImage
                        src={post.post_img || post.cloudinary_secure_url || ''}
                        alt={post.post_title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crop="fit"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.post_title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.post_content.length > 100 
                        ? `${post.post_content.substring(0, 100)}...`
                        : post.post_content
                      }
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500">
                        {post.createdAt 
                          ? new Date(post.createdAt).toLocaleDateString('vi-VN')
                          : 'Gần đây'
                        }
                      </span>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
