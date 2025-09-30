'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  pd_quantity: number;
  is_available: boolean;
  br_id?: {
    _id: string;
    br_name: string;
  } | string;
  pdt_id?: {
    _id: string;
    pdt_name: string;
  } | string;
  category_id?: {
    _id: string;
    cg_name: string;
  } | string;
}

interface Brand {
  _id: string;
  br_name: string;
}

interface ProductType {
  _id: string;
  pdt_name: string;
}

interface Category {
  _id: string;
  cg_name: string;
}

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onProductSelect: (product: Product | null) => void;
  className?: string;
}

// Helper để get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  
  const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
  
  return {
    'Authorization': `Bearer ${cleanToken}`,
    'Content-Type': 'application/json'
  };
};

export default function ProductSelector({ selectedProduct, onProductSelect, className }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Load reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, searchTerm, selectedBrand, selectedProductType, selectedCategory]);

  const loadReferenceData = async () => {
    try {
      const headers = getAuthHeaders();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      // Load brands, product types, categories in parallel
      const [brandsRes, productTypesRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/brands?limit=1000`, { headers }),
        fetch(`${baseUrl}/api/v1/product-types?limit=1000`, { headers }),
        fetch(`${baseUrl}/api/v1/categories?limit=1000`, { headers })
      ]);

      const [brandsData, productTypesData, categoriesData] = await Promise.all([
        brandsRes.json(),
        productTypesRes.json(),
        categoriesRes.json()
      ]);

      if (brandsData.success && brandsData.data?.brands) {
        setBrands(brandsData.data.brands);
      } else {
        }
      
      if (productTypesData.success && productTypesData.data?.productTypes) {
        setProductTypes(productTypesData.data.productTypes);
      } else {
        }
      
      if (categoriesData.success && categoriesData.data?.categories) {
        setCategories(categoriesData.data.categories);
      } else {
        }
    } catch (error) {
      }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        page: '1'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedBrand) params.append('br_id', selectedBrand);
      if (selectedProductType) params.append('pdt_id', selectedProductType); // Fix: pdt_id not pt_id
      if (selectedCategory) params.append('category_id', selectedCategory);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/v1/products?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();
      if (data.success && data.data?.products) {
        setProducts(data.data.products);
        } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onProductSelect(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedProductType('');
    setSelectedCategory('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Product Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3 border rounded-lg cursor-pointer transition-colors
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'}
          ${selectedProduct ? 'bg-blue-50' : 'bg-white'}
        `}
      >
        <div className="flex items-center justify-between">
          {selectedProduct ? (
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {selectedProduct.pd_name}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <span>ID: {selectedProduct.pd_id}</span>
                  <span>•</span>
                  <span>{formatPrice(selectedProduct.pd_price)}</span>
                  {selectedProduct.br_id && (
                    <>
                      <span>•</span>
                      <span>{typeof selectedProduct.br_id === 'object' ? selectedProduct.br_id.br_name : 'Brand'}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <span className="text-gray-500">Chọn sản phẩm để liên kết...</span>
          )}
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg"
          >
            {/* Search Filters */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Brand Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả thương hiệu ({brands.length})</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.br_name}
                    </option>
                  ))}
                </select>

                {/* Product Type Filter */}
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả loại sản phẩm ({productTypes.length})</option>
                  {productTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.pdt_name}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả danh mục ({categories.length})</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.cg_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Xóa bộ lọc
              </button>
            </div>

            {/* Product List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Đang tải sản phẩm...
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Không tìm thấy sản phẩm nào
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className={`
                        p-3 cursor-pointer transition-colors hover:bg-gray-50
                        ${selectedProduct?._id === product._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {product.pd_name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-2">
                              <span>ID: {product.pd_id}</span>
                              <span>•</span>
                              <span>{formatPrice(product.pd_price)}</span>
                              <span>•</span>
                              <span>Tồn kho: {product.pd_quantity}</span>
                            </div>
                            {(product.br_id || product.pdt_id || product.category_id) && (
                              <div className="flex items-center space-x-2 mt-1">
                                {product.br_id && typeof product.br_id === 'object' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {product.br_id.br_name}
                                  </span>
                                )}
                                {product.pdt_id && typeof product.pdt_id === 'object' && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    {product.pdt_id.pdt_name}
                                  </span>
                                )}
                                {product.category_id && typeof product.category_id === 'object' && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                    {product.category_id.cg_name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedProduct?._id === product._id && (
                          <CheckIcon className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}