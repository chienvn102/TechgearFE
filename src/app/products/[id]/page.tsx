'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Header from '../../../components/Header';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { useCart } from '@/contexts/CartContext';

interface ProductImage {
  img: string;
  color: string;
}

interface ProductDetail {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_description: string;
  pd_price: number;
  pd_quantity: number;
  is_active: boolean;
  cg_id: {
    _id: string;
    cg_name: string;
    cg_id: string;
  };
  br_id: {
    _id: string;
    br_name: string;
    br_id: string;
  };
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        
        const response = await fetch(`http://localhost:3000/api/v1/products/${params.id}`);
        const data = await response.json();

        if (data.success && data.data && data.data.product) {
          // Combine product data with images
          const productWithImages = {
            ...data.data.product,
            images: data.data.images || []
          };
          
          setProduct(productWithImages);
          
          // Set default color and image
          if (data.data.images && data.data.images.length > 0) {
            const firstImage = data.data.images[0];
            if (firstImage.color) {
              setSelectedColor(firstImage.color);
            }
            if (firstImage.img && firstImage.img.trim()) {
              setSelectedImage(firstImage.img);
            }
          }
        } else {
          setError('Không thể tải thông tin sản phẩm');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imageForColor = product?.images?.find(img => img.color === color);
    if (imageForColor) {
      setSelectedImage(imageForColor.img);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Add to cart using context
      addItem({
        _id: product._id,
        pd_id: product.pd_id,
        pd_name: product.pd_name,
        pd_price: product.pd_price,
        img: selectedImage || product.images?.[0]?.img,
        color: selectedColor || product.images?.[0]?.color,
        brand: product.br_id?.br_name
      });
      
      // Open cart to show added item
      openCart();
    } catch (error) {
      alert('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now - add to cart and go to checkout
  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first
    addItem({
      _id: product._id,
      pd_id: product.pd_id,
      pd_name: product.pd_name,
      pd_price: product.pd_price,
      img: selectedImage || product.images?.[0]?.img,
      color: selectedColor || product.images?.[0]?.color,
      brand: product.br_id?.br_name
    });
    
    // Navigate to checkout
    router.push('/checkout');
  };

  // Get unique colors
  const availableColors = product?.images?.map(img => img.color).filter((color, index, arr) => arr.indexOf(color) === index) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-6">{error || 'Sản phẩm không tồn tại hoặc đã bị xóa'}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <SafeImage
                src={selectedImage || undefined}
                alt={product.pd_name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                fallbackSrc="/images/placeholder-product.svg"
              />
            </motion.div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(image.img);
                      setSelectedColor(image.color);
                    }}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === image.img
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <SafeImage
                      src={image.img || undefined}
                      alt={`${product.pd_name} - ${image.color}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                      fallbackSrc="/images/placeholder-product.svg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.pd_name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {product.pd_price ? product.pd_price.toLocaleString('vi-VN') : '0'} VNĐ
                </span>
                {(product.pd_quantity || 0) > 0 ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckIcon className="h-5 w-5 mr-1" />
                    Còn hàng
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Hết hàng</span>
                )}
              </div>
              
              {/* Category & Brand */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {product.cg_id?.cg_name || 'Chưa phân loại'}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {product.br_id?.br_name || 'Chưa có thương hiệu'}
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed">{product.pd_description}</p>
            </div>

            {/* Color Selection */}
            {availableColors.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Màu sắc</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Số lượng</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.pd_quantity || 0, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  ({product.pd_quantity || 0} sản phẩm có sẵn)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.pd_quantity || 0) === 0 || addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
                
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShareIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={(product.pd_quantity || 0) === 0}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Mua ngay
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Giao hàng nhanh</div>
                    <div className="text-sm text-gray-500">2-3 ngày</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Bảo hành</div>
                    <div className="text-sm text-gray-500">12 tháng</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Đổi trả</div>
                    <div className="text-sm text-gray-500">7 ngày</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}