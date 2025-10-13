'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  CogIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

// Import components
import Header from '../components/Header';
import ProductTypeGrid from '../components/ProductTypeGrid';
import FeaturedProducts from '../components/FeaturedProducts';
import BrandGrid from '../components/BrandGrid';
import HeroBanner from '../components/HeroBanner';
import PromotionalBanner from '../components/PromotionalBanner';
import BlogSection from '../components/BlogSection';
import { FAQSection } from '../components/FAQSection';
import ClientOnlyWrapper from '../components/ClientOnlyWrapper';
import { Category, Player, Brand } from '../lib/api';
import { Product } from '../features/products/types/product.types';
import { ProductType } from '@/features/products/services/productTypeService';
import { authService } from '@/features/auth/services/authService';
import { suppressHydrationWarning } from '../utils/suppressHydrationWarning';

export default function HomePage() {
  const router = useRouter();

  // Suppress hydration warnings caused by browser extensions
  suppressHydrationWarning();

  // Handle product type click
  const handleProductTypeClick = (productType: ProductType) => {
    router.push(`/products?productType=${productType.pdt_id}`);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    router.push(`/products/${product._id}`);
  };

  // Handle player click
  const handlePlayerClick = (player: Player) => {
    router.push(`/products?player=${player.player_id}`);
  };

  // Handle brand click
  const handleBrandClick = (brand: Brand) => {
    router.push(`/products?brand=${brand._id}`);
  };

  // Handle view all products
  const handleViewAllProducts = () => {
    router.push('/products');
  };

  // Handle post click
  const handlePostClick = (post: any) => {
    // Navigate to post detail page (you can create this later)
    // router.push(`/posts/${post._id}`);
  };

  // Handle view all posts
  const handleViewAllPosts = () => {
    // Navigate to posts page (you can create this later)
    // router.push('/posts');
  };

  const features = [
    {
      icon: ShoppingBagIcon,
      title: 'Mua sắm dễ dàng',
      description: 'Giao diện thân thiện, dễ sử dụng'
    },
    {
      icon: TruckIcon,
      title: 'Giao hàng nhanh',
      description: 'Giao hàng toàn quốc trong 24h'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết sản phẩm chính hãng 100%'
    },
    {
      icon: SparklesIcon,
      title: 'Chất lượng cao',
      description: 'Sản phẩm chất lượng, bền bỉ'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" suppressHydrationWarning>
      {/* Use Header component with dropdown functionality */}
      <Header />

      <ClientOnlyWrapper fallback={
        <main>
          {/* Simple fallback content */}
          <section className="py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
            </div>
          </section>
        </main>
      }>
        <main>
          {/* Promotional Banner - Banner quảng cáo sản phẩm */}
          <PromotionalBanner 
            autoSlide={true}
            slideInterval={5000}
          />

          {/* Brand Grid - Danh sách thương hiệu nổi bật */}
          <BrandGrid
            maxBrands={8}
            onBrandClick={handleBrandClick}
          />

          {/* Hero Banner - Banner chính với thông tin tuyển thủ - TẠM ẨN */}
          {/* <HeroBanner
            maxPlayers={5}
            onPlayerClick={handlePlayerClick}
          /> */}

          {/* Features Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Tại sao chọn chúng tôi?
                </h2>
                <p className="text-gray-600 text-lg">
                  Cam kết mang đến trải nghiệm mua sắm tốt nhất
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Products Section - ĐÃ CHUYỂN LÊN TRƯỚC */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sản phẩm nổi bật
                </h2>
                <p className="text-gray-600 text-lg">
                  Những mẫu áo đấu được yêu thích nhất
                </p>
              </div>
              
              <FeaturedProducts
                maxProducts={8}
                showViewAll={true}
                onViewAll={handleViewAllProducts}
                onProductClick={handleProductClick}
              />
            </div>
          </section>

          {/* Categories Section - ĐÃ CHUYỂN XUỐNG SAU */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Loại sản phẩm
                </h2>
                <p className="text-gray-600 text-lg">
                  Khám phá các loại sản phẩm đa dạng
                </p>
              </div>
              
              <ProductTypeGrid
                maxProductTypes={4}
                onProductTypeClick={handleProductTypeClick}
              />
            </div>
          </section>

          {/* Blog Section */}
          <BlogSection
            maxPosts={3}
            onPostClick={handlePostClick}
            onViewAll={handleViewAllPosts}
          />

          {/* FAQ Section */}
          <FAQSection />

          {/* Newsletter Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Đăng ký nhận thông tin
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Nhận thông báo về sản phẩm mới và ưu đãi đặc biệt
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </ClientOnlyWrapper>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">TechGear</span>
              </div>
              <p className="text-gray-400 mb-4">
                Cửa hàng Gaming Gear chính hãng với chất lượng tốt nhất.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => router.push('/products')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sản phẩm
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/categories')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Danh mục
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/players')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Tuyển thủ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => router.push('/brands')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Thương hiệu
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Liên hệ
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Chính sách giao hàng
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Chính sách đổi trả
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Chính sách bảo mật
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
              <div className="space-y-2 text-gray-400">
                <p>127 Phùng Khoang</p>
                <p>0961108937</p>
                <p>chienvn102@gmail.com</p>
                <p>8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TechGear. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
