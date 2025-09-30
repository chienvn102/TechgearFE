// Global type definitions

export interface User {
  _id: string;
  id: string;
  username: string;
  name: string;
  role_id: string | {
    _id: string;
    role_id: string;
    role_name: string;
  };
  role?: {
    role_id: string;
    role_name: string;
  };
  customer_id?: {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  phone_number: string;
}

export interface Product {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_description?: string;
  pd_note?: string;
  sku: string;
  br_id?: {
    _id: string;
    br_id: string;
    br_name: string;
  };
  cg_id?: {
    _id: string;
    cg_id: string;
    cg_name: string;
  };
  pdt_id?: {
    _id: string;
    pdt_id: string;
    pdt_name: string;
  };
  player_id?: {
    _id: string;
    player_id: string;
    player_name: string;
  };
  images?: ProductImage[];
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  _id: string;
  img_id: string;
  pd_id: string;
  img: string;
  color: string;
  is_primary: boolean;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
}

export interface Order {
  _id: string;
  od_id: string;
  po_id: string | ProductOrder[];
  customer_id: string | {
    _id: string;
    customer_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
  customer_name: string;
  shipping_address: string;
  order_datetime: string;
  pm_id: string;
  order_note?: string;
  voucher_id?: string;
  payment_status_id: string | {
    _id: string;
    ps_id: string;
    ps_name: string;
    ps_description: string;
  };
  order_total: number;
  product_orders?: ProductOrder[];
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  order_info?: {
    _id: string;
    oi_id: string;
    od_id: string;
    of_state: string;
  };
}

export interface ProductOrder {
  _id: string;
  po_id: string;
  pd_id: string;
  po_quantity: number;
  po_price: number;
  product?: Product;
}

export interface PaymentMethod {
  _id: string;
  pm_id: string;
  pm_name: string;
  pm_img?: string;
}

export interface PaymentStatus {
  _id: string;
  ps_id: string;
  ps_name: string;
  ps_description?: string;
}

export interface Voucher {
  _id: string;
  voucher_id: string;
  voucher_code: string;
  voucher_name: string;
  discount_percent: number;
  discount_amount?: number;
  max_discount_amount?: number;
  min_order_value: number;
  max_uses: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  ranking_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerAddress {
  _id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  address: string;
}

export interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  br_description?: string;
  br_img?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
}

export interface Category {
  _id: string;
  cg_id: string;
  cg_name: string;
  cg_description?: string;
  cg_img?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
}

export interface ProductType {
  _id: string;
  pdt_id: string;
  pdt_name: string;
  pdt_description?: string;
  pdt_img?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
}

export interface Player {
  _id: string;
  player_id: string;
  player_name: string;
  player_content?: string;
  player_img?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
}

export interface Post {
  _id: string;
  post_id: string;
  post_title: string;
  post_content: string;
  post_img?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  _id: string;
  banner_id: string;
  banner_title: string;
  banner_content?: string;
  banner_img?: string;
  pd_id?: string;
  product?: Product;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  _id: string;
  noti_id: string;
  customer_id: string;
  noti_type: string;
  noti_title: string;
  noti_content: string;
  created_at: string;
}

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CheckoutFormData {
  customer_name: string;
  phone_number: string;
  email: string;
  shipping_address: string;
  order_note?: string;
  payment_method_id: string;
  voucher_id?: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  phone_number: string;
  email: string;
  shipping_address: string;
  order_note?: string;
  payment_method_id: string;
  voucher_id?: string;
  items: OrderItem[];
}

export interface OrderItem {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
  img?: string;
  color?: string;
  brand?: string;
}

export interface ProductOrder {
  _id: string;
  po_id: string;
  pd_id: string | {
    _id: string;
    pd_id: string;
    pd_name: string;
    pd_price: number;
    br_id?: string | {
      _id: string;
      br_id: string;
      br_name: string;
    };
    images?: ProductImage[];
  };
  po_quantity: number;
  po_price: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    order: {
      _id: string;
      od_id: string;
      customer_name: string;
      shipping_address: string;
      order_datetime: string;
      order_total: number;
      payment_status_id: string;
    };
    product_orders: Array<{
      _id: string;
      po_id: string;
      pd_id: string;
      po_quantity: number;
      po_price: number;
    }>;
  };
}