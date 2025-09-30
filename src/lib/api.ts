// API Configuration và Services cho toàn bộ ứng dụng
// BẮT BUỘC sử dụng dữ liệu thực từ backend API

import axios from 'axios';

// Base API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor để thêm auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try both token keys to be safe
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Types theo MongoDB schema
export interface Category {
  _id: string;
  cg_id: string;
  cg_name: string;
  category_description: string;
  is_active: boolean;
  created_at: string;
  __v: number;
}

export interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  brand_description?: string;
  br_img?: string;
  cloudinary_secure_url?: string;
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  product_count?: number;
  storage_type?: string;
  img_metadata?: {
    sizes: {
      thumbnail: string;
      medium: string;
      large: string;
    };
    format: string;
    width: number;
    height: number;
    bytes: number;
  };
}

export interface ProductType {
  _id: string;
  pdt_id: string;
  pdt_name: string;
}

export interface Product {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_note?: string;
  pd_day_updated: string;
  br_id: Brand;
  pdt_id: ProductType;
  category_id: Category;
  player_id?: Player;
  product_description: string;
  stock_quantity: number;
  is_available: boolean;
  color?: string;
  sku?: string;
  created_at: string;
  __v: number;
  images?: Array<{
    _id?: string;
    pd_id: string | object;
    img: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
    __v?: number;
  }>;
}

export interface Player {
  _id: string;
  player_id: string;
  player_name: string;
  player_content: string;
  player_img: string;
  achievements: string;
  team_name: string;
  position: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: PaginationInfo;
}

export interface PlayerListResponse {
  players: Player[];
  pagination: PaginationInfo;
}

// Category API Service
export const categoryService = {
  // Lấy tất cả danh mục
  async getCategories(): Promise<ApiResponse<CategoryListResponse>> {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Lấy danh mục theo ID
  async getCategoryById(id: string): Promise<ApiResponse<{ category: Category }>> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }
};

// Product API Service
export const productService = {
  // Lấy tất cả sản phẩm với pagination
  async getProducts(params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    brand?: string;
  }): Promise<ApiResponse<ProductListResponse>> {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Lấy sản phẩm theo ID
  async getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Lấy sản phẩm nổi bật (featured products)
  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse<ProductListResponse>> {
    const response = await apiClient.get('/products', { 
      params: { 
        page: 1, 
        limit,
        // Có thể thêm filter cho sản phẩm nổi bật nếu backend hỗ trợ
      } 
    });
    return response.data;
  },

  // Lấy sản phẩm theo danh mục
  async getProductsByCategory(categoryId: string, params?: { 
    page?: number; 
    limit?: number; 
  }): Promise<ApiResponse<ProductListResponse>> {
    const response = await apiClient.get('/products', { 
      params: { 
        ...params,
        category: categoryId 
      } 
    });
    return response.data;
  }
};

// Auth API Service
export const authService = {
  // Đăng nhập admin/customer
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Đăng ký customer
  async register(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
};

// Player API Service
export const playerService = {
  // Lấy tất cả tuyển thủ (public endpoint, không cần auth)
  async getPlayers(params?: { 
    page?: number; 
    limit?: number; 
  }): Promise<ApiResponse<PlayerListResponse>> {
    try {
      const response = await apiClient.get('/players', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Lấy tuyển thủ theo ID
  async getPlayerById(id: string): Promise<ApiResponse<{ player: Player }>> {
    const response = await apiClient.get(`/players/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo tuyển thủ (thông qua product_player relationship)
  async getProductsByPlayer(playerId: string, params?: { 
    page?: number; 
    limit?: number; 
  }): Promise<ApiResponse<ProductListResponse>> {
    const response = await apiClient.get('/products', { 
      params: { 
        ...params,
        player: playerId 
      } 
    });
    return response.data;
  }
};

export { apiClient };
