'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  TicketIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { orderService } from '@/features/orders/services/orderService';
import { authService } from '@/features/auth/services/authService';
import { customerService } from '@/features/customers/services/customerService';
import { customerRankingService, CustomerRanking } from '@/features/customers/services/customerRankingService';
import { formatCurrency } from '@/utils/formatters';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { Button } from '@/shared/components/ui/Button';
import { CustomerAddress } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { AddressSelection } from '@/features/address/components/AddressSelection';

// Validation schema
const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự'),
  phone_number: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  email: z.string().email('Email không hợp lệ'),
  shipping_address: z.string().min(10, 'Địa chỉ giao hàng phải có ít nhất 10 ký tự'),
  order_note: z.string().optional(),
  payment_method_id: z.string().min(1, 'Vui lòng chọn phương thức thanh toán'),
  voucher_code: z.string().optional()
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartItem {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
  img?: string;
  color?: string;
  brand?: string;
}

interface VoucherData {
  voucher_code: string;
  voucher_name: string;
  discount_percent: number;
  discount_amount: number;
  max_discount_amount: number;
  min_order_value: number;
  ranking_requirement: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, getSelectedItems, getTotalItems, items } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Cart and voucher state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [rankingDiscount, setRankingDiscount] = useState(0);
  const [customerRanking, setCustomerRanking] = useState<CustomerRanking | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange'
  });

  const watchedFields = watch();

  // Load cart items on mount
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
          router.push('/cart');
          return;
        }

        setCartItems(selectedItems);
        
        // Calculate subtotal
        const total = selectedItems.reduce((sum: number, item: CartItem) => 
          sum + (item.pd_price * item.quantity), 0);
        setSubtotal(total);
      } catch (error) {
        router.push('/cart');
      }
    };

    const loadCustomerRanking = async () => {
      try {
        // Get current customer info
        const customerResponse = await customerService.getCurrentCustomerInfo();
        if (customerResponse.success && customerResponse.data.customer) {
          const customer = customerResponse.data.customer;
          
          // Get customer ranking
          const rankingResponse = await customerRankingService.getCustomerRankings(customer._id);
          
          if (rankingResponse.success && rankingResponse.data.customerRankings.length > 0) {
            const latestRanking = rankingResponse.data.customerRankings[0];
            
            // Check if ranking data is valid
            if (latestRanking && latestRanking.rank_id) {
              setCustomerRanking(latestRanking);
              
              // Calculate ranking discount based on current subtotal
              const discountPercent = latestRanking.rank_id.discount_percent || 0;
              const currentSubtotal = cartItems.reduce((sum: number, item: CartItem) => 
                sum + (item.pd_price * item.quantity), 0);
              const discount = Math.round((currentSubtotal * discountPercent) / 100);
              setRankingDiscount(discount);
              
              } else {
              setCustomerRanking(null);
              setRankingDiscount(0);
            }
          } else {
            setCustomerRanking(null);
            setRankingDiscount(0);
          }
        }
      } catch (error) {
        }
    };

    loadCartItems();
    loadCustomerRanking();
  }, [router]);

  // Update ranking discount when subtotal changes
  useEffect(() => {
    if (customerRanking && customerRanking.rank_id && customerRanking.rank_id.discount_percent > 0) {
      const discountPercent = customerRanking.rank_id.discount_percent;
      const discount = Math.round((subtotal * discountPercent) / 100);
      setRankingDiscount(discount);
    }
  }, [subtotal, customerRanking]);

  // Load customer addresses
  const loadCustomerAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      // Use the new customerAddressService instead of customerService
      const { customerAddressService } = await import('@/features/customers/services/customerAddressService');
      const addresses = await customerAddressService.getCustomerAddresses();
      
      if (addresses && addresses.length > 0) {
        setCustomerAddresses(addresses);
        // Auto-select default address if available, otherwise select first address
        const defaultAddress = addresses.find(addr => addr.is_default);
        const addressToSelect = defaultAddress || addresses[0];
        
        if (addressToSelect) {
          setSelectedAddressId(addressToSelect._id);
          setValue('shipping_address', `${addressToSelect.name} - ${addressToSelect.phone_number} - ${addressToSelect.address}`);
          }
      }
    } catch (error) {
      } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
      const response = await fetch('http://localhost:3000/api/v1/payment-methods/active');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.paymentMethods) {
          setPaymentMethods(data.data.paymentMethods);
          // Auto-select first payment method if available
          if (data.data.paymentMethods.length > 0) {
            setValue('payment_method_id', data.data.paymentMethods[0]._id);
          }
        }
      }
    } catch (error) {
      } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  // Load customer data on mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
        // Fetch full customer details using customerService.getCustomerById
        const customerResponse = await customerService.getCustomerById(user.customer_id._id);
        if (customerResponse.success && customerResponse.data) {
          setValue('customer_name', customerResponse.data.customer.name || '');
          setValue('phone_number', customerResponse.data.customer.phone_number || '');
          setValue('email', customerResponse.data.customer.email || '');
        } else {
          }

        // Load customer addresses (đã được sửa để không cần customerId param)
        await loadCustomerAddresses();
        }
      } catch (error) {
        }
    };

    loadCustomerData();
    loadPaymentMethods();
  }, [setValue]);

  // Handle address selection with useCallback to prevent infinite loop
  const handleAddressSelect = useCallback((address: any) => {
    setSelectedAddressId(address?._id || '');
    setValue('customer_name', address?.name || '');
    setValue('phone_number', address?.phone_number || '');
    setValue('shipping_address', address?.address || '');
  }, [setValue]);

  const steps = [
    { id: 1, title: 'Thông tin khách hàng', icon: UserIcon },
    { id: 2, title: 'Địa chỉ giao hàng', icon: MapPinIcon },
    { id: 3, title: 'Voucher & Thanh toán', icon: CreditCardIcon }
  ];

  // Validate voucher
  const validateVoucher = async (voucherCode: string) => {
    if (!voucherCode.trim()) {
      setVoucherData(null);
      setDiscountAmount(0);
      setVoucherError(null);
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError(null);

    try {
      const response = await orderService.validateVoucher({
        voucher_code: voucherCode,
        order_total: subtotal
      });

      if (response.success) {
        setVoucherData(response.data.voucher);
        setDiscountAmount(response.data.discount_calculated);
        setVoucherError(null);
        } else {
        setVoucherData(null);
        setDiscountAmount(0);
        setVoucherError(response.message);
      }
    } catch (error: any) {
      setVoucherData(null);
      setDiscountAmount(0);
      
      // Show specific error message based on response
      if (error?.response?.data?.message) {
        setVoucherError(error.response.data.message);
      } else if (error?.message) {
        setVoucherError(error.message);
      } else {
        setVoucherError('Có lỗi xảy ra khi kiểm tra voucher');
      }
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Handle voucher code change
  const handleVoucherChange = (voucherCode: string) => {
    setVoucherInput(voucherCode);
    setValue('voucher_code', voucherCode);
    
    // Clear previous error when user starts typing
    if (voucherError) {
      setVoucherError(null);
    }
    
    // Only validate if voucher code is not empty
    if (voucherCode.trim()) {
      validateVoucher(voucherCode);
    } else {
      // Clear voucher data when input is empty
      setVoucherData(null);
      setDiscountAmount(0);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Bạn có chắc chắn muốn đặt hàng?');
    if (!confirmed) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      if (cartItems.length === 0) {
        setError('Giỏ hàng trống');
        return;
      }

      // Prepare order data
      const orderData = {
        customer_name: data.customer_name,
        phone_number: data.phone_number,
        email: data.email && data.email.trim() !== '' ? data.email : 'guest@example.com',
        shipping_address: data.shipping_address,
        payment_method_id: data.payment_method_id,
        order_note: data.order_note || '',
        voucher_code: data.voucher_code && data.voucher_code.trim() !== '' ? data.voucher_code : undefined,
        items: cartItems.map((item) => ({
          pd_id: item.pd_id || item._id,
          pd_name: item.pd_name,
          pd_price: item.pd_price,
          quantity: item.quantity
        }))
      };

      const result = await orderService.checkout(orderData);
      
      if (result.success) {
        setOrderData(result.data);
        setSuccess(true);
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push(`/orders/${result.data.order.od_id}`);
        }, 3000);
    } else {
        setError(result.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return watchedFields.customer_name && watchedFields.phone_number && watchedFields.email;
      case 2:
        return watchedFields.shipping_address;
      case 3:
        return watchedFields.payment_method_id;
      default:
        return false;
    }
  };

  // Calculate totals
  const totalDiscount = discountAmount + rankingDiscount;
  const tax = Math.round(subtotal * 0.1); // Thuế tính từ subtotal, không từ số tiền sau giảm giá
  const finalTotal = subtotal - totalDiscount + tax;

  if (success && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
        >
        <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-4">
              Đơn hàng <span className="font-semibold">{orderData.order.od_id}</span> đã được tạo thành công.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Bạn sẽ được chuyển hướng đến trang chi tiết đơn hàng...
            </p>
            <Button
              onClick={() => router.push(`/orders/${orderData.order.od_id}`)}
              className="w-full"
            >
              Xem chi tiết đơn hàng
            </Button>
        </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
      {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      const isValidStep = isStepValid(step.id);

                      return (
                        <div key={step.id} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isActive
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : isCompleted
                                  ? 'bg-green-600 border-green-600 text-white'
                                  : isValidStep
                                  ? 'bg-gray-100 border-gray-300 text-gray-600'
                                  : 'bg-gray-50 border-gray-200 text-gray-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 text-center ${
                              isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </span>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mx-4 ${
                              isCompleted ? 'bg-green-600' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
          <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                      <p className="text-red-800">{error}</p>
                    </div>
          </motion.div>
                )}

                {/* Form Content */}
                <div className="space-y-6">
          <motion.div
                    key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    {/* Step 1: Customer Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <UserIcon className="h-6 w-6 mr-3 text-blue-600" />
                          Thông tin khách hàng
                        </h2>
                        
                        {/* Customer Ranking Info */}
                        {customerRanking && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg">
                                    {customerRanking.rank_id?.rank_name === 'Thành viên Đồng' ? '🥉' :
                                     customerRanking.rank_id?.rank_name === 'Thành viên Bạc' ? '🥈' :
                                     customerRanking.rank_id?.rank_name === 'Thành viên Vàng' ? '🥇' :
                                     customerRanking.rank_id?.rank_name === 'Thành viên Bạch Kim' ? '💎' : '⭐'}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {customerRanking.rank_id?.rank_name || 'Không xác định'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Giảm giá {customerRanking.rank_id?.discount_percent || 0}% cho đơn hàng này
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">
                                  -{formatCurrency(rankingDiscount)}
                                </p>
                                <p className="text-xs text-gray-500">Tiết kiệm</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Họ và tên *
                            </label>
                            <input
                              {...register('customer_name')}
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nhập họ và tên"
                            />
                            {errors.customer_name && (
                              <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số điện thoại *
                            </label>
                            <input
                              {...register('phone_number')}
                              type="tel"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nhập số điện thoại"
                            />
                            {errors.phone_number && (
                              <p className="text-red-600 text-sm mt-1">{errors.phone_number.message}</p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input
                              {...register('email')}
                              type="email"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nhập email"
                            />
                            {errors.email && (
                              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Shipping Address */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <AddressSelection
                          onAddressSelect={handleAddressSelect}
                          selectedAddressId={selectedAddressId}
                        />

                        {/* Manual Address Input (fallback) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ giao hàng (nếu không có địa chỉ đã lưu) *
                          </label>
                          <textarea
                            {...register('shipping_address')}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập địa chỉ giao hàng chi tiết"
                          />
                          {errors.shipping_address && (
                            <p className="text-red-600 text-sm mt-1">{errors.shipping_address.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú đơn hàng
                          </label>
                          <textarea
                            {...register('order_note')}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
              />
            </div>
                      </div>
                    )}

                    {/* Step 3: Voucher & Payment */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <CreditCardIcon className="h-6 w-6 mr-3 text-blue-600" />
                          Voucher & Thanh toán
                        </h2>

                        {/* Voucher Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <TicketIcon className="h-5 w-5 text-purple-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Mã giảm giá</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={voucherInput}
                                placeholder="Nhập mã giảm giá"
                                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                  voucherError 
                                    ? 'border-red-300 bg-red-50' 
                                    : voucherData 
                                      ? 'border-green-300 bg-green-50' 
                                      : 'border-gray-300'
                                }`}
                                onChange={(e) => handleVoucherChange(e.target.value)}
                              />
                              {isValidatingVoucher && (
                                <div className="flex items-center px-4">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                                </div>
                              )}
                              {voucherInput && !isValidatingVoucher && (
                                <button
                                  type="button"
                                  onClick={() => handleVoucherChange('')}
                                  className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Xóa mã giảm giá"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              )}
                            </div>

                            {voucherError && (
                              <div className="flex items-center gap-2 text-red-600 text-sm">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <span>{voucherError}</span>
                              </div>
                            )}
                          </div>

                          {voucherData && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-green-800 font-medium">{voucherData.voucher_name}</p>
                                  <p className="text-green-600 text-sm">
                                    Giảm {formatCurrency(discountAmount)}
                                  </p>
                                </div>
                                <CheckIcon className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phương thức thanh toán *
                          </label>
                          {isLoadingPaymentMethods ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600">Đang tải phương thức thanh toán...</span>
                            </div>
                          ) : (
                            <select
                              {...register('payment_method_id')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Chọn phương thức thanh toán</option>
                              {paymentMethods && Array.isArray(paymentMethods) && paymentMethods.map((method) => (
                                <option key={method._id} value={method._id}>
                                  {method.pm_name}
                                </option>
                              ))}
                            </select>
                          )}
                          {errors.payment_method_id && (
                            <p className="text-red-600 text-sm mt-1">{errors.payment_method_id.message}</p>
                          )}
                        </div>
                      </div>
                    )}
          </motion.div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-6 py-3"
                    >
                      Quay lại
                    </Button>

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextStep();
                        }}
                        disabled={!isStepValid(currentStep)}
                        className="px-6 py-3"
                      >
                        Tiếp tục
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={async () => {
                          const formData = watch();
                          await onSubmit(formData);
                        }}
                        disabled={isSubmitting || !isValid}
                        className="px-6 py-3"
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Hoàn thành đơn hàng'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                
                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item._id}-${item.color}`} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <SafeImage
                          src={item.img}
                          alt={item.pd_name}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded-lg border border-gray-200"
                          fallbackSrc="/images/placeholder-product.svg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.pd_name}
                        </h3>
                        {item.color && item.color !== 'default' && (
                          <p className="text-xs text-gray-500">Màu: {item.color}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">Số lượng: {item.quantity}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.pd_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {rankingDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Giảm giá thành viên ({customerRanking?.rank_id.rank_name})
                      </span>
                      <span className="text-blue-600 font-medium">-{formatCurrency(rankingDiscount)}</span>
                    </div>
                  )}
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá voucher</span>
                      <span className="text-green-600 font-medium">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế (10%)</span>
                    <span className="text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
        </div>
            </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
