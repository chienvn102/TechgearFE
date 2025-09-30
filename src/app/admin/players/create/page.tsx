'use client';

// 🏈 PLAYER CREATE PAGE - Admin Interface
// Single Image Upload for Player Management

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/utils/imageUtils';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { CreatePlayerData } from '@/features/players/types/player.types';
import { playerService } from '@/features/players/services/playerService';

export default function CreatePlayerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePlayerData>({
    player_name: '',
    player_img: '',
    player_content: '',
    role: '',
    team_name: '',
    achievements: '',
    is_active: true
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof CreatePlayerData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.player_name.trim()) {
      newErrors.player_name = 'Tên player là bắt buộc';
    }

    if (!formData.role?.trim()) {
      newErrors.role = 'Role là bắt buộc';
    }

    if (!formData.team_name?.trim()) {
      newErrors.team_name = 'Tên đội là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload - Store file temporarily for after create
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Store file for upload after player creation
    setImageFile(file);

    // Create preview 
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, player_img: '' }));
    setPreviewImage('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Map frontend fields to backend expected fields
      const playerData: any = {
        player_name: formData.player_name,
        player_position: formData.role, // Map role to player_position
        player_team: formData.team_name, // Map team_name to player_team
        player_content: formData.player_content,
        achievements: formData.achievements,
        is_active: formData.is_active
      };

      // Only include player_image if it has a valid value
      if (formData.player_img && formData.player_img.trim()) {
        playerData.player_image = formData.player_img;
      }

      const response = await playerService.createPlayer(playerData);
      
      if (response.success && response.data) {
        // Backend returns: { success: true, data: { player: {...} } }
        const playerData = (response.data as any).player || response.data;
        // Upload image if selected
        if (imageFile && playerData?._id) {
          try {
            await playerService.uploadPlayerImage(imageFile, playerData._id);
            } catch (imgError) {
            }
        }
        
        router.push('/admin/players');
      }
    } catch (error) {
      alert('Lỗi khi tạo player. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/players">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thêm Player Mới</h1>
          <p className="text-gray-600">Tạo thông tin player mới trong hệ thống</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Ảnh Player</h3>
              
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  {(previewImage || formData.player_img) && (previewImage || formData.player_img)?.trim() ? (
                    <div className="relative group">
                      <SafeImage
                        src={previewImage || formData.player_img}
                        alt="Preview"
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        fallbackSrc="/placeholder-player.jpg"
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center">
                        Click để chọn ảnh player<br />
                        <span className="text-sm">PNG, JPG up to 5MB</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageUploading ? 'Đang tải...' : 'Chọn ảnh mới'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Thông tin Player</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Player *
                  </label>
                  <input
                    type="text"
                    name="player_name"
                    value={formData.player_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.player_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên player"
                  />
                  {errors.player_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.player_name}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Nhập role của player..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đội *
                  </label>
                  <input
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.team_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên đội"
                  />
                  {errors.team_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.team_name}</p>
                  )}
                </div>

                {/* Player Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả Player
                  </label>
                  <textarea
                    name="player_content"
                    value={formData.player_content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mô tả về player..."
                  />
                </div>

                {/* Achievements */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành tích
                  </label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập thành tích của player..."
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Player đang hoạt động</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <Link href="/admin/players">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {loading ? 'Đang tạo...' : 'Tạo Player'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
