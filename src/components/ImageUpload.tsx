// components/ImageUpload.tsx
// Reusable image upload component with Cloudinary integration

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete?: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  label?: string;
  description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUpload,
  onImageDelete,
  loading = false,
  disabled = false,
  className = '',
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizeInMB = 5,
  label = 'Upload Image',
  description = 'PNG, JPG, JPEG or WEBP (max 5MB)'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Chỉ chấp nhận file: ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File không được vượt quá ${maxSizeInMB}MB`
      };
    }

    return { isValid: true };
  }, [acceptedTypes, maxSizeInMB]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setUploadStatus('uploading');

      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'File không hợp lệ');
        setUploadStatus('error');
        return;
      }

      await onImageUpload(file);
      setUploadStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (error: any) {
      setError(error.message || 'Lỗi khi upload ảnh');
      setUploadStatus('error');
    }
  }, [onImageUpload, validateFile]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || loading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload, disabled, loading]);

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  }, [disabled, loading]);

  // Handle delete image
  const handleDelete = useCallback(async () => {
    if (onImageDelete) {
      try {
        setError(null);
        await onImageDelete();
      } catch (error: any) {
        setError(error.message || 'Lỗi khi xóa ảnh');
      }
    }
  }, [onImageDelete]);

  const isUploading = loading || uploadStatus === 'uploading';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${currentImage ? 'p-2' : 'p-6'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isUploading ? 'bg-gray-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!currentImage ? handleClick : undefined}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Current Image Display */}
        {currentImage && (
          <div className="relative">
            <img
              src={currentImage}
              alt="Current image"
              className="w-full h-64 object-cover rounded-lg"
              style={{ aspectRatio: '16/9' }}
            />
            
            {/* Image Actions */}
            <div className="absolute top-2 right-2 flex space-x-2">
              {/* Replace Image Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                disabled={disabled || isUploading}
                className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
                title="Thay đổi ảnh"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
              </motion.button>

              {/* Delete Image Button */}
              {onImageDelete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={disabled || isUploading}
                  className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                  title="Xóa ảnh"
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Upload Progress Overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                >
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Đang upload...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Upload Placeholder */}
        {!currentImage && (
          <div className="text-center">
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-blue-600 font-medium">Đang upload ảnh...</p>
                </motion.div>
              ) : uploadStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Upload thành công!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Kéo thả ảnh vào đây hoặc click để chọn
                  </p>
                  {description && (
                    <p className="text-sm text-gray-500 mt-2">{description}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
