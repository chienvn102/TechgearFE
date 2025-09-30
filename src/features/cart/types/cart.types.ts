// Cart Types theo MongoDB schema từ README_MongoDB.md
// Tuân thủ nghiêm ngặt theo backend field names

import { Product } from '@/lib/api';

// 🛒 Cart Types từ Backend API

/**
 * Cart Item từ backend response
 */
export interface BackendCartItem {
  _id: string;
  product_id: {
    _id: string;
    pd_name: string;
    pd_price: number;
    pd_quantity?: number;
    br_id?: {
      _id: string;
      br_name: string;
    };
    category_id?: {
      _id: string;
      cg_name: string;
    };
  };
  quantity: number;
  price: number;
  added_at: string;
}

/**
 * Cart từ backend response
 */
export interface Cart {
  _id: string;
  customer_id: string;
  items: BackendCartItem[];
  total_amount: number;
  total_items: number;
  updated_at: string;
  __v: number;
}

/**
 * Add to Cart Request
 */
export interface AddToCartRequest {
  customer_id: string;
  product_id: string;
  quantity: number;
}

/**
 * Update Cart Request
 */
export interface UpdateCartRequest {
  customer_id: string;
  product_id: string;
  quantity: number;
}

/**
 * Remove from Cart Request
 */
export interface RemoveFromCartRequest {
  customer_id: string;
  product_id: string;
}

// 🛒 Frontend Cart Item Type - Local state
export interface CartItem {
  product: Product;  // Real product từ backend
  quantity: number;
  selected?: boolean; // Để chọn items khi checkout
  addedAt: Date;
}

// 📦 Order Types theo đúng MongoDB schema
export interface CreateOrderRequest {
  // order collection fields
  customer_id: string;
  customer_name: string;
  shipping_address: string;
  order_note?: string;
  voucher_id?: string | null;
  pm_id: string; // payment_method ID
  order_total: number;
  
  // product_order collection - items in order
  products: {
    pd_id: string;
    po_quantity: number;
    po_price: number;
  }[];
}

export interface Order {
  _id: string;
  od_id: string;
  po_id: string;
  customer_id: string;
  customer_name: string;
  shipping_address: string;
  order_datetime: string;
  pm_id: string;
  order_note?: string;
  voucher_id?: string | null;
  payment_status_id: string;
  order_total: number;
  created_at: string;
}

// 🏠 Customer Address Type theo schema
export interface CustomerAddress {
  _id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  address: string;
  is_default: boolean;
  created_at: string;
}

// 💳 Payment Method Type theo schema
export interface PaymentMethod {
  _id: string;
  pm_id: string;
  pm_name: string;
  pm_description: string;
  is_active: boolean;
  created_at: string;
}

// 🎟️ Voucher Type theo schema
export interface Voucher {
  _id: string;
  voucher_id: string;
  voucher_name: string;
  voucher_description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// 🛒 Cart State Type cho Redux
export interface CartState {
  items: CartItem[];
  total: number;
  itemsCount: number;
  loading: boolean;
  error: string | null;
  
  // Checkout related
  selectedAddress: CustomerAddress | null;
  selectedPaymentMethod: PaymentMethod | null;
  selectedVoucher: Voucher | null;
  orderNote: string;
  
  // UI state
  isOpen: boolean; // Cart drawer open/close
  checkoutStep: 'cart' | 'address' | 'payment' | 'confirmation';
}

// 📊 Cart Summary Type
export interface CartSummary {
  subtotal: number;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  itemsCount: number;
}

// 🔄 Cart Action Types cho hooks
export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleItemSelection: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Checkout actions
  setSelectedAddress: (address: CustomerAddress) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  setSelectedVoucher: (voucher: Voucher | null) => void;
  setOrderNote: (note: string) => void;
  proceedToCheckout: () => Promise<void>;
}

// 📝 Order Summary for checkout confirmation
export interface OrderSummary extends CartSummary {
  items: CartItem[];
  shippingAddress: CustomerAddress;
  paymentMethod: PaymentMethod;
  voucher?: Voucher;
  orderNote?: string;
}

export default CartItem;
