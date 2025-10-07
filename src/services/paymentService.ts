/**
 * Payment Service - PayOS Integration
 * Handles all payment-related API calls
 */

import axios, { AxiosError } from 'axios';
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentResponse,
  CancelPaymentRequest,
  CancelPaymentResponse,
  TransactionListResponse,
  TransactionDetailResponse,
  GetTransactionsParams,
  APIError,
} from '@/types/payment.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Payment Service Class
 */
class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/payments`;
  }

  /**
   * Get auth token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try multiple token keys used in the app
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('auth-token') || 
           localStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           null;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders() {
    const token = this.getAuthToken();
    
    if (!token) {
      console.warn('⚠️ No auth token found in localStorage');
    } else {
      console.log('✅ Auth token found:', token.substring(0, 20) + '...');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<APIError>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An error occurred';
      const errorCode = axiosError.response?.data?.error?.code;
      
      console.error('❌ Payment API Error:', {
        message: errorMessage,
        code: errorCode,
        status: axiosError.response?.status,
      });

      throw new Error(errorMessage);
    }
    
    throw new Error('An unexpected error occurred');
  }

  /**
   * Create PayOS Payment Link
   * POST /api/v1/payments/payos/create
   */
  async createPayOSPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      console.log('📤 Creating PayOS payment:', {
        orderId: data.order_id,
        amount: data.amount,
      });

      const response = await axios.post<CreatePaymentResponse>(
        `${this.baseURL}/payos/create`,
        data,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true, // Send cookies with request
        }
      );

      console.log('✅ Payment created:', {
        transactionId: response.data.data.transaction_id,
        orderCode: response.data.data.payos_order_code,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Verify Payment Status
   * GET /api/v1/payments/payos/verify/:orderCode
   */
  async verifyPayment(orderCode: number): Promise<VerifyPaymentResponse> {
    try {
      console.log('🔍 Verifying payment:', orderCode);

      const response = await axios.get<VerifyPaymentResponse>(
        `${this.baseURL}/payos/verify/${orderCode}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('✅ Payment verified:', {
        status: response.data.data.status,
        payosStatus: response.data.data.payos_status,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Cancel Payment
   * POST /api/v1/payments/payos/cancel/:orderCode
   */
  async cancelPayment(
    orderCode: number,
    data?: CancelPaymentRequest
  ): Promise<CancelPaymentResponse> {
    try {
      console.log('🚫 Cancelling payment:', orderCode);

      const response = await axios.post<CancelPaymentResponse>(
        `${this.baseURL}/payos/cancel/${orderCode}`,
        data || { cancellationReason: 'Customer cancelled payment' },
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('✅ Payment cancelled');

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get Transaction History
   * GET /api/v1/payments/transactions
   */
  async getTransactions(params?: GetTransactionsParams): Promise<TransactionListResponse> {
    try {
      console.log('📋 Fetching transactions:', params);

      const response = await axios.get<TransactionListResponse>(
        `${this.baseURL}/transactions`,
        {
          params,
          headers: this.getAuthHeaders(),
        }
      );

      console.log('✅ Transactions fetched:', response.data.data.pagination);

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get Transaction by ID
   * GET /api/v1/payments/transactions/:id
   */
  async getTransactionById(id: string): Promise<TransactionDetailResponse> {
    try {
      console.log('🔍 Fetching transaction:', id);

      const response = await axios.get<TransactionDetailResponse>(
        `${this.baseURL}/transactions/${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('✅ Transaction fetched');

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Poll Payment Status (for real-time updates)
   * Polls every 3 seconds until payment is completed/cancelled/failed
   */
  async pollPaymentStatus(
    orderCode: number,
    onUpdate: (response: VerifyPaymentResponse) => void,
    interval: number = 3000
  ): Promise<() => void> {
    let isPolling = true;
    let pollCount = 0;
    const maxPolls = 200; // 10 minutes (200 * 3s)

    const poll = async () => {
      if (!isPolling || pollCount >= maxPolls) {
        console.log('⏹️ Stopped polling payment status');
        return;
      }

      try {
        const response = await this.verifyPayment(orderCode);
        onUpdate(response);

        pollCount++;

        // Stop polling if payment is completed, cancelled, or failed
        const finalStatuses = ['COMPLETED', 'CANCELLED', 'FAILED'];
        if (finalStatuses.includes(response.data.status)) {
          isPolling = false;
          console.log('✅ Payment reached final status:', response.data.status);
          return;
        }

        // Continue polling
        if (isPolling) {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('❌ Error polling payment status:', error);
        // Continue polling even on error
        if (isPolling) {
          setTimeout(poll, interval);
        }
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
      console.log('🛑 Payment status polling stopped manually');
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
