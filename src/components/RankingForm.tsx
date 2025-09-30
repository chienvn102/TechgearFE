'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Validation schema
const rankingSchema = z.object({
  rank_id: z.string().min(1, 'Mã ranking là bắt buộc'),
  rank_name: z.string().min(1, 'Tên ranking là bắt buộc'),
  min_spending: z.number().min(0, 'Mức chi tiêu tối thiểu phải >= 0'),
  max_spending: z.number().min(0, 'Mức chi tiêu tối đa phải >= 0'),
  discount_percent: z.number().min(0, 'Phần trăm giảm giá phải >= 0').max(100, 'Phần trăm giảm giá phải <= 100'),
  benefits: z.array(z.string()).min(1, 'Phải có ít nhất 1 quyền lợi'),
  is_active: z.boolean()
});

type RankingFormData = z.infer<typeof rankingSchema>;

interface RankingFormProps {
  ranking?: any;
  onClose: () => void;
  onSave: (data: RankingFormData) => void;
  isOpen: boolean;
}

export const RankingForm: React.FC<RankingFormProps> = ({
  ranking,
  onClose,
  onSave,
  isOpen
}) => {
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [newBenefit, setNewBenefit] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<RankingFormData>({
    resolver: zodResolver(rankingSchema),
    mode: 'onChange',
    defaultValues: {
      rank_id: ranking?.rank_id || '',
      rank_name: ranking?.rank_name || '',
      min_spending: ranking?.min_spending || 0,
      max_spending: ranking?.max_spending || 0,
      discount_percent: ranking?.discount_percent || 0,
      benefits: ranking?.benefits || [''],
      is_active: ranking?.is_active ?? true
    }
  });

  const watchedValues = watch();

  // Initialize benefits when ranking changes
  useEffect(() => {
    if (ranking?.benefits) {
      setBenefits(ranking.benefits);
    } else {
      setBenefits(['']);
    }
  }, [ranking]);

  // Update form benefits when benefits array changes
  useEffect(() => {
    setValue('benefits', benefits.filter(b => b.trim() !== ''));
  }, [benefits, setValue]);

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const onSubmit = (data: RankingFormData) => {
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {ranking ? 'Sửa Ranking' : 'Tạo Ranking Mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã Ranking *
              </label>
              <input
                {...register('rank_id')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: BRONZE, SILVER, GOLD"
              />
              {errors.rank_id && (
                <p className="text-red-500 text-sm mt-1">{errors.rank_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Ranking *
              </label>
              <input
                {...register('rank_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Đồng, Bạc, Vàng"
              />
              {errors.rank_name && (
                <p className="text-red-500 text-sm mt-1">{errors.rank_name.message}</p>
              )}
            </div>
          </div>

          {/* Spending Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức chi tiêu tối thiểu (VNĐ) *
              </label>
              <input
                {...register('min_spending', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              {errors.min_spending && (
                <p className="text-red-500 text-sm mt-1">{errors.min_spending.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức chi tiêu tối đa (VNĐ) *
              </label>
              <input
                {...register('max_spending', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000000"
              />
              {errors.max_spending && (
                <p className="text-red-500 text-sm mt-1">{errors.max_spending.message}</p>
              )}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phần trăm giảm giá (%) *
            </label>
            <input
              {...register('discount_percent', { valueAsNumber: true })}
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
            {errors.discount_percent && (
              <p className="text-red-500 text-sm mt-1">{errors.discount_percent.message}</p>
            )}
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyền lợi *
            </label>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Miễn phí vận chuyển"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thêm quyền lợi mới"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {errors.benefits && (
              <p className="text-red-500 text-sm mt-1">{errors.benefits.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Kích hoạt ranking này
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {ranking ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
