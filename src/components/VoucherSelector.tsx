'use client';

import { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { TicketIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { voucherService } from '@/features/vouchers/services/voucherService';

interface VoucherSelectorProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

interface Voucher {
  _id: string;
  voucher_id: string;
  voucher_code: string;
  voucher_name: string;
  discount_percent: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  ranking_id?: string;
}

export const VoucherSelector: React.FC<VoucherSelectorProps> = ({
  register,
  errors,
  setValue
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load available vouchers
  useEffect(() => {
    const loadVouchers = async () => {
      setLoading(true);
      try {
        const response = await voucherService.getAvailableVouchers();
        if (response.success && response.data && response.data.vouchers) {
          setVouchers(response.data.vouchers);
        } else {
          // Fallback to empty array if API fails
          setVouchers([]);
        }
      } catch (error: any) {
        // Don't logout automatically, just show empty vouchers
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, []);

  const handleVoucherSelect = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setValue('voucher_id', voucher._id);
  };

  const handleVoucherRemove = () => {
    setSelectedVoucher(null);
    setValue('voucher_id', '');
  };

  const handleSearchVoucher = async () => {
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    try {
      const response = await voucherService.searchVoucherByCode(searchCode.trim());
      if (response.success && response.data && response.data.voucher) {
        const foundVoucher = response.data.voucher;
        if (isVoucherValid(foundVoucher)) {
          handleVoucherSelect(foundVoucher);
          setSearchCode('');
        } else {
          alert('Voucher đã hết hạn hoặc chưa có hiệu lực');
        }
      } else {
        alert('Không tìm thấy mã voucher hợp lệ');
      }
    } catch (error: any) {
      // Don't logout automatically, just show error message
      alert('Không tìm thấy mã voucher hợp lệ hoặc voucher đã hết hạn');
    } finally {
      setSearchLoading(false);
    }
  };

  const isVoucherValid = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    return now >= startDate && now <= endDate;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TicketIcon className="h-6 w-6 mr-3 text-blue-600" />
          Voucher & Ghi chú
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <TicketIcon className="h-6 w-6 mr-3 text-blue-600" />
        Voucher & Ghi chú
      </h2>

      {/* Voucher Search */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã voucher
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã voucher"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleSearchVoucher}
              disabled={!searchCode.trim() || searchLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {searchLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Selected Voucher */}
        {selectedVoucher && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-900">{selectedVoucher.voucher_name}</h4>
                  <p className="text-sm text-green-700">Mã: {selectedVoucher.voucher_code}</p>
                  {selectedVoucher.discount_percent > 0 && (
                    <p className="text-sm text-green-700">
                      Giảm {selectedVoucher.discount_percent}%
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleVoucherRemove}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Available Vouchers */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Voucher có sẵn</h3>
          {vouchers.map((voucher) => {
            const isValid = isVoucherValid(voucher);
            const isSelected = selectedVoucher?._id === voucher._id;
            
            return (
              <div
                key={voucher._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : isValid
                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => isValid && handleVoucherSelect(voucher)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{voucher.voucher_name}</h4>
                    <p className="text-sm text-gray-600">Mã: {voucher.voucher_code}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      {voucher.discount_percent > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          Giảm {voucher.discount_percent}%
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        Đơn tối thiểu: {voucher.min_order_value.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Notes */}
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
        {errors.order_note && (
          <p className="text-red-600 text-sm mt-1">{errors.order_note.message}</p>
        )}
      </div>
    </div>
  );
};
