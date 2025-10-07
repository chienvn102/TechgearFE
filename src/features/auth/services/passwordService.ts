import { apiClient } from '@/shared/services/api';

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    updated_at: string;
  };
}

class PasswordService {
  /**
   * Change customer password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post('/user-customers/change-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Có lỗi xảy ra khi đổi mật khẩu'
      };
    }
  }
}

export const passwordService = new PasswordService();
