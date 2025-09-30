'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  StarIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
// Removed AdminSidebar and AdminHeader imports - using admin layout
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { Button } from '@/shared/components/ui/Button';
import { productService } from '@/features/products/services/productService';
import type { Product, ProductImage } from '@/features/products/types/product.types';

export default function ProductImagesPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const productResponse = await productService.getProductById(productId);
      if (productResponse.success && productResponse.data?.product) {
        setProduct(productResponse.data.product);
      }

      const imagesResponse = await productService.getProductImages(productId);
      if (imagesResponse.success && imagesResponse.data?.images) {
        setImages(imagesResponse.data.images);
      }
    } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('color', 'default'); // Default color since we removed color input
      formData.append('is_primary', images.length === 0 ? 'true' : 'false');

      const response = await productService.uploadProductImage(productId, formData);
      
      if (response.success) {
        // Reload images
        await loadData();
        setShowUploadModal(false);
        setSelectedFile(null);
        setImagePreview(null);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      return;
    }

    try {
      const response = await productService.deleteProductImage(imageId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.message || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await productService.setPrimaryImage(imageId);
      if (response.success) {
        await loadData();
      } else {    
        setError(response.message || 'Set primary failed');
      }
    } catch (err: any) {
      setError(err.message || 'Set primary failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Quản lý ảnh sản phẩm
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {product?.pd_name} - {product?.sku}
                  </p>
                </div>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Thêm ảnh
                </Button>
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh sản phẩm</h2>

              {images.length === 0 ? (
                <div className="text-center py-12">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có ảnh nào</p>
                  <p className="text-sm text-gray-400 mt-1">Nhấn "Thêm ảnh" để upload ảnh đầu tiên</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="relative">
                        <SafeImage
                            src={image.img}
                          alt={`Product image ${image._id}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          width={128}
                          height={128}
                        />

                        {/* Primary Badge */}
                        {image.is_primary && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <StarSolidIcon className="h-3 w-3 mr-1" />
                            Mặc định
                          </div>
                        )}

                          {/* Action Buttons */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="admin"
                                  onClick={() => handleSetPrimary(image._id)}
                                  disabled={image.is_primary}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  title={image.is_primary ? "Đã là ảnh mặc định" : "Đặt làm ảnh mặc định"}
                                >
                                  <StarIcon className="h-4 w-4" />
                                </Button>
                                                              <Button
                                  size="sm"
                            variant="admin"
                            onClick={() => handleDeleteImage(image._id)}
                            className="bg-red-600 hover:bg-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                          </div>
                        </div>
                        
                      <div className="mt-2 text-xs text-gray-500">
                        {image.is_primary && (
                          <p className="text-yellow-600 font-medium">Ảnh mặc định</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
            </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mx-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Thêm ảnh sản phẩm</h3>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                      setImagePreview(null);
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Input Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chọn ảnh sản phẩm *
                    </label>
                    
                    <div className="space-y-4">
                      {/* File Input */}
                      <div className="flex items-center space-x-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                            <PhotoIcon className="h-4 w-4 mr-2" />
                            Chọn ảnh
                          </div>
                        </label>
                        
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 font-medium">Ảnh đã chọn:</p>
                          <div className="flex items-start space-x-4">
                            <img
                              src={imagePreview}
                              alt="Image preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Math.round((selectedFile?.size || 0) / 1024)} KB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedFile?.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Image State */}
                      {!imagePreview && (
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Chưa chọn ảnh</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Hỗ trợ: JPG, PNG, WebP (tối đa 5MB)
                            </p>
                          </div>
                        </div>
                      )}
        </div>
      </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <XMarkIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

      {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setSelectedFile(null);
                        setImagePreview(null);
                        setError(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Đang tải lên...' : 'Tải lên ảnh'}
                    </button>
                  </div>
                </div>
              </motion.div>
      </div>
          )}

          {/* Done Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => router.push('/admin/products')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Xong
            </Button>
          </div>
    </div>
  );
}
