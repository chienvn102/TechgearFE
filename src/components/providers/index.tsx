'use client';

import { ReduxProvider } from './ReduxProvider';
import { CartProvider } from '@/features/cart/store/cart.context';

interface ProvidersProps {
  children: React.ReactNode;
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
