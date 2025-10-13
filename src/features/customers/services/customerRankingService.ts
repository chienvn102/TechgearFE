// services/customerRankingService.ts
import { apiClient } from '@/shared/services/api';

export interface CustomerRanking {
  _id: string;
  customer_id: {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
  rank_id: {
    _id: string;
    rank_id: string;
    rank_name: string;
    min_spending: number;
    max_spending: number;
    discount_percent: number;
    benefits: string[];
    img?: string;
    about?: string;
  };
  total_spending: number; // Deprecated - calculate from PAID orders instead
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  _id: string;
  rank_id: string;
  rank_name: string;
  min_spending: number;
  max_spending: number;
  discount_percent: number;
  benefits: string[];
  img?: string;
  about?: string;
}

class CustomerRankingService {
  private baseUrl = '/customer-rankings';

  async getCustomerRankings(customerId: string): Promise<{ success: boolean; data: { customerRankings: CustomerRanking[] } }> {
    const response = await apiClient.get(`${this.baseUrl}/customer/${customerId}`);
    return response.data;
  }

  async getCustomerRankingById(id: string): Promise<{ success: boolean; data: { customerRanking: CustomerRanking } }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getAllRankings(): Promise<{ success: boolean; data: { rankings: Ranking[] } }> {
    const response = await apiClient.get('/rankings');
    return response.data;
  }

  async getRankingStatistics(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`);
    return response.data;
  }
}

export const customerRankingService = new CustomerRankingService();
