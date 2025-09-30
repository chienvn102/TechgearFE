'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { postService, type Post } from '@/features/posts/services/postService';
import Link from 'next/link';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postId = params?.id as string;

  // Load post details
  const loadPost = async () => {
    if (!postId) {
      setError('ID bài viết không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getPostById(postId);
      
      if (response.success && response.data && response.data.post) {
        setPost(response.data.post);
      } else {
        throw new Error(response.message || 'Failed to load post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!post) return;
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.post_title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      // Use post_id for delete (postService will handle finding MongoDB _id)
      const response = await postService.deletePost(post.post_id);
      
      if (response.success) {
        alert('Xóa bài viết thành công!');
        router.push('/admin/posts');
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (err) {
      alert('Lỗi khi xóa bài viết: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Lỗi:</p>
          <p>{error || 'Không tìm thấy bài viết'}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={loadPost}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Thử lại
            </button>
            <Link href="/admin/posts">
              <Button variant="outline" size="sm">
                Về danh sách bài viết
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài viết</h1>
            <p className="text-gray-600 mt-1">
              Thông tin chi tiết về bài viết
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/admin/posts/${post.post_id}/edit`}>
            <Button variant="outline" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={loading}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
                Thông tin bài viết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Bài viết
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-mono text-sm">{post.post_id}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MongoDB ID
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-mono text-xs text-gray-600">{post._id}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề bài viết
                </label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">{post.post_title}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle>Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.post_content}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Độ dài nội dung: <span className="font-medium">{post.post_content.length}</span> ký tự
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                Hình ảnh bài viết
              </CardTitle>
            </CardHeader>
            <CardContent>
              {post.post_img ? (
                <div className="space-y-3">
                  <img
                    src={post.post_img}
                    alt={post.post_title}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="text-xs text-gray-500 break-all">
                    <strong>URL:</strong> {post.post_img}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Không có hình ảnh</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/posts/${post._id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa bài viết
                </Button>
              </Link>
              
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                disabled={loading}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Xóa bài viết
              </Button>
              
              <Link href="/admin/posts" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Về danh sách
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số từ (ước tính):</span>
                <span className="font-medium">
                  {Math.ceil(post.post_content.split(' ').length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số ký tự:</span>
                <span className="font-medium">{post.post_content.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Có hình ảnh:</span>
                <Badge variant={post.post_img ? "success" : "secondary"}>
                  {post.post_img ? "Có" : "Không"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
