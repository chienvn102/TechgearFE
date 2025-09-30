// 📡 PLAYER SERVICE - API Integration cho Player Management

import { apiClient } from '@/shared/services/api';
import { 
  Player, 
  CreatePlayerData, 
  UpdatePlayerData, 
  PlayerListResponse, 
  PlayerResponse,
  PlayerFilters 
} from '../types/player.types';

export class PlayerService {
  private baseUrl = '/players';

  // Lấy danh sách players với pagination và filters
  async getPlayers(filters?: PlayerFilters): Promise<{
    success: boolean;
    data: PlayerListResponse;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.position) params.append('position', filters.position);
      if (filters?.team_name) params.append('team_name', filters.team_name);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Players retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin chi tiết một player
  async getPlayerById(id: string): Promise<{
    success: boolean;
    data: PlayerResponse;
    message?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      // Handle nested response structure từ backend
      const playerData = (response.data.data as any).player || response.data.data;
      
      return {
        success: true,
        data: { player: playerData },
        message: response.data.message || 'Player retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo player mới
  async createPlayer(playerData: CreatePlayerData): Promise<{
    success: boolean;
    data: PlayerResponse;
    message?: string;
  }> {
    try {
      const response = await apiClient.post(this.baseUrl, playerData);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Player created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật player
  async updatePlayer(id: string, playerData: UpdatePlayerData): Promise<{
    success: boolean;
    data: PlayerResponse;
    message?: string;
  }> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, playerData);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Player updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Xóa player
  async deletePlayer(id: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      
      return {
        success: true,
        message: response.data.message || 'Player deleted successfully'
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data?.message || 'Không thể xóa player có sản phẩm liên quan'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Player không tồn tại'
        };
      }
      
      // Return a proper error response for other cases
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Không thể xóa player'
      };
    }
  }

  // Upload ảnh player với Cloudinary
  async uploadPlayerImage(file: File, playerId: string): Promise<{
    success: boolean;
    data: { imageUrl: string };
    message?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('image', file); // Backend expects 'image' field name
      formData.append('player_id', playerId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/player-image`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthToken()
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: { imageUrl: data.data.imageUrl || data.data.url },
        message: data.message || 'Player image uploaded successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Xóa ảnh player
  async deletePlayerImage(playerId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await apiClient.delete(`/upload/player-image/${playerId}`);
      
      return {
        success: true,
        message: response.data.message || 'Player image deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Search players
  async searchPlayers(query: string, filters?: PlayerFilters): Promise<{
    success: boolean;
    data: PlayerListResponse;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      if (filters?.position) params.append('position', filters.position);
      if (filters?.team_name) params.append('team_name', filters.team_name);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiClient.get(`${this.baseUrl}/search?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Players found successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // 🔧 HELPER METHODS
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || '';
      return token ? `Bearer ${token}` : '';
    }
    return '';
  }
}

// Export singleton instance
export const playerService = new PlayerService();
