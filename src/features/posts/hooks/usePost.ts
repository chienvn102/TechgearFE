import { useState, useEffect } from 'react';
import { postService, Post } from '../services/postService';

export const usePost = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getPostById(postId);
      
      if (response.success && response.data?.post) {
        setPost(response.data.post);
      } else {
        throw new Error('Post not found');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadPost();
  };

  return {
    post,
    loading,
    error,
    refetch
  };
};
