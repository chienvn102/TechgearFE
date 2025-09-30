'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function CustomerFooter() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h3 className="text-xl font-bold text-primary-400">ECommerce</h3>
            </div>
            <p className="text-neutral-300 text-sm">
              Chuyên cung cấp các sản phẩm thể thao chất lượng cao với giá cả hợp lý. 
              Đem đến trải nghiệm mua sắm tuyệt vời cho khách hàng.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                YouTube
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liên kết nhanh</h4>
            <nav className="space-y-2">
              <Link href="/customer/products" className="block text-neutral-300 hover:text-primary-400 transition-colors text-sm">
                Sản phẩm
              </Link>
              <Link href="/customer/brands" className="block text-neutral-300 hover:text-primary-400 transition-colors text-sm">
                Thương hiệu
              </Link>
              <Link href="/customer/players" className="block text-neutral-300 hover:text-primary-400 transition-colors text-sm">
                Cầu thủ
              </Link>
              <Link href="/customer/about" className="block text-neutral-300 hover:text-primary-400 transition-colors text-sm">
                Về chúng tôi
              </Link>
              <Link href="/customer/contact" className="block text-neutral-300 hover:text-primary-400 transition-colors text-sm">
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hỗ trợ khách hàng</h4>
            <nav className="space-y-2">
              <Link href="/customer/help" className="block text-gray-300 hover:text-orange-400 transition-colors text-sm">
                Hướng dẫn mua hàng
              </Link>
              <Link href="/customer/shipping" className="block text-gray-300 hover:text-orange-400 transition-colors text-sm">
                Chính sách giao hàng
              </Link>
              <Link href="/customer/returns" className="block text-gray-300 hover:text-orange-400 transition-colors text-sm">
                Đổi trả hàng
              </Link>
              <Link href="/customer/warranty" className="block text-gray-300 hover:text-orange-400 transition-colors text-sm">
                Bảo hành
              </Link>
              <Link href="/customer/privacy" className="block text-gray-300 hover:text-orange-400 transition-colors text-sm">
                Chính sách bảo mật
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+84 123 456 789</p>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@sportstore.com</p>
              </div>
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p>Thứ 2 - Thứ 6: 8:00 - 22:00</p>
                  <p>Thứ 7 - CN: 9:00 - 21:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SportStore. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/customer/terms" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                Điều khoản dịch vụ
              </Link>
              <Link href="/customer/privacy" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
