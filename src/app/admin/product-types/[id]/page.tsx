'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { productTypeService } from '@/features/products/services/productTypeService';
import type { ProductType } from '@/features/products/services/productTypeService';

export default function ProductTypeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productTypeId = params.id as string;

  const [productType, setProductType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product type data
  const loadProductType = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productTypeService.getProductTypeById(productTypeId);
      
      if (response.success && response.data) {
        setProductType(response.data.productType);
      } else {
        setError('Product type not found');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load product type');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!productType || !window.confirm(`Are you sure you want to delete "${productType.pdt_name}"?`)) {
      return;
    }

    try {
      await productTypeService.deleteProductType(productType._id);
      router.push('/admin/product-types');
    } catch (error: any) {
      alert('Failed to delete product type. Please try again.');
    }
  };

  // Load data on mount
  useEffect(() => {
    if (productTypeId) {
      loadProductType();
    }
  }, [productTypeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading product type...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
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

  if (!productType) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Type Not Found</h2>
          <p className="text-gray-600 mb-4">The requested product type could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-gray-900">{productType.pdt_name}</h1>
            <p className="text-gray-600 mt-1">Product Type Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/product-types/${productType._id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          <Button
            variant="error"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Product Type ID</span>
                </div>
                <p className="text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                  {productType.pdt_id}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {productType.is_active ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              {productType.created_at && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Created</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(productType.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Products</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {productType.product_count || 0} products
                </p>
              </div>
            </div>

            {productType.pdt_note && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {productType.pdt_note}
                </p>
              </div>
            )}
          </Card>

          {/* Products Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <Link href={`/admin/products?product_type=${productType._id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  View All Products
                </Button>
              </Link>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <p>Product list will be implemented here</p>
              <p className="text-sm mt-1">Currently showing {productType.product_count || 0} products</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Image</h2>
            
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {productType.pdt_img ? (
                <img
                  src={productType.pdt_img}
                  alt={productType.pdt_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {productType.pdt_img && (
              <div className="mt-4 space-y-2">
                <a
                  href={productType.pdt_img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  View full size
                </a>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link href={`/admin/product-types/${productType._id}/edit`}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <PencilIcon className="h-4 w-4" />
                  Edit Product Type
                </Button>
              </Link>

              <Link href={`/admin/products?product_type=${productType._id}`}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  View Products
                </Button>
              </Link>

              <Button
                variant="error"
                onClick={handleDelete}
                className="w-full flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Product Type
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
