/**
 * Product Types - Aligned with MongoDB Backend Schema
 * These types match the actual database collections and API responses
 */

// Base ObjectId type
export type ObjectId = string;

// Product Image interface - Match với MongoDB schema
export interface ProductImage {
  _id: ObjectId;
  pd_id: ObjectId;
  img: string;
  color: string;
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  cloudinary_secure_url?: string;
  storage_type?: string;
  is_primary?: boolean;
  img_metadata?: {
    sizes?: {
      thumbnail?: string;
      medium?: string;
      large?: string;
    };
    processed_at?: string;
  };
  __v?: number;
}

// Brand reference type (can be populated or just ID)
export interface Brand {
  _id: ObjectId;
  br_name: string;
  br_image?: string;
  br_description?: string;
}

// Category reference type (can be populated or just ID)
export interface Category {
  _id: ObjectId;
  cg_name: string;
  cg_description?: string;
  cg_image?: string;
}

// Player reference type (can be populated or just ID)
export interface Player {
  _id: ObjectId;
  player_name: string;
  team_name?: string;
  player_image?: string;
  player_number?: number;
  position?: string;
}

// Main Product interface - Match với backend MongoDB schema
export interface Product {
  _id: ObjectId;
  pd_id: string; // Product code từ backend
  pd_name: string;
  pd_price: number;
  pd_sale_price?: number;
  pd_quantity: number;
  pd_sold?: number;
  pd_description?: string;
  pd_note?: string;
  is_available: boolean;
  color?: string;
  sku?: string;
  
  // Images array - ProductImage objects từ API
  images?: ProductImage[];
  
  // References (có thể là ObjectId hoặc populated objects)
  br_id?: ObjectId | Brand;
  category_id?: ObjectId | Category;
  pdt_id?: ObjectId; // Product type ID
  player_id?: ObjectId | Player;
  
  // Metadata
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Product creation/update types
export interface CreateProductRequest {
  pd_name: string;
  pd_price: number;
  pd_sale_price?: number;
  pd_quantity: number;
  pd_description?: string;
  brand_id: ObjectId;
  category_id: ObjectId;
  player_id?: ObjectId;
  product_images: ProductImage[];
}

// Admin product creation with simplified structure
export interface CreateProductData {
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  pd_description?: string;
  pd_note?: string;
  is_available: boolean;
  color?: string;
  sku?: string;
  images?: ProductImage[]; // ProductImage objects
}

// Image upload response from Cloudinary
export interface ImageUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  pd_status?: 'active' | 'inactive';
}

// Product filters for API queries
export interface ProductFilters {
  category_id?: ObjectId;
  brand_id?: ObjectId;
  player_id?: ObjectId;
  min_price?: number;
  max_price?: number;
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  sort_by?: 'pd_name' | 'pd_price' | 'pd_sold' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// API Response types
export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

// Cart related types
export interface CartItem {
  product_id: ObjectId | Product;
  quantity: number;
  price: number;
  total: number;
}

export interface AddToCartRequest {
  product_id: ObjectId;
  quantity: number;
}

// Wishlist types
export interface WishlistItem {
  product_id: ObjectId | Product;
  added_at: Date;
}

// Product variant types for different use cases
export type ProductCardVariant = 'customer' | 'admin';
export type ProductDisplayMode = 'grid' | 'list' | 'detailed';

// Search and recommendation types
export interface ProductSearchResult extends Product {
  relevance_score?: number;
  match_fields?: string[];
}

export interface ProductRecommendation {
  product: Product;
  reason: 'similar' | 'popular' | 'viewed_together' | 'category_match';
  score: number;
}
