'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { productTypeService } from '@/features/products/services/productTypeService';
import type { ProductType, UpdateProductTypeDto } from '@/features/products/services/productTypeService';

export default function EditProductTypePage() {
  const router = useRouter();
  const params = useParams();
  const productTypeId = params.id as string;

  const [formData, setFormData] = useState<UpdateProductTypeDto>({
    pdt_name: '',
    pdt_note: '',
    is_active: true
  });

  const [originalData, setOriginalData] = useState<ProductType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');

  // Load product type data
  const loadProductType = async () => {
    try {
      setInitialLoading(true);

      const response = await productTypeService.getProductTypeById(productTypeId);
      
      if (response.success && response.data) {
        const productType = response.data.productType;
        setOriginalData(productType);
        setFormData({
          pdt_name: productType.pdt_name,
          pdt_note: productType.pdt_note || '',
          is_active: productType.is_active
        });
        setCurrentImage(productType.pdt_img || '');
      } else {
        setErrors({ general: 'Product type not found' });
      }
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Failed to load product type' });
    } finally {
      setInitialLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, WebP)' }));
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, image: 'Image file size must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove new image
  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview('');
    setErrors(prev => ({ ...prev, image: '' }));
  };

  // Delete current image
  const deleteCurrentImage = async () => {
    if (!window.confirm('Are you sure you want to delete the current image?')) {
      return;
    }

    try {
      await productTypeService.deleteProductTypeImage(productTypeId);
      setCurrentImage('');
    } catch (error) {
      alert('Failed to delete image. Please try again.');
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pdt_name?.trim()) {
      newErrors.pdt_name = 'Product Type name is required';
    } else if (formData.pdt_name.length < 2) {
      newErrors.pdt_name = 'Product Type name must be at least 2 characters';
    } else if (formData.pdt_name.length > 100) {
      newErrors.pdt_name = 'Product Type name must not exceed 100 characters';
    }

    if (formData.pdt_note && formData.pdt_note.length > 500) {
      newErrors.pdt_note = 'Note must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Update product type
      const response = await productTypeService.updateProductType(productTypeId, formData);

      if (response.success) {
        // Upload new image if selected
        if (imageFile) {
          try {
            await productTypeService.uploadProductTypeImage(productTypeId, imageFile);
            } catch (imageError) {
            // Continue even if image upload fails
          }
        }

        // Redirect to product type detail
        router.push(`/admin/product-types/${productTypeId}`);
      } else {
        setErrors({ general: response.message || 'Failed to update product type' });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            backendErrors[field] = messages[0];
          }
        });
        setErrors(backendErrors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || error.message || 'An unexpected error occurred' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (productTypeId) {
      loadProductType();
    }
  }, [productTypeId]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading product type...</span>
      </div>
    );
  }

  if (!originalData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{errors.general || 'Product type not found'}</p>
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product Type</h1>
          <p className="text-gray-600 mt-1">Update product type information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Type Information</h2>
              
              <div className="space-y-4">
                {/* Product Type ID (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type ID
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-mono">
                    {originalData.pdt_id}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Product type ID cannot be changed
                  </p>
                </div>

                {/* Product Type Name */}
                <div>
                  <label htmlFor="pdt_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type Name *
                  </label>
                  <Input
                    id="pdt_name"
                    name="pdt_name"
                    value={formData.pdt_name}
                    onChange={handleChange}
                    placeholder="Enter product type name"
                    error={errors.pdt_name}
                    required
                  />
                </div>

                {/* Product Type Note */}
                <div>
                  <label htmlFor="pdt_note" className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    id="pdt_note"
                    name="pdt_note"
                    value={formData.pdt_note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter product type description or note (optional)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.pdt_note ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pdt_note && (
                    <p className="text-red-500 text-sm mt-1">{errors.pdt_note}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 500 characters
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active status
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Image Management */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Type Image</h2>
              
              {/* Current Image */}
              {currentImage && !imagePreview && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                  <div className="relative">
                    <img
                      src={currentImage}
                      alt="Current product type"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={deleteCurrentImage}
                      className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                      title="Delete current image"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {currentImage ? 'Upload New Image' : 'Upload Image'}
                </p>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Upload an image
                        </span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="text-xs text-gray-500 mb-2">New Image Preview</p>
                    <img
                      src={imagePreview}
                      alt="New product type preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {errors.image && (
                  <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              'Updating...'
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Update Product Type
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
