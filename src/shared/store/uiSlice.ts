import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Error states
  errors: {
    [key: string]: string | null;
  };
  
  // Modal states
  modals: {
    [key: string]: boolean;
  };
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Sidebar state (for admin panel)
  sidebarOpen: boolean;
  
  // Mobile menu state
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  loading: {},
  errors: {},
  modals: {},
  toasts: [],
  theme: 'light',
  sidebarOpen: true,
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    clearAllLoading: (state) => {
      state.loading = {};
    },

    // Error states
    setError: (state, action: PayloadAction<{ key: string; error: string | null }>) => {
      state.errors[action.payload.key] = action.payload.error;
    },
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors = {};
    },

    // Modal states
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      state.modals = {};
    },

    // Toast notifications
    addToast: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const id = Math.random().toString(36).substr(2, 9);
      state.toasts.push({
        id,
        ...action.payload,
        duration: action.payload.duration || 5000,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Mobile menu
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
  },
});

// Export actions
export const {
  setLoading,
  clearLoading,
  clearAllLoading,
  setError,
  clearError,
  clearAllErrors,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearAllToasts,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
} = uiSlice.actions;

// Export selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectLoading = (state: { ui: UIState }, key: string) => state.ui.loading[key] || false;
export const selectError = (state: { ui: UIState }, key: string) => state.ui.errors[key] || null;
export const selectModal = (state: { ui: UIState }, key: string) => state.ui.modals[key] || false;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state: { ui: UIState }) => state.ui.mobileMenuOpen;

// Export reducer
export default uiSlice.reducer;
