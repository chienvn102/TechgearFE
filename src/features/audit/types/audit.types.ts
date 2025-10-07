// Audit Trail Types

export interface AuditTrail {
  _id: string;
  audit_id: string;
  user_id?: {
    _id: string;
    username: string;
    name: string;
    role_id?: {
      _id: string;
      role_name: string;
    };
  } | string | null;
  customer_user_id?: {
    _id: string;
    username: string;
    customer_id?: {
      _id: string;
      name: string;
      email: string;
    };
  } | string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  old_value?: string;
  created_at: string;
}

export interface AuditTrailFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  table_name?: string;
  start_date?: string;
  end_date?: string;
  role?: string;
  search?: string;
}

export interface AuditTrailResponse {
  success: boolean;
  data: {
    auditTrails: AuditTrail[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AuditTrailStats {
  total: number;
  today: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  by_user: {
    username: string;
    count: number;
  }[];
  by_table: {
    table_name: string;
    count: number;
  }[];
}
