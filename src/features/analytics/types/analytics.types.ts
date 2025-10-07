// types/analytics.types.ts
// TypeScript interfaces for Analytics Dashboard

export interface RevenueMetrics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  inRange: number;
  averageOrderValue: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  timeline: TimelineDataPoint[];
  byPaymentMethod: PaymentMethodRevenue[];
}

export interface TimelineDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodRevenue {
  method: string;
  revenue: number;
  count: number;
}

export interface OrderMetrics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  inRange: number;
  byStatus: {
    PENDING: number;
    CONFIRMED: number;
    SHIPPING: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  completionRate: number;
  cancellationRate: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  timeline: TimelineDataPoint[];
  topProducts: TopProduct[];
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  brand_name?: string;
  quantity: number;
  revenue: number;
  stock?: number;
}

export interface CustomerMetrics {
  total: number;
  active: number;
  byRanking: {
    BRONZE: { name: string; count: number };
    SILVER: { name: string; count: number };
    GOLD: { name: string; count: number };
    PLATINUM: { name: string; count: number };
  };
  topCustomers: TopCustomer[];
  averageOrdersPerCustomer: number;
  repeatCustomerRate: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface TopCustomer {
  customer_name: string;
  customer_email: string;
  totalSpent: number;
  orderCount: number;
  ranking?: string;
}

export interface ProductMetrics {
  total: number;
  active: number;
  outOfStock: number;
  lowStock: number;
  byCategory: CategoryData[];
  byBrand: BrandData[];
  averageRating: number;
  totalReviews: number;
  topPerforming: TopPerformingProduct[];
  lowPerforming: LowPerformingProduct[];
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface BrandData {
  brand: string;
  count: number;
}

export interface TopPerformingProduct {
  product_id: string;
  product_name: string;
  sales: number;
  revenue: number;
  rating: number;
  reviewCount: number;
}

export interface LowPerformingProduct {
  pd_id: string;
  pd_name: string;
  pd_quantity: number;
  sales: number;
  created_at: string;
}

export interface VoucherMetrics {
  total: number;
  active: number;
  expired: number;
  totalUsage: number;
  totalDiscount: number;
  averageDiscountPerOrder: number;
  voucherROI: number;
  topVouchers: TopVoucher[];
}

export interface TopVoucher {
  voucher_code: string;
  voucher_name: string;
  usage_count: number;
  total_discount: number;
}

export interface AnalyticsDashboardData {
  revenue: RevenueMetrics;
  orders: OrderMetrics;
  customers: CustomerMetrics;
  products: ProductMetrics;
  vouchers: VoucherMetrics;
  dateRange: {
    start: Date;
    end: Date;
  };
  lastUpdated: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}
