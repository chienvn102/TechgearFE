// Cart Service Layer - API integration cho cart functionality  
// Tuân thủ nghiêm ngặt theo backend Cart APIs

import { apiClient } from '@/lib/api';
import type { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartRequest, 
  RemoveFromCartRequest,
  CreateOrderRequest, 
  Order, 
  CustomerAddress, 
  PaymentMethod, 
  Voucher 
} from '../types/cart.types';
import type { ApiResponse } from '@/lib/api';

/**
 * Cart Service Class
 * Handles cart and order operations với backend APIs
 */
class CartService {
  
  // 🛒 CART OPERATIONS
  
  /**
   * GET CART - GET /api/v1/cart/:customerId
   */
  async getCart(customerId: string): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.get(`/cart/${customerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get cart');
    }
  }

  /**
   * ADD TO CART - POST /api/v1/cart
   */
  async addToCart(data: AddToCartRequest): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.post('/cart', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add to cart');
    }
  }

  /**
   * UPDATE CART ITEM - PUT /api/v1/cart
   */
  async updateCartItem(data: UpdateCartRequest): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.put('/cart', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update cart');
    }
  }

  /**
   * REMOVE FROM CART - DELETE /api/v1/cart
   */
  async removeFromCart(data: RemoveFromCartRequest): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.delete('/cart', { data });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove from cart');
    }
  }

  /**
   * CLEAR CART - DELETE /api/v1/cart/:customerId/clear
   */
  async clearCart(customerId: string): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.delete(`/cart/${customerId}/clear`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  }

  /**
   * GET CART COUNT - GET /api/v1/cart/:customerId/count
   */
  async getCartCount(customerId: string): Promise<ApiResponse<{ count: number; total_items: number }>> {
    try {
      const response = await apiClient.get(`/cart/${customerId}/count`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get cart count');
    }
  }
  
  // 📦 ORDER OPERATIONS
  
  // 📦 CREATE ORDER - POST /api/v1/orders
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }
  
  // 📋 GET MY ORDERS - GET /api/v1/orders/my-orders
  async getMyOrders(params?: { 
    page?: number; 
    limit?: number; 
  }): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> {
    try {
      const response = await apiClient.get('/orders/my-orders', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
  
  // 🏠 GET MY ADDRESSES - GET /api/v1/customer-addresses/my-addresses
  async getMyAddresses(): Promise<ApiResponse<{ addresses: CustomerAddress[] }>> {
    try {
      const response = await apiClient.get('/customer-addresses/my-addresses');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
  
  // 🏠 CREATE ADDRESS - POST /api/v1/customer-addresses
  async createAddress(addressData: {
    name: string;
    phone_number: string;
    address: string;
    is_default?: boolean;
  }): Promise<ApiResponse<CustomerAddress>> {
    try {
      const response = await apiClient.post('/customer-addresses', addressData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create address');
    }
  }
  
  // 💳 GET PAYMENT METHODS - GET /api/v1/payment-methods
  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> {
    try {
      const response = await apiClient.get('/payment-methods');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
  
  // 🎟️ GET AVAILABLE VOUCHERS - GET /api/v1/vouchers
  async getAvailableVouchers(): Promise<ApiResponse<{ vouchers: Voucher[] }>> {
    try {
      const response = await apiClient.get('/vouchers', {
        params: { available: true } // Filter cho vouchers còn hiệu lực
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vouchers');
    }
  }
  
  // 🎟️ APPLY VOUCHER - POST /api/v1/voucher-usage
  async applyVoucher(voucherId: string, orderTotal: number): Promise<ApiResponse<{
    voucher: Voucher;
    discountAmount: number;
    finalTotal: number;
  }>> {
    try {
      const response = await apiClient.post('/voucher-usage', {
        voucher_id: voucherId,
        order_total: orderTotal
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to apply voucher');
    }
  }
  
  // 📊 VALIDATE ORDER - Kiểm tra order trước khi submit
  async validateOrder(orderData: CreateOrderRequest): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }>> {
    try {
      const response = await apiClient.post('/orders/validate', orderData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate order');
    }
  }
  
  // 📦 GET ORDER BY ID - GET /api/v1/orders/:id
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
  
  // 🔄 UPDATE ORDER STATUS (if needed for customer cancellation)
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.put(`/orders/${orderId}/cancel`, {
        cancellation_reason: reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }
}

// 🚀 Export singleton instance
export const cartService = new CartService();
export default cartService;
