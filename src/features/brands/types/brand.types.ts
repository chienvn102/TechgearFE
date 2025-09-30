// 🏷️ BRAND TYPES - Tuân thủ nghiêm ngặt MongoDB Schema

export interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  br_img?: string;
  br_note?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  __v?: number;
  
  // Compatibility fields
  brand_id?: string;
  brand_name?: string;
}

export interface CreateBrandData {
  br_id: string;
  br_name: string;
  br_img?: string;
  br_note?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  _id?: string;
}

export interface BrandListResponse {
  brands: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BrandResponse {
  brand: Brand;
}

export interface BrandFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}
