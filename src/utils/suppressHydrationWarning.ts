// Suppress hydration warnings utility
// Giúp xử lý các warnings do browser extensions gây ra

'use client';

import { useEffect } from 'react';

export function suppressHydrationWarning() {
  useEffect(() => {
    // Suppress hydration warnings in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          args[0].includes('hydration')
        ) {
          return;
        }
        originalError(...args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);
}

export default suppressHydrationWarning;
