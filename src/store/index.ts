import { configureStore } from '@reduxjs/toolkit';
import cartSlice from '@/features/cart/store/cartSlice';
import authSlice from '@/features/auth/store/authSlice';

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
