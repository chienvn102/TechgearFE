'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Types (same as Add page)
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

interface Banner {
  _id: string;
  banner_id: string;
  pd_id: Product;
  banner_image_url: string;
  cloudinary_public_id?: string;
  banner_order: number;
  is_active: boolean;
  banner_link_url?: string;
  createdAt: string;
  updatedAt: string;
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
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || 
                localStorage.getItem('auth-token') || 
                localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// API services
const apiService = {
  async getBanner(bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.status}`);
    }

    return response.json();
  },

  async getProducts(search = '') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      limit: '100',
      ...(search && { search })
    });

    const response = await fetch(`${baseUrl}/api/v1/products?${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
  },

  async updateBanner(bannerId: string, bannerData: Partial<BannerFormData>) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bannerData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Update banner failed: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async deleteBanner(bannerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/v1/banners/${bannerId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Delete banner failed: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async uploadImage(file: File) {
    // Placeholder implementation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          success: true,
          data: {
            secure_url: reader.result as string,
            public_id: `banner_${Date.now()}`
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }
};

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [banner, setBanner] = useState<Banner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Image states
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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load banner data on mount
  useEffect(() => {
    if (bannerId) {
      loadBanner();
    }
  }, [bannerId]);

  // Load products when search changes
  useEffect(() => {
    if (productSearch !== '') {
      loadProducts(productSearch);
    } else if (showProductSelector) {
      // Load all products when modal opens
      loadProducts();
    }
  }, [productSearch, showProductSelector]);

    const loadBanner = async () => {
      try {
      setLoading(true);
      setError(null);

      const response = await apiService.getBanner(bannerId);
      
      if (response.success) {
        const bannerData = response.data.banner;
        setBanner(bannerData);
        setSelectedProduct(bannerData.pd_id && typeof bannerData.pd_id === 'object' ? bannerData.pd_id : null);
        
        // Populate form data
        setFormData({
          pd_id: bannerData.pd_id?._id || '',
          banner_image_url: bannerData.banner_image_url || '',
          cloudinary_public_id: bannerData.cloudinary_public_id || '',
          banner_order: bannerData.banner_order || 1,
          is_active: bannerData.is_active !== undefined ? bannerData.is_active : true,
          banner_link_url: bannerData.banner_link_url || ''
        });

        setImagePreview(bannerData.banner_image_url || '');
      } else {
        setError('Không tìm thấy banner');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải banner');
      } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (search = '') => {
    try {
      const response = await apiService.getProducts(search);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ file ảnh: JPG, PNG, WEBP');
      return;
    }

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

    if (!imagePreview && !formData.banner_image_url) {
      setError('Vui lòng chọn ảnh banner');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      let updateData = { ...formData };

      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true);
        const uploadResult = await apiService.uploadImage(selectedImage) as any;
        
        if (uploadResult.success) {
          updateData.banner_image_url = uploadResult.data.secure_url;
          updateData.cloudinary_public_id = uploadResult.data.public_id;
        } else {
          throw new Error('Image upload failed');
        }
        setUploadingImage(false);
      }

      // Clean up data - remove empty strings
      const cleanUpdateData = {
        ...updateData,
        banner_link_url: updateData.banner_link_url || undefined // Remove empty string
      };

      const response = await apiService.updateBanner(bannerId, cleanUpdateData);

      if (response.success) {
        alert('Banner đã được cập nhật thành công!');
        router.push('/admin/banners');
      } else {
        throw new Error(response.message || 'Failed to update banner');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật banner');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!banner) return;

    const confirmMessage = `Bạn có chắc chắn muốn xóa banner "${banner.banner_id}"?\n\nHành động này không thể hoàn tác.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteBanner(bannerId);

      if (response.success) {
        alert('Banner đã được xóa thành công!');
        router.push('/admin/banners');
      } else {
        throw new Error(response.message || 'Failed to delete banner');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa banner');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Banner không tồn tại</h1>
          <button
            onClick={() => router.push('/admin/banners')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách banner
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa Banner {banner.banner_id}</h1>
            <p className="text-gray-600">
              Tạo lúc: {new Date(banner.createdAt).toLocaleString('vi-VN')} |
              Sửa lần cuối: {new Date(banner.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <TrashIcon className="h-5 w-5 mr-2" />
                Xóa Banner
              </>
            )}
          </button>
        </div>
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
                      onClick={() => {
                        setShowProductSelector(true);
                        loadProducts();
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowProductSelector(true);
                    loadProducts();
                  }}
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
                </div>
              </div>

          {/* Right Column - Image & Advanced Settings */}
          <div className="space-y-6">
            {/* Current Image */}
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhotoIcon className="h-4 w-4 inline mr-1" />
                Ảnh Banner Hiện Tại
                  </label>
              
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Current banner"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* New Image Upload */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Thay đổi ảnh banner</h4>
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để upload ảnh mới</span>
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
                Banner đang hoạt động
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
            disabled={saving || uploadingImage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {saving || uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadingImage ? 'Đang upload ảnh...' : 'Đang lưu...'}
              </>
            ) : (
              'Lưu thay đổi'
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
