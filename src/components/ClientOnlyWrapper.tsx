// ClientOnlyWrapper - Giải quyết hydration mismatch issues
// Đảm bảo component chỉ render ở client side để tránh conflict với browser extensions

'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnlyWrapper({ 
  children, 
  fallback = null 
}: ClientOnlyWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Đảm bảo component chỉ render sau khi client-side hydration hoàn tất
    setIsClient(true);
    
    // Clean browser extension attributes để tránh hydration mismatch
    const cleanExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked], [data-bis-checked], [data-adblock-key]');
      elements.forEach(el => {
        el.removeAttribute('bis_skin_checked');
        el.removeAttribute('data-bis-checked');
        el.removeAttribute('data-adblock-key');
      });
    };
    
    // Clean attributes ngay lập tức và sau mỗi 1 giây
    cleanExtensionAttributes();
    const interval = setInterval(cleanExtensionAttributes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Trong lúc đang hydrating, hiển thị fallback hoặc không hiển thị gì
  if (!isClient) {
    return <>{fallback}</>;
  }

  // Sau khi hydration hoàn tất, render children
  return <>{children}</>;
}
