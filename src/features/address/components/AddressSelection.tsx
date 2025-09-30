'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  PlusIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { AddressInput } from './AddressInput';
import { customerAddressService, CustomerAddress } from '../../customers/services/customerAddressService';
import { AddressData } from '../services/addressService';

interface AddressSelectionProps {
  onAddressSelect: (address: CustomerAddress | null) => void;
  selectedAddressId?: string;
  className?: string;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  onAddressSelect,
  selectedAddressId,
  className = ''
}) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [newAddressData, setNewAddressData] = useState<Partial<AddressData>>({});
  const [formData, setFormData] = useState({
    name: '',
    phone_number: ''
  });

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Set selected address
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const selected = addresses.find(addr => addr._id === selectedAddressId);
      if (selected) {
        onAddressSelect(selected);
      }
    }
  }, [selectedAddressId, addresses, onAddressSelect]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await customerAddressService.getCustomerAddresses();
      
      // Sort addresses: default first, then by creation date
      const sortedData = data.sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      
      setAddresses(sortedData);
      
      // Always auto-select default address when addresses are loaded
      if (sortedData.length > 0) {
        const defaultAddress = sortedData.find(addr => addr.is_default);
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        } else {
          // If no default address, select the first one
          onAddressSelect(sortedData[0]);
        }
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = useCallback((addressData: AddressData | null) => {
    setNewAddressData(addressData);
  }, []);

  const handleSaveAddress = async () => {
    if (!(newAddressData?.address || newAddressData?.full_address) || !formData.name || !formData.phone_number) {
      return;
    }

    try {
      const addressPayload = {
        name: formData.name,
        phone_number: formData.phone_number,
        address: newAddressData.address || newAddressData.full_address,
        is_default: addresses.length === 0 // First address is default
      };

      if (editingAddress) {
        // Update existing address
        await customerAddressService.updateAddress(editingAddress._id, addressPayload);
      } else {
        // Create new address
        await customerAddressService.createAddress(addressPayload);
      }

      // Reset form
      setFormData({ name: '', phone_number: '' });
      setNewAddressData({});
      setShowNewAddressForm(false);
      setEditingAddress(null);
      
      // Reload addresses
      await loadAddresses();
    } catch (error) {
      }
  };

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone_number: address.phone_number
    });
    
    // Parse existing address (simple parsing)
    if (address.address) {
      const parts = address.address.split(', ');
      if (parts.length >= 4) {
        setNewAddressData({
          house_number: parts[0].split(' ')[0] || '',
          street: parts[0].substring(parts[0].split(' ')[0].length).trim(),
          ward: parts[1] || '',
          district: parts[2] || '',
          province: parts[3] || '',
          address: address.address
        });
      }
    }
    
    setShowNewAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      await customerAddressService.deleteAddress(addressId);
      await loadAddresses();
    } catch (error) {
      }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await customerAddressService.setDefaultAddress(addressId);
      await loadAddresses();
      
      // Show success message
      const address = addresses.find(addr => addr._id === addressId);
      if (address) {
        alert(`Đã đặt "${address.name}" làm địa chỉ mặc định`);
      }
    } catch (error: any) {
      alert(`Có lỗi xảy ra: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  const handleSelectAddress = (address: CustomerAddress) => {
    onAddressSelect(address);
  };

  const canSaveAddress = (newAddressData?.address || newAddressData?.full_address) && formData.name && formData.phone_number;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Địa chỉ nhận hàng</h3>
        </div>
        <button
          onClick={() => {
            setShowNewAddressForm(true);
            setEditingAddress(null);
            setFormData({ name: '', phone_number: '' });
            setNewAddressData({});
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Existing Addresses */}
      {!showNewAddressForm && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tải địa chỉ...</p>
            </div>
          ) : addresses.length > 0 ? (
            addresses.map((address) => (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === address._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{address.name}</h4>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Mặc định
                        </span>
                      )}
                      {selectedAddressId === address._id && (
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.phone_number}</p>
                    <p className="text-sm text-gray-700">{address.address || 'Địa chỉ không xác định'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Temporarily hidden - will be configured later */}
                    {/* {!address.is_default && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address._id);
                        }}
                        className="px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="Đặt làm địa chỉ mặc định"
                      >
                        Đặt mặc định
                      </button>
                    )} */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(address);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address._id);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPinIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có địa chỉ nào</p>
              <p className="text-sm">Hãy thêm địa chỉ để tiếp tục</p>
            </div>
          )}
        </div>
      )}

      {/* New Address Form */}
      <AnimatePresence>
        {showNewAddressForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h4>
              <button
                onClick={() => {
                  setShowNewAddressForm(false);
                  setEditingAddress(null);
                  setFormData({ name: '', phone_number: '' });
                  setNewAddressData({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên người nhận *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên người nhận"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address Input */}
            <AddressInput
              onAddressChange={handleAddressChange}
              initialAddress={newAddressData}
              className="mb-4"
            />

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewAddressForm(false);
                  setEditingAddress(null);
                  setFormData({ name: '', phone_number: '' });
                  setNewAddressData({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={!canSaveAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingAddress ? 'Cập nhật' : 'Lưu địa chỉ'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
