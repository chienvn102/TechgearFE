'use client';

import { useState } from 'react';

export default function DebugUploadPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testUpload = async () => {
    setLoading(true);
    setResult('Starting test...\n');
    
    try {
      const BASE_URL = 'http://localhost:3000/api/v1';
      
      // 1. Login
      setResult(prev => prev + '1️⃣ Testing login...\n');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }
      
      const loginData = await loginResponse.json();
      setResult(prev => prev + `✅ Login successful: ${loginData.success}\n`);
      const token = loginData.data.token;
      
      // 2. Get products
      setResult(prev => prev + '2️⃣ Getting product...\n');
      const productsResponse = await fetch(`${BASE_URL}/products?limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const productsData = await productsResponse.json();
      const product = productsData.data.products[0];
      setResult(prev => prev + `✅ Product: ${product.pd_name} (${product._id})\n`);
      
      // 3. Create image
      setResult(prev => prev + '3️⃣ Creating test image...\n');
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 300, 300);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FRONTEND', 150, 140);
      ctx.fillText('DEBUG TEST', 150, 170);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      setResult(prev => prev + `✅ Image created: ${blob.size} bytes\n`);
      
      // 4. Upload image
      setResult(prev => prev + '4️⃣ Uploading image...\n');
      const formData = new FormData();
      formData.append('image', blob, 'frontend-debug.png');
      formData.append('pd_id', product._id);
      formData.append('color', 'purple');
      formData.append('is_primary', 'false');
      
      setResult(prev => prev + 'FormData prepared with pd_id: ' + product._id + '\n');
      
      const uploadResponse = await fetch(`${BASE_URL}/upload/product-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      setResult(prev => prev + `Upload response status: ${uploadResponse.status}\n`);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        setResult(prev => prev + `❌ Upload error: ${errorText}\n`);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      setResult(prev => prev + `✅ Upload successful!\n`);
      setResult(prev => prev + `Image URL: ${uploadData.data.product_image.img}\n`);
      setResult(prev => prev + `Cloudinary ID: ${uploadData.data.product_image.cloudinary_public_id}\n`);
      
      // 5. Get images
      setResult(prev => prev + '5️⃣ Getting product images...\n');
      const imagesResponse = await fetch(`${BASE_URL}/upload/product/${product._id}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!imagesResponse.ok) {
        throw new Error(`Get images failed: ${imagesResponse.status}`);
      }
      
      const imagesData = await imagesResponse.json();
      setResult(prev => prev + `✅ Found ${imagesData.data.total} images\n`);
      
      setResult(prev => prev + '\n🎉 All tests passed! Frontend upload is working!\n');
      
    } catch (error) {
      setResult(prev => prev + `\n❌ Test failed: ${error.message}\n`);
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Debug Upload Test</h1>
      
      <div className="mb-6">
        <button
          onClick={testUpload}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Upload Test'}
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
        {result || 'Click "Run Upload Test" to start debugging...'}
      </div>
    </div>
  );
}