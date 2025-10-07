// Order Service - API calls for order management
// Synced with backend API structure

import { apiClient } from '@/shared/services/api';

// Types matching backend response structure
export interface OrderProduct {
  _id: string;
  po_id: string;
  pd_id: {
    _id: string;
    pd_id: string;
    pd_name: string;
    pd_price: number;
    pd_description?: string;
    br_id?: {
      _id: string;
      br_id: string;
      br_name: string;
    };
    pdt_id?: {
      _id: string;
      pdt_id: string;
      pdt_name: string;
    };
    category_id?: {
      _id: string;
      cg_id: string;
      cg_name: string;
    };
    images?: {
      _id: string;
      img: string;
      color?: string;
    }[];
  };
  po_quantity: number;
  po_price: number;
}

export interface Order {
  _id: string;
  od_id: string;
  customer_id?: {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
  customer_name: string;
  shipping_address: string;
  order_datetime: string;
  order_total: number;
  order_note?: string;
  po_id: OrderProduct | OrderProduct[];
  pm_id: {
    _id: string;
    pm_id: string;
    pm_name: string;
    pm_img?: string;
    pm_description?: string;
  };
  payment_status_id: {
    _id: string;
    ps_id: string;
    ps_name: string;
    ps_description?: string;
    color_code?: string;
  };
  voucher_id?: {
    _id: string;
    voucher_id: string;
    voucher_code: string;
    voucher_name: string;
    discount_percent: number;
    discount_amount?: number;
    max_discount_amount?: number;
  };
  order_info?: {
    _id: string;
    oi_id: string;
    of_state: string;
  };
  product_images?: Array<{
    _id: string;
    img: string;
    cloudinary_secure_url?: string;
    storage_type?: string;
  }>;
  // PayOS Integration fields
  payment_transaction_id?: string | null;
  payos_order_code?: number | null;
  ranking_discount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface CheckoutItem {
  _id?: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
}

export interface CheckoutRequest {
  customer_name: string;
  phone_number: string;
  email: string;
  shipping_address: string;
  payment_method_id: string;
  order_note?: string;
  voucher_code?: string;
  items: CheckoutItem[];
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    order: Order;
    productOrders: OrderProduct[];
    orderInfo: {
      _id: string;
      oi_id: string;
      od_id: string;
      of_state: string;
    };
    voucher?: {
      voucher_code: string;
      voucher_name: string;
      discount_applied: number;
    };
    summary: {
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
    };
  };
  message: string;
}

export interface VoucherValidationRequest {
  voucher_code: string;
  customer_id?: string;
  order_total?: number;
}

export interface VoucherValidationResponse {
  success: boolean;
  data: {
    voucher: {
      voucher_id: string;
      voucher_code: string;
      voucher_name: string;
      discount_percent: number;
      discount_amount: number;
      max_discount_amount: number;
      min_order_value: number;
      ranking_requirement: string | null;
    };
    discount_calculated: number;
    final_amount: number | null;
  };
  message: string;
}

class OrderService {
  private baseUrl = '/orders';

  /**
   * Get customer's orders - GET /api/v1/orders/my-orders
   */
  async getMyOrders(page: number = 1, limit: number = 10, search?: string): Promise<OrdersResponse> {
    try {
      const params: any = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/my-orders`, {
        params
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          orders: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        },
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  }

  /**
   * Get all orders (admin only) - GET /api/v1/orders
   */
  async getOrders(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer_id?: string;
    payment_status_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<OrdersResponse> {
    try {
      const response = await apiClient.get(this.baseUrl, {
        params: filters
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          orders: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        },
        message: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  }

  /**
   * Get order by ID - GET /api/v1/orders/:id
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${orderId}`);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  /**
   * Create order from cart - POST /api/v1/orders/checkout
   */
  async checkout(checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/checkout`, checkoutData);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Order created successfully'
      };
    } catch (error: any) {
      // Extract detailed error message
      let errorMessage = 'Checkout failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null as any,
        message: errorMessage
      };
    }
  }

  /**
   * Get orders by customer ID (admin only) - GET /api/v1/orders/customer/:customerId
   */
  async getOrdersByCustomer(customerId: string, page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/customer/${customerId}`, {
        params: { page, limit }
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          orders: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        },
        message: error.response?.data?.message || 'Failed to fetch customer orders'
      };
    }
  }

  /**
   * Validate voucher code - POST /api/v1/orders/validate-voucher
   */
  async validateVoucher(voucherData: VoucherValidationRequest): Promise<VoucherValidationResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validate-voucher`, voucherData);
      
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Voucher validation failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: {
          voucher: {
            voucher_id: '',
            voucher_code: '',
            voucher_name: '',
            discount_percent: 0,
            discount_amount: 0,
            max_discount_amount: 0,
            min_order_value: 0,
            ranking_requirement: null
          },
          discount_calculated: 0,
          final_amount: null
        },
        message: errorMessage
      };
    }
  }

  /**
   * Update order status (admin only) - PUT /api/v1/orders/:id/status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${orderId}/status`, {
        of_state: status
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
}

export const orderService = new OrderService();
