'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
// Removed AdminSidebar and AdminHeader imports - using admin layout
import { Button } from '@/shared/components/ui/Button';
import { productService } from '../services/productService';
import type { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductFormData,
  Brand,
  ProductType,
  Category,
  Player
} from '../types/product.types';

// Temporary direct API calls for related data
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  onSuccess?: (productId: string) => void;
  onCancel?: () => void;
  showLayout?: boolean; // ✅ Thêm prop để control layout
}

const initialFormData: ProductFormData = {
  pd_name: '',
  pd_price: 0,
  pd_quantity: 0,
  pd_note: '',
  br_id: '',
  pdt_id: '',
  category_id: '',
  player_id: '',
  product_description: '',
  stock_quantity: 0,
  is_available: true,
  color: ''
};

function ProductForm({ mode, productId, onSuccess, onCancel, showLayout = true }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Related data for dropdowns
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(true);

  // Auto-generated fields
  const [generatedPdId, setGeneratedPdId] = useState<string>('');
  const [generatedSku, setGeneratedSku] = useState<string>('');

  // Load related data
  useEffect(() => {
    loadRelatedData();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProductData();
    }
  }, [mode, productId]);

  // Auto-generate SKU when related data changes
  useEffect(() => {
    if (formData.category_id && formData.br_id && formData.color) {
      generateSku();
    }
  }, [formData.category_id, formData.br_id, formData.color]);

  const loadRelatedData = async () => {
    try {
      setLoadingRelatedData(true);
      
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Load brands
      const brandsResponse = await fetch(`${API_BASE_URL}/brands`, { headers });
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        setBrands(brandsData.data?.brands || []);
      } else {
        }

      // Load product types
      const productTypesResponse = await fetch(`${API_BASE_URL}/product-types`, { headers });
      if (productTypesResponse.ok) {
        const productTypesData = await productTypesResponse.json();
        setProductTypes(productTypesData.data?.productTypes || []);
      }

      // Load categories
      const categoriesResponse = await fetch(`${API_BASE_URL}/categories`, { headers });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data?.categories || []);
      }

      // Load players
      const playersResponse = await fetch(`${API_BASE_URL}/players`, { headers });
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setPlayers(playersData.data?.players || []);
      }

    } catch (err: any) {
      setError('Không thể tải dữ liệu liên quan');
    } finally {
      setLoadingRelatedData(false);
    }
  };

  const loadProductData = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProductById(productId);
      
      if (response.success && response.data?.product) {
        const product = response.data.product;
        setFormData({
          pd_name: product.pd_name || '',
          pd_price: product.pd_price || 0,
          pd_quantity: product.pd_quantity || 0,
          pd_note: product.pd_note || '',
          br_id: typeof product.br_id === 'string' ? product.br_id : product.br_id._id,
          pdt_id: typeof product.pdt_id === 'string' ? product.pdt_id : product.pdt_id._id,
          category_id: typeof product.category_id === 'string' ? product.category_id : product.category_id._id,
          player_id: product.player_id ? (typeof product.player_id === 'string' ? product.player_id : product.player_id._id) : '',
          product_description: product.product_description || '',
          stock_quantity: product.stock_quantity || 0,
          is_available: product.is_available,
          color: product.color || ''
        });

        setGeneratedPdId(product.pd_id);
        setGeneratedSku(product.sku);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const generateSku = async (): Promise<string> => {
    try {
      const category = categories.find(c => c._id === formData.category_id);
      const brand = brands.find(b => b._id === formData.br_id);
      
      if (category && brand && formData.color) {
        // Format: [CATEGORY_CODE][BRAND_CODE][COLOR_CODE][SEQUENTIAL_NUMBER]
        const categoryCode = category.cg_id?.substring(0, 3).toUpperCase() || 'CAT';
        const brandCode = brand.br_id?.substring(0, 3).toUpperCase() || 'BRD';
        
        // Clean color code - remove Vietnamese characters and special chars
        const colorCode = formData.color
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, 'X') // Replace non-alphanumeric with X
          .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
          .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
          .replace(/[ÌÍỊỈĨ]/g, 'I')
          .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
          .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
          .replace(/[ỲÝỴỶỸ]/g, 'Y')
          .replace(/[Đ]/g, 'D');
        
        // Generate sequential number (using timestamp for uniqueness)
        const sequentialNumber = Date.now().toString().slice(-3);
        
        const sku = `${categoryCode}${brandCode}${colorCode}${sequentialNumber}`;
        setGeneratedSku(sku);
        return sku;
      }
      
      // Fallback SKU if no data available
      const fallbackSku = `PROD${Date.now().toString().slice(-6)}`;
      setGeneratedSku(fallbackSku);
      return fallbackSku;
    } catch (err) {
      const fallbackSku = `PROD${Date.now().toString().slice(-6)}`;
      setGeneratedSku(fallbackSku);
      return fallbackSku;
    }
  };

  const generateProductId = () => {
    const timestamp = Date.now();
    const nameCode = formData.pd_name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const pdId = `PD${timestamp}${nameCode}`;
    setGeneratedPdId(pdId);
    return pdId;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pd_name.trim()) {
      setError('Tên sản phẩm là bắt buộc');
      return;
    }

    if (!formData.br_id || !formData.pdt_id || !formData.category_id) {
      setError('Vui lòng chọn thương hiệu, loại sản phẩm và danh mục');
      return;
    }

    if (!formData.color.trim()) {
      setError('Màu sắc là bắt buộc');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let resultProductId: string;

      if (mode === 'create') {
        // Generate IDs if not set
        const pdId = generatedPdId || generateProductId();
        const sku = generatedSku || await generateSku();

        // Create product
        const createData: CreateProductData = {
          pd_id: pdId,
          pd_name: formData.pd_name.trim(),
          pd_price: formData.pd_price,
          pd_quantity: formData.pd_quantity,
          pd_note: formData.pd_note.trim() || undefined,
          br_id: formData.br_id,
          pdt_id: formData.pdt_id,
          category_id: formData.category_id,
          // Chỉ gửi player_id nếu có giá trị, không gửi null
          ...(formData.player_id && { player_id: formData.player_id }),
          product_description: formData.product_description.trim() || undefined,
          stock_quantity: formData.stock_quantity,
          is_available: formData.is_available,
          color: formData.color.trim(),
          sku: sku
        };

        const response = await productService.createProduct(createData);
        resultProductId = response.data.product._id;
        
        } else {
        // Update product
        if (!productId) throw new Error('Product ID is required for update');

        // Generate SKU for update (same logic as create)
        const categoryCode = categories.find(c => c._id === formData.category_id)?.cg_id?.slice(0, 3).toUpperCase() || 'CAT';
        const brandCode = brands.find(b => b._id === formData.br_id)?.br_id?.slice(0, 3).toUpperCase() || 'BRD';
        
        // Clean color code - remove Vietnamese characters and special chars
        const colorCode = formData.color
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, 'X') // Replace non-alphanumeric with X
          .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
          .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
          .replace(/[ÌÍỊỈĨ]/g, 'I')
          .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
          .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
          .replace(/[ỲÝỴỶỸ]/g, 'Y')
          .replace(/[Đ]/g, 'D');
        
        const sequentialNumber = Date.now().toString().slice(-3);
        const sku = `${categoryCode}${brandCode}${colorCode}${sequentialNumber}`;

        const updateData: UpdateProductData = {
          pd_name: formData.pd_name.trim(),
          pd_price: formData.pd_price,
          pd_quantity: formData.pd_quantity,
          pd_note: formData.pd_note.trim() || undefined,
          br_id: formData.br_id,
          pdt_id: formData.pdt_id,
          category_id: formData.category_id,
          // Chỉ gửi player_id nếu có giá trị, không gửi null
          ...(formData.player_id && { player_id: formData.player_id }),
          product_description: formData.product_description.trim() || undefined,
          stock_quantity: formData.stock_quantity,
          is_available: formData.is_available,
          color: formData.color.trim(),
          sku: sku // ✅ Sử dụng SKU được generate
        };

        await productService.updateProduct(productId, updateData);
        resultProductId = productId;
        
        }

      // Success callback or navigation
      if (onSuccess) {
        onSuccess(resultProductId);
      } else {
        // Redirect to product images management page
        router.push(`/admin/products/${resultProductId}/images`);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={showLayout ? "max-w-6xl mx-auto" : ""}
    >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {mode === 'create' 
                      ? 'Tạo sản phẩm mới cho hệ thống' 
                      : 'Cập nhật thông tin sản phẩm'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="pd_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      id="pd_name"
                      name="pd_name"
                      required
                      value={formData.pd_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên sản phẩm..."
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="pd_price" className="block text-sm font-medium text-gray-700 mb-2">
                      Giá sản phẩm (VNĐ) *
                    </label>
                    <input
                      type="number"
                      id="pd_price"
                      name="pd_price"
                      required
                      min="0"
                      value={formData.pd_price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label htmlFor="pd_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      id="pd_quantity"
                      name="pd_quantity"
                      required
                      min="0"
                      value={formData.pd_quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Tồn kho *
                    </label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      required
                      min="0"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                      Màu sắc *
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      required
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ví dụ: Đỏ, Xanh, Trắng..."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="is_available" className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      id="is_available"
                      name="is_available"
                      value={formData.is_available.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Có sẵn</option>
                      <option value="false">Không có sẵn</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Related Data */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên quan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand */}
                  <div>
                    <label htmlFor="br_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Thương hiệu *
                    </label>
                    <select
                      id="br_id"
                      name="br_id"
                      required
                      value={formData.br_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingRelatedData}
                    >
                      <option value="">Chọn thương hiệu...</option>
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.br_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Type */}
                  <div>
                    <label htmlFor="pdt_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Loại sản phẩm *
                    </label>
                    <select
                      id="pdt_id"
                      name="pdt_id"
                      required
                      value={formData.pdt_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingRelatedData}
                    >
                      <option value="">Chọn loại sản phẩm...</option>
                      {productTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.pdt_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      required
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingRelatedData}
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.cg_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Player */}
                  <div>
                    <label htmlFor="player_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Cầu thủ (tùy chọn)
                    </label>
                    <select
                      id="player_id"
                      name="player_id"
                      value={formData.player_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingRelatedData}
                    >
                      <option value="">Chọn cầu thủ...</option>
                      {players.map((player) => (
                        <option key={player._id} value={player._id}>
                          {player.player_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Auto-generated Information */}
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Thông tin tự động tạo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã sản phẩm (PD_ID)
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                      {generatedPdId || 'Sẽ được tạo tự động'}
                    </div>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã SKU
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                      {generatedSku || 'Sẽ được tạo tự động'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                
                <div className="space-y-4">
                  {/* Short Note */}
                  <div>
                    <label htmlFor="pd_note" className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú ngắn
                    </label>
                    <input
                      type="text"
                      id="pd_note"
                      name="pd_note"
                      value={formData.pd_note}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú ngắn về sản phẩm..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="product_description" className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      id="product_description"
                      name="product_description"
                      rows={4}
                      value={formData.product_description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả chi tiết về sản phẩm..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  variant="admin"
                  disabled={saving || loadingRelatedData}
                  className="flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      {mode === 'create' ? 'Tạo sản phẩm' : 'Cập nhật'}
                    </>
                  )}
                </Button>
              </div>
            </form>
    </motion.div>
  );

  return content;
}

export default ProductForm;
