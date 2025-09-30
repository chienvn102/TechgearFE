'use client';

import { useState, useEffect } from 'react';

export default function BannerDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Gather debug information
    const info = {
      env: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NODE_ENV: process.env.NODE_ENV
      },
      storage: {
        auth_token: !!localStorage.getItem('auth_token'),
        user_data: !!localStorage.getItem('user_data'),
      },
      location: {
        origin: window.location.origin,
        pathname: window.location.pathname
      }
    };

    // Try to parse user data
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        info.user = {
          username: user.username,
          role: user.role_id?.role_id,
          isAdmin: user.role_id?.role_id === 'ADMIN'
        };
      }
    } catch (e) {
      info.user = { error: 'Cannot parse user data' };
    }

    setDebugInfo(info);
  }, []);

  const testAPICall = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${baseUrl}/api/v1/banners?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`API Test Success! Found ${data.data?.banners?.length || 0} banners`);
      } else {
        const error = await response.text();
        alert(`API Test Failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      alert(`API Test Error: ${error}`);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg"
          title="Show Debug Info"
        >
          DEBUG
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🔍 Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white"
        >
          ✖
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Environment:</strong>
          <pre className="bg-gray-800 p-1 rounded mt-1">
            {JSON.stringify(debugInfo.env, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Storage:</strong>
          <pre className="bg-gray-800 p-1 rounded mt-1">
            {JSON.stringify(debugInfo.storage, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>User:</strong>
          <pre className="bg-gray-800 p-1 rounded mt-1">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Location:</strong>
          <pre className="bg-gray-800 p-1 rounded mt-1">
            {JSON.stringify(debugInfo.location, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2">
        <button
          onClick={testAPICall}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Test API
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
