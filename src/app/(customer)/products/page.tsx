'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { ProductCard } from '@/features/products/components/ProductCard';
import { productService } from '@/features/products/services/productService';
import { brandService } from '@/features/brands/services/brandService';
import { categoryService } from '@/features/categories/services/categoryService';
import { productTypeService } from '@/features/product-types/services/productTypeService';
import { playerService } from '@/features/players/services/playerService';
import { Product, Brand, Category, ProductType, Player } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { useCart } from '@/contexts/CartContext';

interface ProductFilters {
  search?: string;
  br_id?: string; // Backend expects br_id, not brand_id
  category_id?: string;
  pdt_id?: string; // Backend expects pdt_id, not product_type_id
  player_id?: string; // Filter by player
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sort_by: 'created_at_desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, brandsRes, categoriesRes, productTypesRes, playersRes] = await Promise.all([
        productService.getProducts(filters),
        brandService.getBrands(),
        categoryService.getCategories(),
        productTypeService.getProductTypes(),
        playerService.getPlayers()
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data.products || []);
      }
      if (brandsRes.success) {
        setBrands(brandsRes.data.brands || []);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data.categories || []);
      }
      if (productTypesRes.success) {
        setProductTypes(productTypesRes.data.productTypes || []);
      }
      if (playersRes.success) {
        setPlayers(playersRes.data.players || []);
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(filters);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    // Ensure min <= max
    const [min, max] = newRange[0] <= newRange[1] ? newRange : [newRange[1], newRange[0]];
    setPriceRange([min, max]);
    setFilters(prev => ({
      ...prev,
      min_price: min,
      max_price: max,
      page: 1
    }));
  };

  const handleInStockToggle = () => {
    const newValue = !inStockOnly;
    setInStockOnly(newValue);
    setFilters(prev => ({
      ...prev,
      in_stock_only: newValue,
      page: 1
    }));
  };

  const clearFilters = () => {
    // Reset all filter states
    setFilters({
      page: 1,
      limit: 12,
      sort_by: 'created_at_desc'
    });
    setPriceRange([0, 10000000]);
    setInStockOnly(false);
    
    // Clear URL search params
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
    
    };

  const handleAddToCart = async (productId: string) => {
    setCartLoading(productId);
    try {
      const product = products.find(p => p._id === productId);
      if (product) {
        addItem({
          _id: product._id,
          pd_id: product.pd_id,
          pd_name: product.pd_name,
          pd_price: product.pd_price,
          img: product.images?.[0]?.img,
          color: product.images?.[0]?.color,
          brand: product.br_id?.br_name
        });
        openCart(); // Mở cart dialog sau khi thêm
      }
    } catch (error) {
      alert('Lỗi khi thêm vào giỏ hàng');
    } finally {
      setCartLoading(null);
    }
  };

  const handleToggleWishlist = (productId: string) => {
    alert(`Đã thêm/bỏ sản phẩm khỏi danh sách yêu thích!`);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* In Stock Only */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleInStockToggle}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chỉ hiển thị còn hàng</span>
                </label>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Giá</h3>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Từ"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Đến"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="relative h-2 bg-gray-200 rounded-lg">
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="100000"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRange[1]])}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                        style={{ zIndex: priceRange[0] > priceRange[1] - 100000 ? 5 : 3 }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="100000"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange([priceRange[0], Number(e.target.value)])}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                  </div>
                </div>
      </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Thương hiệu</h3>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filters.br_id || ''}
                  onChange={(e) => handleFilterChange('br_id', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.br_name}
                    </option>
                  ))}
                </select>
      </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Danh mục</h3>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) => handleFilterChange('category_id', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.cg_name}
                    </option>
                  ))}
                </select>
        </div>

              {/* Product Type Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Loại sản phẩm</h3>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
                <select
                  value={filters.pdt_id || ''}
                  onChange={(e) => handleFilterChange('pdt_id', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tất cả loại</option>
                  {productTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.pdt_name}
                    </option>
                  ))}
                </select>
        </div>

              {/* Player Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Tuyển thủ</h3>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
                <select
                  value={filters.player_id || ''}
                  onChange={(e) => handleFilterChange('player_id', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tất cả tuyển thủ</option>
                  {players.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.player_name}
                    </option>
                  ))}
                </select>
        </div>

              {/* Reset Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Đặt lại bộ lọc</span>
                </button>
          </div>
        </div>
      </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Only - Remove duplicate search */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                  <select
                    value={filters.sort_by || 'created_at_desc'}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at_desc">Ngày, mới nhất</option>
                    <option value="created_at_asc">Ngày, cũ nhất</option>
                    <option value="price_asc">Giá, thấp đến cao</option>
                    <option value="price_desc">Giá, cao đến thấp</option>
                    <option value="name_asc">Tên, A đến Z</option>
                    <option value="name_desc">Tên, Z đến A</option>
                  </select>
                </div>
              </div>
        </div>
        
            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải sản phẩm...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Không tìm thấy sản phẩm</div>
                <p className="text-gray-400 mt-2">Hãy thử điều chỉnh bộ lọc của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
            <ProductCard
              product={product}
              variant="customer"
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
                      onProductClick={handleProductClick}
              loading={cartLoading === product._id}
              isInWishlist={false}
            />
                  </motion.div>
          ))}
        </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                    disabled={!filters.page || filters.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Trang {filters.page || 1}
          </span>
                  
                  <button
                    onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

      {/* Footer */}
      <Footer />
      
      {/* Custom CSS for dual range slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      </div>
  );
}