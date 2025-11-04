import { ApiResponse } from '@/shared/types';
import api from '@/shared/services/api';

export interface Post {
  _id: string;
  post_id: string;
  post_title: string;
  post_content: string;
  post_img?: string;
  cloudinary_secure_url?: string;
  cloudinary_public_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostListResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class PostService {
  private baseUrl = '/posts';

  async getPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PostListResponse>> {
    try {
      const response = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  }

  async getPostById(postId: string): Promise<ApiResponse<{ post: Post }>> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
      const url = `${baseUrl}${this.baseUrl}/${postId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch post');
    }
  }

  async getPostByPostId(postId: string): Promise<ApiResponse<{ post: Post }>> {
    try {
      const response = await api.get(`${this.baseUrl}/by-post-id/${postId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  }
}

export const postService = new PostService();