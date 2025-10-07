// services/userManagementService.ts
// Service for User Management API calls

import { apiClient } from '@/shared/services/api';

export interface UserManagement {
  _id: string;
  id: string;
  username: string;
  name: string;
  role_id: {
    _id: string;
    role_id: string;
    role_name: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface CreateUserData {
  id: string;
  username: string;
  password: string;
  name: string;
  role_id: string;
}

export interface UpdateUserData {
  id?: string;
  username?: string;
  name?: string;
  role_id?: string;
  password?: string;
}

export interface Role {
  _id: string;
  role_id: string;
  role_name: string;
  description?: string;
}

class UserManagementService {
  private baseUrl = '/user-management';

  // Get all users with pagination and filters
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role_id?: string;
  }) {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new user
  async createUser(data: CreateUserData) {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  // Update user
  async updateUser(id: string, data: UpdateUserData) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete user
  async deleteUser(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Change user role
  async changeUserRole(userId: string, roleId: string) {
    return this.updateUser(userId, { role_id: roleId });
  }

  // Get all roles for dropdown
  async getAllRoles() {
    const response = await apiClient.get('/roles', {
      params: { limit: 100 } // Get all roles
    });
    return response.data;
  }

  // Reset user password (Admin only)
  async resetPassword(userId: string, newPassword: string) {
    return this.updateUser(userId, { password: newPassword });
  }
}

export const userManagementService = new UserManagementService();
