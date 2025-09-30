'use client';

import { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { MapPinIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

interface AddressFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

interface Address {
  _id: string;
  name: string;
  phone_number: string;
  address: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  register,
  errors,
  setValue
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load saved addresses (mock data for now)
  useEffect(() => {
    // TODO: Load from API
    const mockAddresses: Address[] = [
      {
        _id: '1',
        name: 'Nguyễn Văn A',
        phone_number: '0123456789',
        address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM'
      },
      {
        _id: '2',
        name: 'Trần Thị B',
        phone_number: '0987654321',
        address: '456 Đường XYZ, Phường 2, Quận 2, TP.HCM'
      }
    ];
    setAddresses(mockAddresses);
  }, []);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address._id);
    setValue('shipping_address', address.address);
    setValue('customer_name', address.name);
    setValue('phone_number', address.phone_number);
  };

  const handleNewAddress = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <MapPinIcon className="h-6 w-6 mr-3 text-blue-600" />
        Địa chỉ giao hàng
      </h2>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Địa chỉ đã lưu</h3>
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddressId === address._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{address.name}</h4>
                    {selectedAddressId === address._id && (
                      <CheckIcon className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{address.phone_number}</p>
                  <p className="text-sm text-gray-700 mt-1">{address.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Address Button */}
      <button
        type="button"
        onClick={handleNewAddress}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <PlusIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <span className="text-sm font-medium text-gray-600">Thêm địa chỉ mới</span>
      </button>

      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Địa chỉ mới</h3>
          
          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ giao hàng *
              </label>
              <textarea
                {...register('shipping_address')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              />
              {errors.shipping_address && (
                <p className="text-red-600 text-sm mt-1">{errors.shipping_address.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowNewAddressForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Save new address to API
                  setShowNewAddressForm(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Address Input (if no address selected) */}
      {!selectedAddressId && !showNewAddressForm && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ giao hàng *
            </label>
            <textarea
              {...register('shipping_address')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
            />
            {errors.shipping_address && (
              <p className="text-red-600 text-sm mt-1">{errors.shipping_address.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
