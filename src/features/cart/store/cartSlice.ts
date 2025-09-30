// Cart Store - Redux slice cho cart state management
// Tuân thủ Clean Architecture pattern với centralized state

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services/cartService';
import type { 
  CartState, 
  CartItem, 
  CustomerAddress, 
  PaymentMethod, 
  Voucher,
  CreateOrderRequest 
} from '../types/cart.types';
import type { Product } from '@/types/product.types';

// 🎯 Initial State
const initialState: CartState = {
  items: [],
  total: 0,
  itemsCount: 0,
  loading: false,
  error: null,
  
  // Checkout related
  selectedAddress: null,
  selectedPaymentMethod: null,
  selectedVoucher: null,
  orderNote: '',
  
  // UI state
  isOpen: false,
  checkoutStep: 'cart'
};

// 🔄 Async Thunks
export const fetchAddresses = createAsyncThunk(
  'cart/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getMyAddresses();
      return response.data.addresses;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'cart/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getPaymentMethods();
      return response.data.paymentMethods;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVouchers = createAsyncThunk(
  'cart/fetchVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getAvailableVouchers();
      return response.data.vouchers;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitOrder = createAsyncThunk(
  'cart/submitOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await cartService.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 🛒 Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ➕ Add item to cart
    addItem: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          selected: true,
          addedAt: new Date()
        });
      }
      
      cartSlice.caseReducers.recalculateTotal(state);
    },
    
    // ➖ Remove item from cart
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
      cartSlice.caseReducers.recalculateTotal(state);
    },
    
    // 🔄 Update quantity
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      
      cartSlice.caseReducers.recalculateTotal(state);
    },
    
    // ☑️ Toggle item selection
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.product._id === action.payload);
      if (item) {
        item.selected = !item.selected;
      }
      cartSlice.caseReducers.recalculateTotal(state);
    },
    
    // 🗑️ Clear cart
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemsCount = 0;
      state.selectedVoucher = null;
      state.orderNote = '';
    },
    
    // 🔢 Recalculate total
    recalculateTotal: (state) => {
      const selectedItems = state.items.filter(item => item.selected);
      const subtotal = selectedItems.reduce((sum, item) => {
        return sum + (item.product.pd_price * item.quantity);
      }, 0);
      
      let discount = 0;
      if (state.selectedVoucher) {
        if (state.selectedVoucher.discount_type === 'percentage') {
          discount = (subtotal * state.selectedVoucher.discount_value) / 100;
          if (state.selectedVoucher.max_discount_amount) {
            discount = Math.min(discount, state.selectedVoucher.max_discount_amount);
          }
        } else {
          discount = state.selectedVoucher.discount_value;
        }
      }
      
      state.total = Math.max(0, subtotal - discount);
      state.itemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    // 🎯 UI Actions
    openCart: (state) => {
      state.isOpen = true;
    },
    
    closeCart: (state) => {
      state.isOpen = false;
    },
    
    setCheckoutStep: (state, action: PayloadAction<CartState['checkoutStep']>) => {
      state.checkoutStep = action.payload;
    },
    
    // 🎯 Checkout Actions
    setSelectedAddress: (state, action: PayloadAction<CustomerAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    
    setSelectedPaymentMethod: (state, action: PayloadAction<PaymentMethod | null>) => {
      state.selectedPaymentMethod = action.payload;
    },
    
    setSelectedVoucher: (state, action: PayloadAction<Voucher | null>) => {
      state.selectedVoucher = action.payload;
      cartSlice.caseReducers.recalculateTotal(state);
    },
    
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
    
    // 🧹 Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  
  // 🔄 Extra Reducers cho async actions
  extraReducers: (builder) => {
    builder
      // Submit Order
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Clear cart after successful order
        cartSlice.caseReducers.clearCart(state);
        state.isOpen = false;
        state.checkoutStep = 'cart';
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch data actions
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// 🚀 Export actions
export const {
  addItem,
  removeItem,
  updateQuantity,
  toggleItemSelection,
  clearCart,
  openCart,
  closeCart,
  setCheckoutStep,
  setSelectedAddress,
  setSelectedPaymentMethod,
  setSelectedVoucher,
  setOrderNote,
  clearError
} = cartSlice.actions;

// 🎯 Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartItemsCount = (state: { cart: CartState }) => state.cart.itemsCount;
export const selectCartIsOpen = (state: { cart: CartState }) => state.cart.isOpen;
export const selectSelectedItems = (state: { cart: CartState }) => 
  state.cart.items.filter(item => item.selected);

export default cartSlice.reducer;
