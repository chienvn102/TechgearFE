'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Types
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
  };
  pdt_id?: {
    _id: string;
    pdt_name: string;
  };
  category_id?: {
    _id: string;
    category_name: string;
  };
}

interface BannerFormData {
  pd_id: string;
  banner_image_url: string;
  cloudinary_public_id: string;
  banner_order: number;
  is_active: boolean;
  banner_link_url: string;
}

// Auth utilities
const getAuthHeaders = (includeContentType = true) => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('auth-token') || 
                localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  // Only include Content-Type for JSON requests, not for FormData
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// API services
const apiService = {
  async getProducts(search = '') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      limit: '100',
      ...(search && { search })
    });

    const url = `${baseUrl}/api/v1/products?${params}`;
    const headers = {
      ...getAuthHeaders(),
    'Content-Type': 'application/json'
  };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
  },

  async createBanner(bannerData: BannerFormData) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bannerData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Create banner failed: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async uploadImage(file: File) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('banner_image', file);
    formData.append('banner_id', 'temp_' + Date.now()); // Temporary banner_id
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/upload/banner`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(false) // Don't include Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Image upload failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  async uploadImageForBanner(file: File, bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('banner_image', file);
    formData.append('banner_id', bannerId); // Real banner_id
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/upload/banner`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(false) // Don't include Content-Type for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Image upload failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }
};

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form data
  const [formData, setFormData] = useState<BannerFormData>({
    pd_id: '',
    banner_image_url: '',
    cloudinary_public_id: '',
    banner_order: 1,
    is_active: true,
    banner_link_url: ''
  });

  // Selected product for display
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products on component mount
  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('auth-token') || 
                  localStorage.getItem('token');
    
    if (!token) {
      setError('Vui lòng đăng nhập để tiếp tục');
      return;
    }
    
    loadProducts();
  }, []);

  // Load products when search changes
  useEffect(() => {
    if (productSearch !== '') {
      loadProducts(productSearch);
    }
  }, [productSearch]);

  const loadProducts = async (search = '') => {
    try {
      const response = await apiService.getProducts(search);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError(`Không thể tải danh sách sản phẩm: ${err.message}`);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ file ảnh: JPG, PNG, WEBP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, pd_id: product._id }));
    setShowProductSelector(false);
  };

  const handleInputChange = (field: keyof BannerFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.pd_id) {
      setError('Vui lòng chọn sản phẩm để liên kết');
      return false;
    }

    if (!selectedImage && !formData.banner_image_url) {
      setError('Vui lòng chọn ảnh banner');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare banner data
      let bannerData = { ...formData };

      // Clean up data - remove empty strings
      const cleanBannerData = {
        ...bannerData,
        banner_link_url: bannerData.banner_link_url || undefined // Remove empty string
      };

      // Set placeholder image URL first
      cleanBannerData.banner_image_url = 'https://via.placeholder.com/1920x1080?text=Uploading...';

      // Step 1: Create banner first
      const response = await apiService.createBanner(cleanBannerData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create banner');
      }

      const createdBanner = response.data;
      // Get the actual banner_id from the response
      const bannerId = createdBanner?.banner?.banner_id || createdBanner?.banner_id;
      if (!bannerId) {
        throw new Error('Banner ID not found in response');
      }

      // Step 2: Upload image if selected
      if (selectedImage) {
        setUploadingImage(true);
        const uploadResult = await apiService.uploadImageForBanner(selectedImage, bannerId) as any;
        
        if (uploadResult.success) {
          alert('Banner đã được tạo và ảnh đã được upload thành công!');
        } else {
          alert('Banner đã được tạo thành công, nhưng có lỗi khi upload ảnh. Bạn có thể cập nhật ảnh sau.');
        }
        setUploadingImage(false);
      } else {
        alert('Banner đã được tạo thành công!');
      }

      router.push('/admin/banners');

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo banner');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm Banner Mới</h1>
        <p className="text-gray-600">Upload ảnh banner và liên kết với sản phẩm</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
            <div className="space-y-6">

            {/* Product Selection */}
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="h-4 w-4 inline mr-1" />
                Sản phẩm liên kết *
                  </label>
              
              {selectedProduct ? (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{selectedProduct.pd_name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {selectedProduct.pd_id} | Giá: {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedProduct.pd_price)}
                      </div>
                      {selectedProduct.br_id && (
                        <div className="text-xs text-gray-400">
                          Thương hiệu: {selectedProduct.br_id.br_name}
                        </div>
                  )}
                </div>
                    <button
                      type="button"
                      onClick={() => setShowProductSelector(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Thay đổi
                    </button>
                </div>
              </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowProductSelector(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  + Chọn sản phẩm để liên kết
                </button>
              )}
            </div>

            {/* Banner Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min="1"
                value={formData.banner_order}
                onChange={(e) => handleInputChange('banner_order', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Số thứ tự càng nhỏ sẽ hiển thị trước
              </p>
                  </div>
            </div>

          {/* Right Column - Image & Advanced Settings */}
            <div className="space-y-6">
            {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="h-4 w-4 inline mr-1" />
                Ảnh Banner *
                  </label>
              
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                          <img
                            src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click để upload</span> hoặc kéo thả ảnh
                            </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      />
                    </label>
                  </div>
              </div>
            </div>

            {/* Link Override */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link tùy chỉnh (tùy chọn)
              </label>
              <input
                type="url"
                value={formData.banner_link_url}
                onChange={(e) => handleInputChange('banner_link_url', e.target.value)}
                placeholder="https://example.com/special-page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Nếu để trống, banner sẽ link đến trang sản phẩm
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                Kích hoạt banner ngay sau khi tạo
              </label>
                </div>
              </div>
            </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
              <button
                type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
            {loading || uploadingImage ? (
                  <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadingImage ? 'Đang upload ảnh...' : 'Đang tạo banner...'}
                  </>
                ) : (
              'Tạo Banner'
                )}
              </button>
            </div>
          </form>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Chọn sản phẩm</h3>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-gray-900">{product.pd_name}</div>
                    <div className="text-sm text-gray-500">
                      ID: {product.pd_id} | Giá: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.pd_price)}
                    </div>
                    {product.br_id && (
                      <div className="text-xs text-gray-400">
                        Thương hiệu: {product.br_id.br_name}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Tồn kho: {product.pd_quantity} | 
                      Trạng thái: {product.is_available ? 'Có sẵn' : 'Hết hàng'}
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
      )}
    </motion.div>
  );
}
