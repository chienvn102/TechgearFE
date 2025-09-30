'use client';

import { use } from 'react';
import ProductForm from '@/features/products/components/ProductForm';
// Removed AdminSidebar and AdminHeader imports - using admin layout

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  return <ProductForm mode="edit" productId={id} showLayout={false} />;
}
