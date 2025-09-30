// 📋 PRODUCT TYPES - TypeScript Definitions
// Tuân thủ nghiêm ngặt README_MongoDB.md schema

export interface Product {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_note?: string;
  pd_day_updated: string;
  br_id: string | Brand;
  pdt_id: string | ProductType;
  category_id: string | Category;
  player_id?: string | Player | null;
  product_description?: string;
  stock_quantity: number;
  is_available: boolean;
  color: string;
  sku: string;
  created_at: string;
  images?: ProductImage[];
}

export interface Brand {
  _id: string;
  br_id: string;
  br_name: string;
  br_img?: string;
  brand_description?: string;
  website_url?: string;
  is_active: boolean;
}

export interface ProductType {
  _id: string;
  pdt_id: string;
  pdt_name: string;
  pdt_img?: string;
  pdt_note?: string;
}

export interface Category {
  _id: string;
  cg_id: string;
  cg_name: string;
  category_description?: string;
}

export interface Player {
  _id: string;
  player_id: string;
  player_name: string;
  player_img?: string;
  player_content?: string;
  achievements?: string;
  team_name?: string;
  position?: string;
}

export interface ProductImage {
  _id: string;
  pd_id: string;
  img: string; // Backend sử dụng field 'img' thay vì 'img_url'
  color: string;
  is_primary: boolean;
  created_at: string;
  // Cloudinary fields (optional)
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  cloudinary_secure_url?: string;
  storage_type?: 'local' | 'cloudinary';
}

export interface CreateProductData {
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_note?: string;
  br_id: string;
  pdt_id: string;
  category_id: string;
  player_id?: string | null;
  product_description?: string;
  stock_quantity: number;
  is_available?: boolean;
  color: string;
  sku: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  br_id?: string;
  pdt_id?: string;
  category_id?: string;
  player_id?: string;
  color?: string;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
    images?: ProductImage[];
  };
}

export interface ProductImagesResponse {
  success: boolean;
  data: {
    images: ProductImage[];
  };
}

// SKU Generation Helper Types
export interface SKUGenerationData {
  categoryCode: string;
  brandCode: string;
  sequentialNumber: number;
}

export interface ProductFormData {
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_note: string;
  br_id: string;
  pdt_id: string;
  category_id: string;
  player_id: string;
  product_description: string;
  stock_quantity: number;
  is_available: boolean;
  color: string;
}