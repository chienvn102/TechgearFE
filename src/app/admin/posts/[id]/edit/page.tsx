'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { ImageUpload } from '@/components/ImageUpload';
import { postService, type Post } from '@/features/posts/services/postService';
import { postUploadService } from '@/services/postUploadService';

interface UpdatePostData {
  post_id?: string;
  post_img?: string;
  post_title?: string;
  post_content?: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<UpdatePostData>({});
  const [originalData, setOriginalData] = useState<Post | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const postId = params?.id as string;

  // Load post data
  const loadPost = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await postService.getPostById(postId);
      
      if (response.success && response.data) {
        const postData = response.data.post;
        setPost(postData);
        setOriginalData(postData);
        setFormData({
          post_id: postData.post_id,
          post_img: postData.post_img || '',
          post_title: postData.post_title,
          post_content: postData.post_content
        });
      } else {
        throw new Error(response.message || 'Post not found');
      }
    } catch (err: any) {
      alert('Lỗi khi tải bài viết: ' + (err.message || 'Unknown error'));
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<void> => {
    if (!postId) {
      throw new Error('Không tìm thấy bài viết');
    }

    setImageUploading(true);
    try {
      const response = await postUploadService.uploadPostImage(postId, file);
      setFormData(prev => ({
        ...prev,
        post_img: response.data.cloudinary.secure_url
      }));
      } catch (error) {
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  // Handle image delete
  const handleImageDelete = async (): Promise<void> => {
    if (!postId) {
      throw new Error('Không tìm thấy bài viết');
    }

    try {
      await postUploadService.deletePostImage(postId);
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

    if (!formData.post_title?.trim()) {
      newErrors.post_title = 'Tiêu đề bài viết là bắt buộc';
    }

    if (!formData.post_content?.trim()) {
      newErrors.post_content = 'Nội dung bài viết là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form has changes
  const hasChanges = (): boolean => {
    if (!originalData) return false;
    
    return (
      formData.post_title !== originalData.post_title ||
      formData.post_content !== originalData.post_content ||
      formData.post_img !== originalData.post_img
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      alert('Không có thay đổi nào để lưu');
      return;
    }

    if (!post) {
      alert('Không tìm thấy bài viết để cập nhật');
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const updateData: UpdatePostData = {};
      
      // Only include changed fields
      if (formData.post_title !== originalData?.post_title) {
        updateData.post_title = formData.post_title;
      }
      if (formData.post_content !== originalData?.post_content) {
        updateData.post_content = formData.post_content;
      }
      if (formData.post_img !== originalData?.post_img) {
        updateData.post_img = formData.post_img;
      }

      // Use post_id from URL params for update API call
      const response = await postService.updatePost(postId, updateData);
      
      if (response.success) {
        alert('Cập nhật bài viết thành công!');
        router.push('/admin/posts');
      } else {
        throw new Error(response.message || 'Failed to update post');
      }
    } catch (err: any) {
      alert('Lỗi khi cập nhật bài viết: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdatePostData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mt-2">Bài viết bạn đang tìm không tồn tại.</p>
        <Button 
          onClick={() => router.push('/admin/posts')}
          className="mt-4"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh Sửa Bài Viết</h1>
          <p className="text-gray-600 mt-1">ID: {post.post_id}</p>
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
            {/* Post ID - Read only */}
            <div>
              <Input
                label="ID Bài Viết"
                value={formData.post_id || ''}
                disabled
                placeholder="ID bài viết"
              />
            </div>

            {/* Post Title */}
            <div>
              <Input
                label="Tiêu Đề Bài Viết"
                value={formData.post_title || ''}
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
                value={formData.post_content || ''}
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

            {/* Action Buttons */}
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
                loading={saving}
                disabled={!hasChanges()}
                className="flex items-center space-x-2"
              >
                <CheckIcon className="w-5 h-5" />
                <span>Lưu Thay Đổi</span>
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Image Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh Bài Viết
          </h2>
          
          <ImageUpload
            currentImage={formData.post_img}
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            loading={imageUploading}
            label="Cập Nhật Ảnh Bài Viết"
            description="PNG, JPG, JPEG hoặc WEBP (tối đa 5MB)"
          />
        </Card>
      </motion.div>
    </div>
  );
}
