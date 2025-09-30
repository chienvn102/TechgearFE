// Test page để test Cloudinary integration và image upload
'use client';

import { useState } from 'react';
import { cloudinaryService, getImageUrl } from '@/lib/cloudinary';
import ClientOnlyWrapper from '@/components/ClientOnlyWrapper';

export default function ImageTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryService.uploadImage(selectedFile, 'test');
      
      if (result.success && result.data) {
        setUploadedImages(prev => [...prev, result.data!.secure_url]);
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearImages = () => {
    setUploadedImages([]);
  };

  return (
    <ClientOnlyWrapper fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🧪 Cloudinary Image Upload Test</h1>
          
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Test</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ảnh để test upload
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
              </button>

              {error && (
                <div className="text-red-600 text-sm">
                  Error: {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Uploaded Images ({uploadedImages.length})</h2>
              {uploadedImages.length > 0 && (
                <button
                  onClick={clearImages}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            {uploadedImages.length === 0 ? (
              <p className="text-gray-500">No images uploaded yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img
                        src={getImageUrl(imageUrl, 'medium')}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 break-all">
                      {imageUrl}
                    </div>
                    <div className="mt-2 space-y-1">
                      <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs hover:underline block"
                      >
                        View Original
                      </a>
                      <a 
                        href={getImageUrl(imageUrl, 'thumbnail')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-500 text-xs hover:underline block"
                      >
                        View Thumbnail
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Config Info */}
          <div className="bg-gray-100 rounded-lg p-4 mt-8">
            <h3 className="font-semibold mb-2">🔧 Cloudinary Config</h3>
            <div className="text-sm space-y-1">
              <div>Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}</div>
              <div>Upload Preset: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not set'}</div>
              <div>API Key: {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Set' : 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnlyWrapper>
  );
}
