// Features/Posts/Services/postService.ts
// Post management service

import { api } from '@/services/api';

interface Post {
  _id: string;
  post_id: string;
  post_img?: string;
  post_title: string;
  post_content: string;
}

interface CreatePostData {
  post_id: string;
  post_img?: string;
  post_title: string;
  post_content: string;
}

interface UpdatePostData {
  post_id?: string;
  post_img?: string;
  post_title?: string;
  post_content?: string;
}

interface PostResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

interface SinglePostResponse {
  success: boolean;
  data: {
    post: Post;
  };
  message?: string;
}

interface PostFilters {
  page?: number;
  limit?: number;
  search?: string;
}

class PostService {
  private baseUrl = '/posts';

  async getPosts(filters: PostFilters = {}): Promise<PostResponse> {
    try {
      const params: Record<string, string> = {};
      
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.search) params.search = filters.search;

      const response = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPostById(postId: string): Promise<SinglePostResponse> {
    try {
      // Use by-post-id endpoint to search by post_id instead of MongoDB _id
      const response = await api.get(`${this.baseUrl}/by-post-id/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createPost(postData: CreatePostData): Promise<SinglePostResponse> {
    try {
      const response = await api.post(this.baseUrl, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePost(postId: string, postData: UpdatePostData): Promise<SinglePostResponse> {
    try {
      // Use by-post-id endpoint for direct post_id update
      const response = await api.put(`${this.baseUrl}/by-post-id/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(postId: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Use by-post-id endpoint for direct deletion 
      const response = await api.delete(`${this.baseUrl}/by-post-id/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const postService = new PostService();
export type { Post, CreatePostData, UpdatePostData, PostResponse, SinglePostResponse, PostFilters };
