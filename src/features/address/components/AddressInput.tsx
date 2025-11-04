'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ChevronDownIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { addressService, AddressData, Province, District, Ward } from '../services/addressService';

interface AddressInputProps {
  onAddressChange: (address: AddressData | null) => void;
  initialAddress?: Partial<AddressData>;
  className?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  onAddressChange,
  initialAddress,
  className = ''
}) => {
  // States for dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // Selected values (codes)
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  // Selected names
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
  const [selectedWardName, setSelectedWardName] = useState<string>('');
  
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  
  // UI states
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load initial address if provided
  useEffect(() => {
    if (initialAddress) {
      setHouseNumber(initialAddress.house_number || '');
      setStreet(initialAddress.street || '');
      setSelectedProvince(initialAddress.province || '');
      setSelectedDistrict(initialAddress.district || '');
      setSelectedWard(initialAddress.ward || '');
    }
  }, [initialAddress]);

  // Validate and notify parent when address changes
  useEffect(() => {
    const addressData: Partial<AddressData> = {
      house_number: houseNumber,
      street: street,
      ward: selectedWardName,
      district: selectedDistrictName,
      province: selectedProvinceName
    };

    const validation = addressService.validateAddress(addressData);
    setErrors(validation.errors);
    setIsValid(validation.isValid);

    if (validation.isValid) {
      // Create full address with names instead of codes
      const fullAddress = `${houseNumber} ${street}, ${selectedWardName}, ${selectedDistrictName}, ${selectedProvinceName}`;
      onAddressChange({
        ...addressData as AddressData,
        full_address: fullAddress,
        address: fullAddress
      });
    } else {
      onAddressChange(null);
    }
  }, [houseNumber, street, selectedWardName, selectedDistrictName, selectedProvinceName, onAddressChange]);

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const data = await addressService.getProvinces();
      setProvinces(data);
    } catch (error) {
      } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    if (!provinceCode) return;
    
    setLoading(prev => ({ ...prev, districts: true }));
    setDistricts([]);
    setWards([]);
    setSelectedDistrict('');
    setSelectedWard('');
    
    try {
      const data = await addressService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadWards = async (districtCode: string) => {
    if (!districtCode) return;
    
    setLoading(prev => ({ ...prev, wards: true }));
    setWards([]);
    setSelectedWard('');
    
    try {
      const data = await addressService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    const province = provinces.find(p => p.code.toString() === provinceCode);
    setSelectedProvince(provinceCode);
    setSelectedProvinceName(province?.name || '');
    setSelectedDistrict('');
    setSelectedDistrictName('');
    setSelectedWard('');
    setSelectedWardName('');
    setDistricts([]);
    setWards([]);
    loadDistricts(provinceCode);
  };

  const handleDistrictChange = (districtCode: string) => {
    const district = districts.find(d => d.code.toString() === districtCode);
    setSelectedDistrict(districtCode);
    setSelectedDistrictName(district?.name || '');
    setSelectedWard('');
    setSelectedWardName('');
    setWards([]);
    loadWards(districtCode);
  };

  const handleWardChange = (wardCode: string) => {
    const ward = wards.find(w => w.code.toString() === wardCode);
    setSelectedWard(wardCode);
    setSelectedWardName(ward?.name || '');
  };

  const getSelectedProvinceName = () => {
    return provinces.find(p => p.code === selectedProvince)?.name || '';
  };

  const getSelectedDistrictName = () => {
    return districts.find(d => d.code === selectedDistrict)?.name || '';
  };

  const getSelectedWardName = () => {
    return wards.find(w => w.code === selectedWard)?.name || '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MapPinIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Địa chỉ nhận hàng</h3>
        {isValid && (
          <CheckIcon className="w-5 h-5 text-green-500" />
        )}
      </div>

      {/* House Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số nhà *
        </label>
        <input
          type="text"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="Nhập số nhà"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên đường *
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Nhập tên đường"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố *
        </label>
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={loading.provinces}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">
              {loading.provinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
            </option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện *
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedProvince || loading.districts}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100"
          >
            <option value="">
              {loading.districts ? 'Đang tải...' : 'Chọn quận/huyện'}
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Ward Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phường/Xã *
        </label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!selectedDistrict || loading.wards}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100"
          >
            <option value="">
              {loading.wards ? 'Đang tải...' : 'Chọn phường/xã'}
            </option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Address Preview */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Địa chỉ đã hoàn thành:</p>
              <p className="text-sm text-green-700">
                {houseNumber} {street}, {getSelectedWardName()}, {getSelectedDistrictName()}, {getSelectedProvinceName()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Vui lòng hoàn thiện địa chỉ:</p>
              <ul className="text-sm text-red-700 mt-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
