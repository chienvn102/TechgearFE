// services/analyticsService.ts
// Analytics API Service

import { apiClient } from '@/shared/services/api';
import { AnalyticsDashboardData, DateRange } from '../types/analytics.types';

class AnalyticsService {
  private baseUrl = '/analytics';

  /**
   * Get complete dashboard analytics data
   */
  async getDashboardData(dateRange?: DateRange): Promise<{ success: boolean; data: AnalyticsDashboardData }> {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/dashboard`, { params });
    return response.data;
  }

  /**
   * Get revenue metrics only
   */
  async getRevenueMetrics(dateRange?: DateRange) {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/revenue`, { params });
    return response.data;
  }

  /**
   * Get order metrics only
   */
  async getOrderMetrics(dateRange?: DateRange) {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/orders`, { params });
    return response.data;
  }

  /**
   * Get customer metrics only
   */
  async getCustomerMetrics(dateRange?: DateRange) {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/customers`, { params });
    return response.data;
  }

  /**
   * Get product metrics only
   */
  async getProductMetrics(dateRange?: DateRange) {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/products`, { params });
    return response.data;
  }

  /**
   * Get voucher metrics only
   */
  async getVoucherMetrics(dateRange?: DateRange) {
    const params: any = {};
    
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    
    const response = await apiClient.get(`${this.baseUrl}/vouchers`, { params });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
