'use client';

import { useState, useEffect } from 'react';

export default function PublicImageTestPage() {
  const [imageData, setImageData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testPublicAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test without authentication
      const response = await fetch('http://localhost:3000/api/v1/products/68a5f51e7b56d117bbdb03d6/images', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setImageData(data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test direct image loading without CORS
  const testDirectImageLoad = () => {
    const imageUrl = 'http://localhost:3000/uploads/products/logitech.png';
    const img = new Image();
    img.onload = () => {
      };
    img.onerror = (e) => {
      };
    img.src = imageUrl;
    
    // Add to page
    img.style.border = '2px solid blue';
    img.style.margin = '10px';
    img.style.maxWidth = '200px';
    const container = document.getElementById('image-display');
    if (container) {
      container.appendChild(img);
    }
  };

  useEffect(() => {
    testPublicAPI();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔓 Public Image API Test</h1>
      <p className="text-gray-600 mb-4">Testing without authentication</p>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button 
            onClick={testPublicAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing API...' : 'Test API'}
          </button>
          
          <button 
            onClick={testDirectImageLoad}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Direct Image Load
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {imageData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold text-lg mb-2">✅ API Response Success:</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(imageData, null, 2)}
            </pre>
            
            {imageData.data?.images?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold mb-2">📸 Found Images:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageData.data.images.map((img: any, index: number) => (
                    <div key={index} className="border p-4 rounded bg-white">
                      <p className="mb-2"><strong>File:</strong> {img.img}</p>
                      <p className="mb-2"><strong>Color:</strong> {img.color}</p>
                      <p className="mb-2"><strong>Product ID:</strong> {img.pd_id}</p>
                      
                      <div className="mt-3">
                        <p className="text-sm font-semibold mb-1">Direct Display Test:</p>
                        <img
                          src={`http://localhost:3000/uploads/products/${img.img}`}
                          alt={img.img}
                          className="w-48 h-48 object-cover border-2 border-gray-300 rounded"
                          onLoad={() => {
                            }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            target.nextElementSibling!.textContent = '❌ Failed to load image';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Image: {img.img}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div id="image-display" className="mt-6">
          <h3 className="font-bold mb-2">🖼️ Direct Image Loading Test:</h3>
        </div>
      </div>
    </div>
  );
}
