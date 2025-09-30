'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { orderService } from '@/features/orders/services/orderService';
import { authService } from '@/features/auth/services/authService';
import { customerService } from '@/features/customers/services/customerService';
import { AddressForm } from '@/components/AddressForm';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { Button } from '@/shared/components/ui/Button';
import { 
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Validation schema
const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự'),
  phone_number: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  email: z.string().email('Email không hợp lệ'),
  shipping_address: z.string().min(10, 'Địa chỉ giao hàng phải có ít nhất 10 ký tự'),
  order_note: z.string().optional(),
  payment_method_id: z.string().min(1, 'Vui lòng chọn phương thức thanh toán')
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onOrderSuccess: (orderData?: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onFormValidChange?: (isValid: boolean) => void;
  onCurrentStepChange?: (step: number) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onOrderSuccess,
  isSubmitting,
  setIsSubmitting,
  onFormValidChange,
  onCurrentStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);

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

  // Notify parent about form validity changes
  useEffect(() => {
    const isValid = isStepValid(currentStep);
    onFormValidChange?.(isValid);
  }, [currentStep, watchedFields, onFormValidChange]);

  // Notify parent about current step changes
  useEffect(() => {
    onCurrentStepChange?.(currentStep);
  }, [currentStep, onCurrentStepChange]);

  // Load customer data on component mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          // Try to get customer info from API
          try {
            const customerResponse = await customerService.getCurrentCustomerInfo();
            if (customerResponse.success && customerResponse.data.customer) {
              const customer = customerResponse.data.customer;
              setCustomerData(customer);
              
              // Auto-fill form with customer data
              setValue('customer_name', customer.name || '');
              setValue('phone_number', customer.phone_number || '');
              setValue('email', customer.email || '');
              } else {
              setCustomerData(user);
              setValue('customer_name', user.name || '');
              setValue('phone_number', user.phone_number || '');
              setValue('email', user.email || '');
            }
          } catch (apiError) {
            // Fallback to user data if API fails
            setCustomerData(user);
            setValue('customer_name', user.name || '');
            setValue('phone_number', user.phone_number || '');
            setValue('email', user.email || '');
          }
        } else {
          }
      } catch (error) {
        }
    };

    loadCustomerData();
  }, [setValue]);

  const steps = [
    { id: 1, title: 'Thông tin khách hàng', icon: UserIcon },
    { id: 2, title: 'Địa chỉ giao hàng', icon: MapPinIcon },
    { id: 3, title: 'Phương thức thanh toán', icon: CreditCardIcon }
  ];

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Lấy cart items từ localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cartItems.length === 0) {
        setError('Giỏ hàng trống');
        return;
      }

      // Prepare order data with items included
      const orderData = {
        customer_name: data.customer_name,
        phone_number: data.phone_number,
        email: data.email,
        shipping_address: data.shipping_address,
        payment_method_id: data.payment_method_id,
        order_note: data.order_note || '',
        items: cartItems.map((item: any) => ({
          pd_id: item.pd_id || item._id,
          pd_name: item.pd_name,
          pd_price: item.pd_price,
          quantity: item.quantity
        }))
      };

      const result = await orderService.checkout(orderData);
      
      if (result.success) {
        onOrderSuccess(result.data);
        // Clear cart after successful order (moved to parent component)
        // localStorage.removeItem('cart');
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
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onCurrentStepChange?.(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onCurrentStepChange?.(newStep);
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
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Thông tin khách hàng
                </h2>
                {customerData && (
                  <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã tự động điền
                  </div>
                )}
              </div>
              
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
            <AddressForm
              register={register}
              errors={errors}
              setValue={setValue}
            />
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <PaymentMethodSelector
              register={register}
              errors={errors}
              setValue={setValue}
            />
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

          {currentStep < steps.length && (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-3"
            >
              Tiếp tục
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
