'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { usePost } from '@/features/posts/hooks/usePost';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const { post, loading, error } = usePost(postId);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.post_title,
        text: post?.post_title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Không tìm thấy bài viết'}
            </h1>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại
        </motion.button>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {(post.post_img || post.cloudinary_secure_url) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-96"
            >
              <SafeImage
                src={post.post_img || post.cloudinary_secure_url || ''}
                alt={post.post_title || 'Post image'}
                width={1200}
                height={600}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <div className="p-8 lg:p-12">
            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-6 text-sm text-gray-500 mb-6"
            >
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Gần đây'}
                </span>
              </div>
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>Admin</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>5 phút đọc</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight"
            >
              {post.post_title || 'Tiêu đề không có'}
            </motion.h1>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            >
              {post.post_content ? (
                <div dangerouslySetInnerHTML={{ __html: post.post_content }} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nội dung bài viết đang được cập nhật...</p>
                  <p className="text-gray-400 text-sm mt-2">Vui lòng quay lại sau.</p>
                </div>
              )}
            </motion.div>

            {/* Share Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <button
                onClick={handleShare}
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Chia sẻ bài viết
              </button>
            </motion.div>
          </div>
        </article>
      </div>
    </div>
  );
}
