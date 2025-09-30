'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { ImageUpload } from '@/components/ImageUpload';
import { postService } from '@/features/posts/services/postService';
import { postUploadService } from '@/services/postUploadService';

interface CreatePostData {
  post_id: string;
  post_img?: string;
  post_title: string;
  post_content: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePostData>({
    post_id: '',
    post_img: '',
    post_title: '',
    post_content: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Generate post ID from title
  const generatePostId = (title: string): string => {
    return 'POST' + Date.now() + title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  };

  // Handle image selection for preview
  const handleImageUpload = async (file: File): Promise<void> => {
    try {
      // Store file for later upload
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      } catch (error) {
      throw error;
    }
  };

  // Handle image delete
  const handleImageDelete = async (): Promise<void> => {
    try {
      setImageFile(null);
      setImagePreview('');
      setFormData(prev => ({
        ...prev,
        post_img: ''
      }));
      } catch (error) {
      throw error;
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.post_id?.trim()) {
      newErrors.post_id = 'ID bài viết là bắt buộc';
    }

    if (!formData.post_title?.trim()) {
      newErrors.post_title = 'Tiêu đề bài viết là bắt buộc';
    } else if (formData.post_title.trim().length < 3) {
      newErrors.post_title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }

    if (!formData.post_content?.trim()) {
      newErrors.post_content = 'Nội dung bài viết là bắt buộc';
    } else if (formData.post_content.trim().length < 10) {
      newErrors.post_content = 'Nội dung phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Step 1: Create post first
      const finalData = {
        ...formData,
        post_img: '' // Will be updated after image upload
      };

      const response = await postService.createPost(finalData);
      
      if (response.success) {
        // Step 2: Upload image if selected
        if (imageFile) {
          try {
            const uploadResponse = await postUploadService.uploadPostImage(formData.post_id, imageFile);
            alert('Tạo bài viết và upload ảnh thành công!');
          } catch (uploadError) {
            alert('Tạo bài viết thành công, nhưng upload ảnh thất bại. Bạn có thể thêm ảnh sau.');
          }
        } else {
          alert('Tạo bài viết thành công!');
        }
        
        // Redirect to posts list
        router.push('/admin/posts');
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.message?.includes('E11000')) {
        setErrors({ post_id: 'ID bài viết đã tồn tại' });
      } else {
        alert('Lỗi khi tạo bài viết: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePostData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate post_id when title changes
    if (field === 'post_title' && value && !formData.post_id) {
      setFormData(prev => ({
        ...prev,
        post_id: generatePostId(value)
      }));
    }

    // Clear errors when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Bài Viết Mới</h1>
          <p className="text-gray-600 mt-1">Thêm bài viết mới vào hệ thống</p>
        </div>
        
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/posts')}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Quay lại</span>
        </Button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post ID */}
            <div>
              <Input
                label="ID Bài Viết"
                value={formData.post_id}
                onChange={(e) => handleInputChange('post_id', e.target.value)}
                error={errors.post_id}
                placeholder="Ví dụ: POST001"
                required
              />
            </div>

            {/* Post Title */}
            <div>
              <Input
                label="Tiêu Đề Bài Viết"
                value={formData.post_title}
                onChange={(e) => handleInputChange('post_title', e.target.value)}
                error={errors.post_title}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            {/* Post Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội Dung Bài Viết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.post_content}
                onChange={(e) => handleInputChange('post_content', e.target.value)}
                rows={8}
                className={`
                  w-full px-3 py-2 border rounded-lg shadow-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.post_content ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="Nhập nội dung bài viết..."
                required
              />
              {errors.post_content && (
                <p className="text-red-500 text-sm mt-1">{errors.post_content}</p>
              )}
            </div>

            {/* Image Upload Section */}
            <div>
              <ImageUpload
                currentImage={imagePreview}
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
                loading={false}
                label="Ảnh Bài Viết (Tuỳ chọn)"
                description="PNG, JPG, JPEG hoặc WEBP (tối đa 5MB). Ảnh sẽ được upload sau khi tạo bài viết."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/admin/posts')}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-5 h-5" />
                <span>{imageFile ? 'Tạo Bài Viết & Upload Ảnh' : 'Tạo Bài Viết'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
