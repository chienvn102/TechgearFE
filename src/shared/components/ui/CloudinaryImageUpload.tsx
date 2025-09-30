'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CloudinaryImageUploadProps {
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  preview?: string | null;
  loading?: boolean;
  error?: string | null;
  maxSize?: number; // in MB
  accept?: string[];
  className?: string;
  placeholder?: string;
  showProgress?: boolean;
  uploadProgress?: number;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  preview,
  loading = false,
  error = null,
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  placeholder = 'Tải lên hình ảnh',
  showProgress = false,
  uploadProgress = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!accept.includes(file.type)) {
      return `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${accept.join(', ')}`;
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      return `Kích thước file quá lớn. Tối đa ${maxSize}MB`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    setValidationError(null);
    
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    onImageSelect?.(file);
  }, [validateFile, onImageSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleRemoveImage = () => {
    setValidationError(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || validationError;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${loading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
          ${displayError ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative p-4"
            >
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 max-w-full object-contain mx-auto rounded-lg shadow-md"
              />
              
              {/* Progress Bar */}
              {showProgress && loading && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-white bg-opacity-90 rounded-full p-1">
                    <div className="bg-blue-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="text-xs text-center mt-1 text-gray-600">
                      {Math.round(uploadProgress)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              {/* Upload Status */}
              {loading && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <CloudArrowUpIcon className="h-3 w-3 mr-1 animate-bounce" />
                  Đang tải...
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center p-8"
            >
              {loading ? (
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-4"
                  >
                    <CloudArrowUpIcon className="h-12 w-12 text-blue-500" />
                  </motion.div>
                  <p className="text-sm text-gray-600">Đang xử lý...</p>
                </div>
              ) : (
                <>
                  <PhotoIcon className={`h-12 w-12 mb-4 ${displayError ? 'text-red-400' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className={`text-sm font-medium ${displayError ? 'text-red-600' : 'text-blue-600'}`}>
                      {placeholder}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      hoặc kéo và thả file vào đây
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Tối đa {maxSize}MB
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded-md border border-red-200"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {displayError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {preview && !loading && !displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-md border border-green-200"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          Hình ảnh đã được chọn thành công
        </motion.div>
      )}
    </div>
  );
};
