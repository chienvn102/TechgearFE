'use client';

import { ReactNode } from 'react';
import { ReduxProvider } from '@/shared/store/ReduxProvider';
import { CartProvider } from '@/contexts/CartContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ReduxProvider>
  );
}
