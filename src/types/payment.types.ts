/**
 * Payment Types & Interfaces for PayOS Integration
 * Backend API: /api/v1/payments/*
 */

// ==================== ENUMS ====================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum PaymentMethodType {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYOS = 'PAYOS',
}

export enum PayOSStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// ==================== INTERFACES ====================

/**
 * Payment Method
 */
export interface PaymentMethod {
  _id: string;
  pm_id: string;
  pm_name: string;
  pm_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction Item
 */
export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

/**
 * Buyer Info
 */
export interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
}

/**
 * PayOS Transaction (from PayOS API)
 */
export interface PayOSTransaction {
  reference: string;
  amount: number;
  accountNumber: string;
  description: string;
  transactionDateTime: string;
  counterAccountBankId: string;
  counterAccountBankName: string | null;
  counterAccountName: string | null;
  counterAccountNumber: string;
  virtualAccountName: string | null;
  virtualAccountNumber: string | null;
}

/**
 * Payment Link Response (from PayOS)
 */
export interface PaymentLink {
  bin?: string;
  accountNumber?: string;
  accountName?: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

/**
 * Transaction Model (Database)
 */
export interface Transaction {
  _id: string;
  transaction_id: string;
  order_id: {
    _id: string;
    order_id?: string;
    od_id?: string;
    total_payment?: number;
  } | string;
  customer_id: string;
  payment_method_id: {
    _id: string;
    pm_name: string;
  } | string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payos_order_code?: number;
  payos_payment_link_id?: string;
  description?: string;
  buyer_info?: BuyerInfo;
  items?: TransactionItem[];
  payment_link_url?: string;
  qr_code_url?: string;
  error_message?: string;
  cancellation_reason?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== REQUEST TYPES ====================

/**
 * Create Payment Request
 */
export interface CreatePaymentRequest {
  order_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

/**
 * Cancel Payment Request
 */
export interface CancelPaymentRequest {
  cancellationReason?: string;
}

/**
 * Get Transactions Request (Query Params)
 */
export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

// ==================== RESPONSE TYPES ====================

/**
 * Create Payment Response
 */
export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    transaction_id: string;
    order_id: string;
    payos_order_code: number;
    amount: number;
    payment_link: string;
    qr_code: string;
    status: PaymentStatus;
    created_at: string;
  };
}

/**
 * Payment Info from PayOS
 */
export interface PayOSPaymentInfo {
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: PayOSStatus;
  description?: string;
  transactions: PayOSTransaction[];
  createdAt: string;
  cancellationReason?: string | null;
}

/**
 * Verify Payment Response
 */
export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    transaction_id: string;
    order_id: string;
    status: PaymentStatus;
    amount: number;
    payos_status: PayOSStatus;
    completed_at?: string;
    payment_info: PayOSPaymentInfo;
  };
}

/**
 * Cancel Payment Response
 */
export interface CancelPaymentResponse {
  success: boolean;
  message: string;
  data: {
    transaction_id: string;
    status: PaymentStatus;
    cancelled_at: string;
    cancellation_reason: string;
  };
}

/**
 * Transaction List Response
 */
export interface TransactionListResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Transaction Detail Response
 */
export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: Transaction;
}

// ==================== UI STATE TYPES ====================

/**
 * Payment Dialog State
 */
export interface PaymentDialogState {
  isOpen: boolean;
  isLoading: boolean;
  isPaying: boolean;
  isPolling: boolean;
  paymentData: CreatePaymentResponse['data'] | null;
  error: string | null;
  countdown: number; // seconds remaining
}

/**
 * Payment Status Poll Result
 */
export interface PaymentPollResult {
  isPaid: boolean;
  isCancelled: boolean;
  isFailed: boolean;
  status: PayOSStatus;
  paymentInfo: PayOSPaymentInfo | null;
}

// ==================== UTILITY TYPES ====================

/**
 * API Error Response
 */
export interface APIError {
  success: false;
  message: string;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Payment Method Option (for UI)
 */
export interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
  type: PaymentMethodType;
  icon?: string;
  isActive: boolean;
}

// ==================== TYPE GUARDS ====================

export const isPayOSMethod = (methodId: string): boolean => {
  // PayOS payment method ID from database
  return methodId === '68e4e09c7b98c7c405270022';
};

export const isTransactionCompleted = (transaction: Transaction): boolean => {
  return transaction.status === PaymentStatus.COMPLETED;
};

export const isPaymentPaid = (status: PayOSStatus): boolean => {
  return status === PayOSStatus.PAID;
};

// ==================== CONSTANTS ====================

export const PAYMENT_POLL_INTERVAL = 3000; // 3 seconds
export const PAYMENT_TIMEOUT = 600000; // 10 minutes
export const PAYOS_PAYMENT_METHOD_ID = '68e4e09c7b98c7c405270022';
