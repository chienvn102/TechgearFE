import { apiClient } from '@/shared/services/api';
import { AuditTrail, AuditTrailFilters, AuditTrailResponse } from '../types/audit.types';

class AuditTrailService {
  private baseUrl = '/audit-trail';

  /**
   * Get all audit trails with filters
   */
  async getAuditTrails(filters?: AuditTrailFilters): Promise<AuditTrailResponse> {
    try {
      // Clean up filters - remove 'all' values
      const cleanFilters: any = { ...filters };
      if (cleanFilters.action === 'all') delete cleanFilters.action;
      if (cleanFilters.table_name === 'all') delete cleanFilters.table_name;
      if (cleanFilters.role === 'all') delete cleanFilters.role;
      
      const response = await apiClient.get(this.baseUrl, { params: cleanFilters });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit trails:', error);
      throw error;
    }
  }

  /**
   * Get audit trail by ID
   */
  async getAuditTrailById(id: string): Promise<{ success: boolean; data: { auditTrail: AuditTrail } }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit trail statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Export audit trails to CSV
   */
  async exportToCSV(filters?: AuditTrailFilters): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting audit trails:', error);
      throw error;
    }
  }
}

export const auditTrailService = new AuditTrailService();
