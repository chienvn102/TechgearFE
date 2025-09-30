'use client';

import { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface PaymentMethodSelectorProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

interface PaymentMethod {
  _id: string;
  pm_id: string;
  pm_name: string;
  pm_img?: string;
  description?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  register,
  errors,
  setValue
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      setLoading(true);
      try {
        // TODO: Load from API - Using valid ObjectIds for now
        const mockMethods: PaymentMethod[] = [
          {
            _id: '507f1f77bcf86cd799439011',
            pm_id: 'COD',
            pm_name: 'Thanh toán khi nhận hàng (COD)',
            description: 'Thanh toán bằng tiền mặt khi nhận hàng'
          },
          {
            _id: '507f1f77bcf86cd799439012',
            pm_id: 'BANK_TRANSFER',
            pm_name: 'Chuyển khoản ngân hàng',
            description: 'Chuyển khoản qua ngân hàng'
          },
          {
            _id: '507f1f77bcf86cd799439013',
            pm_id: 'MOMO',
            pm_name: 'Ví MoMo',
            description: 'Thanh toán qua ví điện tử MoMo'
          },
          {
            _id: '507f1f77bcf86cd799439014',
            pm_id: 'ZALOPAY',
            pm_name: 'ZaloPay',
            description: 'Thanh toán qua ZaloPay'
          }
        ];
        setPaymentMethods(mockMethods);
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    // Find the method to get its _id
    const method = paymentMethods.find(m => m.pm_id === methodId);
    if (method) {
      setValue('payment_method_id', method._id);
    }
  };

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'COD':
        return <BanknotesIcon className="h-6 w-6" />;
      case 'BANK_TRANSFER':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'MOMO':
      case 'ZALOPAY':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      default:
        return <CreditCardIcon className="h-6 w-6" />;
    }
  };

  const getMethodColor = (methodId: string) => {
    switch (methodId) {
      case 'COD':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'BANK_TRANSFER':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'MOMO':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'ZALOPAY':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <CreditCardIcon className="h-6 w-6 mr-3 text-blue-600" />
          Phương thức thanh toán
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <CreditCardIcon className="h-6 w-6 mr-3 text-blue-600" />
        Phương thức thanh toán
      </h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method._id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.pm_id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleMethodSelect(method.pm_id)}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${getMethodColor(method.pm_id)}`}>
                {getMethodIcon(method.pm_id)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{method.pm_name}</h3>
                {method.description && (
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  {...register('payment_method_id')}
                  type="radio"
                  value={method._id}
                  checked={selectedMethod === method.pm_id}
                  onChange={() => handleMethodSelect(method.pm_id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors.payment_method_id && (
        <p className="text-red-600 text-sm mt-2">{errors.payment_method_id.message}</p>
      )}

      {/* Payment Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Thông tin bảo mật</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tất cả thông tin thanh toán được mã hóa SSL 256-bit</li>
          <li>• Chúng tôi không lưu trữ thông tin thẻ tín dụng</li>
          <li>• Giao dịch được bảo vệ bởi các ngân hàng đối tác</li>
        </ul>
      </div>
    </div>
  );
};
