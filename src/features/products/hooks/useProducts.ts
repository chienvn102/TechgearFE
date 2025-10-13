import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { brandService } from '@/features/brands/services/brandService';
import { categoryService } from '@/features/categories/services/categoryService';
import { playerService } from '@/features/players/services/playerService';
import { productTypeService } from '@/features/products/services/productTypeService';
import type {
  Product,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  Brand,
  Category,
  Player,
  ProductType
} from '../types/product.types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchProducts = useCallback(async (filters: ProductFilters) => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const response = await productService.deleteProduct(productId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          brandService.getBrands(),
          categoryService.getCategories()
        ]);
        if (brandsRes.success) setBrands(brandsRes.data.brands || []);
        if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch initial data');
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  return {
    products,
    loading,
    error,
    totalPages,
    totalItems,
    brands,
    categories,
    fetchProducts,
    deleteProduct
  };
}

export function useProductFormData() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandsRes, categoriesRes, playersRes] = await Promise.all([
          brandService.getBrands(),
          categoryService.getCategories(),
          playerService.getPlayers()
        ]);

        if (brandsRes.success) {
          setBrands(brandsRes.data.brands);
        } else {
          throw new Error('Failed to fetch brands');
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.data.categories);
        } else {
          throw new Error('Failed to fetch categories');
        }

        if (playersRes.success) {
          setPlayers(playersRes.data.players);
        } else {
          throw new Error('Failed to fetch players');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { brands, categories, players, loading, error };
}

// ✏️ Hook tạo/cập nhật sản phẩm
export function useProductMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (data: CreateProductData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.createProduct(data);
      
      if (response.success) {
        return response.data.product;
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: UpdateProductData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.updateProduct(id, data);
      
      // Return whole response để component có thể check success
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.deleteProduct(id);
      
      if (!response.success) {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProductImage = useCallback(async (productId: string, file: File, color?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData to match service signature
      const formData = new FormData();
      formData.append('image', file);
      if (color) formData.append('color', color);
      
      const response = await productService.uploadProductImage(productId, formData);
      
      if (!response || !response.success) {
        const errorMsg = response?.message || 'Failed to upload image';
        throw new Error(errorMsg);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during upload';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProductImage = useCallback(async (imageId: string) => {
    setLoading(true);
    try {
      const response = await productService.deleteProductImage(imageId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete image');
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during deletion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ⚠️ Method setDefaultImage không tồn tại trong productService
  // TODO: Implement nếu cần thiết
  const setDefaultImage = useCallback(async (imageId: string) => {
    setLoading(true);
    try {
      // Tạm thời không implement - method chưa có trong service
      console.warn('setDefaultImage: Method not implemented in productService');
      throw new Error('setDefaultImage method not available');
      
      // const response = await productService.setDefaultImage(imageId);
      // if (!response.success) {
      //   throw new Error(response.message || 'Failed to set default image');
      // }
      // return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage,
    setDefaultImage,
    loading,
    error
  };
}

// 🏷️ Hook lấy brands
export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await brandService.getBrands(); // ✅ Dùng brandService
        
        if (response.success) {
          setBrands(response.data.brands);
        } else {
          setError('Failed to fetch brands');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
}

// 📂 Hook lấy categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryService.getCategories(); // ✅ Dùng categoryService
        
        if (response.success) {
          setCategories(response.data.categories);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// 👤 Hook lấy players
export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await playerService.getPlayers(); // ✅ Dùng playerService
        
        if (response.success) {
          setPlayers(response.data.players);
        } else {
          setError('Failed to fetch players');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return { players, loading, error };
}

// 📦 Hook lấy product types
export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productTypeService.getProductTypes(); // ✅ Dùng productTypeService
        
        if (response.success) {
          setProductTypes(response.data.productTypes);
        } else {
          setError('Failed to fetch product types');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  return { productTypes, loading, error };
}

// 📄 Hook lấy sản phẩm theo ID
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductById(id);
      if (response.success) {
        setProduct(response.data.product);
      } else {
        setError('Failed to fetch product');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

// 🖼️ Hook lấy ảnh sản phẩm theo ID
export function useProductImages(productId: string) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductImages(productId);
      if (response.success) {
        setImages(response.data.images || []);
      } else {
        setError('Failed to fetch product images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refetch: fetchImages };
}