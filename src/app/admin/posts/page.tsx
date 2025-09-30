'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { postService, type Post } from '@/features/posts/services/postService';
import Link from 'next/link';

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const itemsPerPage = 10;

  // Load posts
  const loadPosts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getPosts({
        page,
        limit: itemsPerPage,
        search: search.trim() || undefined
      });

      if (response.success && response.data) {
        // Backend returns {success: true, data: {posts: [], pagination: {}}}
        const postsArray = response.data.posts || [];
        setPosts(postsArray);
        
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.page || 1);
          setTotalPages(response.data.pagination.pages || 1); // 'pages' not 'totalPages'
          setTotalPosts(response.data.pagination.total || 0);
        } else {
          // No pagination info, set defaults
          setTotalPosts(postsArray.length);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else {
        throw new Error(response.message || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Search posts
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts(1, searchTerm);
  };

  // Delete post
  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.post_title}"?`)) {
      return;
    }

    try {
      // Use post_id for deletion
      const response = await postService.deletePost(post.post_id);
      
      if (response.success) {
        // Show success message
        alert('Xóa bài viết thành công!');
        
        // Reload current page, but handle case where we deleted the last item on current page
        const remainingItems = totalPosts - 1;
        const maxPossiblePage = Math.ceil(remainingItems / itemsPerPage);
        const pageToLoad = currentPage > maxPossiblePage ? Math.max(1, maxPossiblePage) : currentPage;
        
        await loadPosts(pageToLoad, searchTerm);
        
        // Update current page if needed
        if (pageToLoad !== currentPage) {
          setCurrentPage(pageToLoad);
        }
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (err) {
      alert('Lỗi khi xóa bài viết: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPosts(page, searchTerm);
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài viết</h1>
            <p className="text-gray-600 mt-1">
              Quản lý {totalPosts} bài viết trong hệ thống
            </p>
          </div>
        </div>
        <Link
          href="/admin/posts/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Thêm bài viết
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="bg-green-600 hover:bg-green-700">
              Tìm kiếm
            </Button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
          <button
            onClick={() => loadPosts(currentPage, searchTerm)}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow">
        {loading && posts.length > 0 && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </div>
        )}

        {posts.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có bài viết nào</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Không tìm thấy bài viết phù hợp với từ khóa tìm kiếm.' : 'Chưa có bài viết nào được tạo.'}
            </p>
            <Link href="/admin/posts/create">
              <Button variant="primary" className="bg-green-600 hover:bg-green-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo bài viết đầu tiên
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post, index) => (
                    <motion.tr
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-[200px]">
                          <div className="text-sm font-medium text-gray-900 truncate" title={post.post_title}>
                            {truncateText(post.post_title, 40)}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {post.post_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="max-w-md">
                            {truncateText(post.post_content, 120)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.post_img ? (
                            <img
                              src={post.post_img}
                              alt={post.post_title}
                              className="h-12 w-20 object-cover rounded-lg border border-gray-200"
                              style={{ aspectRatio: '16/9' }}
                            />
                          ) : (
                            <div className="h-12 w-20 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => router.push(`/admin/posts/${post.post_id}`)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/posts/${post.post_id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-all duration-200"
                            title="Xóa"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 p-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={post.post_title}>
                        {truncateText(post.post_title, 30)}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {post.post_id}
                      </p>
                    </div>
                    {post.post_img && (
                      <img
                        src={post.post_img}
                        alt={post.post_title}
                        className="h-16 w-28 object-cover rounded-lg flex-shrink-0 ml-2 border border-gray-200"
                        style={{ aspectRatio: '16/9' }}
                      />
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {truncateText(post.post_content, 100)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/admin/posts/${post.post_id}`)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="text-xs">Chi tiết</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/posts/${post.post_id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="text-xs">Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-all duration-200 flex items-center space-x-1"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="text-xs">Xóa</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalPosts)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{totalPosts}</span> bài viết
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
