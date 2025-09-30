// 📝 ADMIN PRODUCT FORM - Form tạo/sửa sản phẩm

'use client';

import { useState, useEffect } from 'react';
import { useProductMutation, useBrands, useCategories, useProductTypes } from '../hooks/useProducts';
import type { Product, CreateProductData, UpdateProductData } from '../types/product.types';

interface AdminProductFormProps {
  product?: Product; // For editing
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export default function AdminProductForm({ product, onSuccess, onCancel }: AdminProductFormProps) {
  const isEditing = !!product;
  const { createProduct, updateProduct, loading, error } = useProductMutation();
  const { brands, loading: brandsLoading } = useBrands();
  const { categories, loading: categoriesLoading } = useCategories();
  const { productTypes, loading: productTypesLoading } = useProductTypes();

  const [formData, setFormData] = useState({
    pd_id: product?.pd_id || '',
    pd_name: product?.pd_name || '',
    pd_price: product?.pd_price?.toString() || '',
    pd_note: product?.pd_note || '',
    br_id: typeof product?.br_id === 'object' ? product.br_id._id : product?.br_id || '',
    pdt_id: typeof product?.pdt_id === 'object' ? product.pdt_id._id : product?.pdt_id || '',
    category_id: typeof product?.category_id === 'object' ? product.category_id._id : product?.category_id || '',
    player_id: typeof product?.player_id === 'object' ? product.player_id._id : product?.player_id || '',
    product_description: product?.product_description || '',
    stock_quantity: product?.stock_quantity?.toString() || '',
    is_available: product?.is_available ?? true,
    color: product?.color || '',
    sku: product?.sku || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 🔄 Auto-generate pd_id and sku
  useEffect(() => {
    if (!isEditing && formData.pd_name && !formData.pd_id) {
      const generateId = (name: string) => {
        return name
          .normalize('NFD') // Chuẩn hóa Unicode (e.g., 'Đ' -> 'D')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/\s+/g, '') // Bỏ khoảng trắng
          .replace(/[^A-Z0-9]/g, '') // Chỉ giữ lại chữ hoa và số
          .substring(0, 8) + Math.random().toString(36).substring(2, 5).toUpperCase();
      };

      const newPdId = generateId(formData.pd_name);
      
      const selectedBrand = brands.find(b => b._id === formData.br_id);
      const brandCode = selectedBrand ? selectedBrand.br_name.substring(0, 3).toUpperCase() : 'BRD';
      const newSku = `${brandCode}-${newPdId}`;

      setFormData(prev => ({
        ...prev,
        pd_id: newPdId,
        sku: newSku,
      }));
    }
  }, [formData.pd_name, formData.br_id, brands, isEditing, formData.pd_id]);

  // 📝 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ✅ Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.pd_id.trim()) errors.pd_id = 'Mã sản phẩm là bắt buộc';
    if (!formData.pd_name.trim()) errors.pd_name = 'Tên sản phẩm là bắt buộc';
    if (!formData.pd_price || parseFloat(formData.pd_price) <= 0) {
      errors.pd_price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      errors.stock_quantity = 'Số lượng tồn kho không được âm';
    }
    if (!formData.br_id) errors.br_id = 'Vui lòng chọn thương hiệu';
    if (!formData.category_id) errors.category_id = 'Vui lòng chọn danh mục';
    if (!formData.pdt_id) errors.pdt_id = 'Vui lòng chọn loại sản phẩm';
    if (!formData.product_description.trim()) {
      errors.product_description = 'Mô tả sản phẩm là bắt buộc';
    }
    if (!formData.color.trim()) errors.color = 'Màu sắc là bắt buộc';
    if (!formData.sku.trim()) errors.sku = 'SKU là bắt buộc';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 💾 Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const productData: Partial<CreateProductData> = {
        pd_id: formData.pd_id.trim(),
        pd_name: formData.pd_name.trim(),
        pd_price: parseFloat(formData.pd_price),
        pd_note: formData.pd_note.trim(),
        pd_quantity: parseInt(formData.stock_quantity),
        br_id: formData.br_id,
        pdt_id: formData.pdt_id,
        category_id: formData.category_id,
        product_description: formData.product_description.trim(),
        stock_quantity: parseInt(formData.stock_quantity),
        is_available: formData.is_available,
        color: formData.color.trim(),
        sku: formData.sku.trim()
      };

      if (formData.player_id) {
        productData.player_id = formData.player_id;
      }

      let result: Product;
      
      if (isEditing && product) {
        result = await updateProduct(product._id, { ...productData, _id: product._id });
      } else {
        result = await createProduct(productData);
      }

      onSuccess?.(result);
    } catch (err) {
      }
  };

  if (brandsLoading || categoriesLoading || productTypesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin để tạo sản phẩm mới'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Lỗi:</strong> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="pd_id" className="block text-sm font-medium text-gray-700 mb-1">
                Mã sản phẩm *
              </label>
              <input
                type="text"
                id="pd_id"
                name="pd_id"
                value={formData.pd_id}
                onChange={handleChange}
                disabled={isEditing} // Không cho sửa mã khi edit
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.pd_id ? 'border-red-500' : 'border-gray-300'
                } ${isEditing ? 'bg-gray-100' : ''}`}
                placeholder="VD: PROD001"
              />
              {validationErrors.pd_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.pd_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="VD: NIKE-PROD001"
              />
              {validationErrors.sku && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.sku}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="pd_name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              id="pd_name"
              name="pd_name"
              value={formData.pd_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                validationErrors.pd_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên sản phẩm"
            />
            {validationErrors.pd_name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.pd_name}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="pd_price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VNĐ) *
              </label>
              <input
                type="number"
                id="pd_price"
                name="pd_price"
                value={formData.pd_price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.pd_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {validationErrors.pd_price && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.pd_price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho *
              </label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {validationErrors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.stock_quantity}</p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="br_id" className="block text-sm font-medium text-gray-700 mb-1">
                Thương hiệu *
              </label>
              <select
                id="br_id"
                name="br_id"
                value={formData.br_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.br_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.br_name}
                  </option>
                ))}
              </select>
              {validationErrors.br_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.br_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.cg_name}
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="pdt_id" className="block text-sm font-medium text-gray-700 mb-1">
                Loại sản phẩm *
              </label>
              <select
                id="pdt_id"
                name="pdt_id"
                value={formData.pdt_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.pdt_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn loại sản phẩm</option>
                {productTypes.map(pt => (
                  <option key={pt._id} value={pt._id}>
                    {pt.pdt_name}
                  </option>
                ))}
              </select>
              {validationErrors.pdt_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.pdt_id}</p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Màu sắc *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.color ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="VD: Đỏ, Xanh, Trắng"
              />
              {validationErrors.color && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.color}</p>
              )}
            </div>

            <div>
              <label htmlFor="is_available" className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Sản phẩm có sẵn
                </span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label htmlFor="pd_note" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú sản phẩm
            </label>
            <textarea
              id="pd_note"
              name="pd_note"
              value={formData.pd_note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú ngắn về sản phẩm..."
            />
          </div>

          <div>
            <label htmlFor="product_description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết *
            </label>
            <textarea
              id="product_description"
              name="product_description"
              value={formData.product_description}
              onChange={handleChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                validationErrors.product_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mô tả chi tiết về sản phẩm, tính năng, thông số kỹ thuật..."
            />
            {validationErrors.product_description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.product_description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isEditing ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
