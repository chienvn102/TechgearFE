'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';

export default function CustomerHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-blue-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chào mừng đến với ECommerce
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Khám phá bộ sưu tập sản phẩm chất lượng cao với trải nghiệm mua sắm tuyệt vời
            </p>
            <div className="space-x-4">
              <Link href="/customer/products">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Xem sản phẩm
                </Button>
              </Link>
              <Link href="/customer/brands">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-600">
                  Thương hiệu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tại sao chọn SportStore?
          </h2>
          <p className="text-lg text-gray-600">
            Chúng tôi cam kết mang đến những sản phẩm tốt nhất với dịch vụ hoàn hảo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">Chất lượng cao</h3>
              <p className="text-neutral-600">
                Tất cả sản phẩm đều được chọn lọc kỹ càng từ các thương hiệu uy tín
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-blue transition-all duration-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">Giao hàng nhanh</h3>
              <p className="text-neutral-600">
                Giao hàng trong 24-48h với đội ngũ vận chuyển chuyên nghiệp
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-blue transition-all duration-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sẵn sàng khám phá?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Tham gia cùng hàng nghìn khách hàng đã tin tưởng SportStore
            </p>
            <div className="space-x-4">
              <Link href="/auth/register">
                <Button variant="customer" size="lg">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link href="/customer/products">
                <Button variant="outline" size="lg">
                  Xem sản phẩm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
