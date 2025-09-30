import { apiClient } from '@/shared/services/api';

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  district_code: string;
}

export interface AddressData {
  house_number: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  full_address: string;
}

class AddressService {
  private baseUrl = 'https://provinces.open-api.vn/api';

  /**
   * Lấy danh sách tỉnh/thành phố
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseUrl}/p/`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      return data.map((item: any) => ({
        code: item.code,
        name: item.name
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách quận/huyện theo tỉnh
   */
  async getDistricts(provinceCode: string): Promise<District[]> {
    try {
      const response = await fetch(`${this.baseUrl}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.districts?.map((item: any) => ({
        code: item.code,
        name: item.name,
        province_code: provinceCode
      })) || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách phường/xã theo quận/huyện
   */
  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      const response = await fetch(`${this.baseUrl}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }
      const data = await response.json();
      return data.wards?.map((item: any) => ({
        code: item.code,
        name: item.name,
        district_code: districtCode
      })) || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo địa chỉ đầy đủ từ các thành phần
   */
  createFullAddress(addressData: Partial<AddressData>): string {
    const { house_number, street, ward, district, province } = addressData;
    
    if (!house_number || !street || !ward || !district || !province) {
      return '';
    }

    return `${house_number} ${street}, ${ward}, ${district}, ${province}`;
  }

  /**
   * Validate địa chỉ
   */
  validateAddress(addressData: Partial<AddressData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!addressData.house_number?.trim()) {
      errors.push('Số nhà không được để trống');
    }

    if (!addressData.street?.trim()) {
      errors.push('Tên đường không được để trống');
    }

    // Check ward - can be either code or name
    if (!addressData.ward?.trim()) {
      errors.push('Vui lòng chọn phường/xã');
    }

    // Check district - can be either code or name
    if (!addressData.district?.trim()) {
      errors.push('Vui lòng chọn quận/huyện');
    }

    // Check province - can be either code or name
    if (!addressData.province?.trim()) {
      errors.push('Vui lòng chọn tỉnh/thành phố');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const addressService = new AddressService();
