'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/features/auth/services/authService';

interface CartItem {
  _id: string;
  pd_id: string;
  pd_name: string;
  pd_price: number;
  quantity: number;
  img?: string;
  color?: string;
  brand?: string;
  selected?: boolean; // For Shopee-like selection
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loadCartFromServer: () => Promise<void>;
  saveCartToServer: () => Promise<void>;
  // Selection methods
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  getSelectedItems: () => CartItem[];
  getSelectedTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load cart on mount - try server first, then localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        // If user is logged in, try to load from server
        if (authService.isAuthenticated()) {
          await loadCartFromServer();
        } else {
          // If not logged in, load from localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              if (Array.isArray(parsedCart)) {
                setItems(parsedCart);
              } else {
                setItems([]);
              }
            } catch (error) {
              setItems([]);
            }
          }
        }
      } catch (error) {
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (Array.isArray(parsedCart)) {
              setItems(parsedCart);
            }
          } catch (e) {
            setItems([]);
          }
        }
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever items change (for guest users)
  useEffect(() => {
    if (!authService.isAuthenticated() && !isClearing) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isClearing]);

  // Auto-save to server when items change (for logged-in users)
  useEffect(() => {
    if (authService.isAuthenticated() && items.length > 0 && !isClearing) {
      // Debounce server saves to avoid too many API calls
      const timeoutId = setTimeout(() => {
        saveCartToServer();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [items, isClearing]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      if (!Array.isArray(prevItems)) return [{ ...newItem, quantity: 1, selected: true }];
      
      const existingItem = prevItems.find(item => 
        item._id === newItem._id && item.color === newItem.color
      );

      if (existingItem) {
        return prevItems.map(item =>
          item._id === newItem._id && item.color === newItem.color
            ? { ...item, quantity: item.quantity + 1, selected: true }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity: 1, selected: true }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => {
      if (!Array.isArray(prevItems)) return [];
      return prevItems.filter(item => item._id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setItems(prevItems => {
        if (!Array.isArray(prevItems)) return [];
        return prevItems.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        );
      });
    }
  };

  const clearCart = () => {
    setIsClearing(true);
    setItems([]);
    // Clear from localStorage immediately
    localStorage.removeItem('cart');
    // Clear from server if logged in (async)
    if (authService.isAuthenticated()) {
      // Save empty cart to server
      localStorage.setItem('cart', JSON.stringify([]));
      }
    
    // Reset clearing flag after a short delay
    setTimeout(() => {
      setIsClearing(false);
    }, 100);
  };

  // Load cart from server
  const loadCartFromServer = async () => {
    try {
      // TODO: Implement API call to get cart from server
      // For now, fallback to localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      }
  };

  // Save cart to server
  const saveCartToServer = async () => {
    try {
      // TODO: Implement API call to save cart to server
      // For now, save to localStorage
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      }
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const getTotalItems = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.pd_price * item.quantity), 0);
  };

  // Selection methods
  const toggleItemSelection = (itemId: string) => {
    setItems(prevItems => {
      if (!Array.isArray(prevItems)) return [];
      return prevItems.map(item =>
        item._id === itemId ? { ...item, selected: !item.selected } : item
      );
    });
  };

  const selectAllItems = () => {
    setItems(prevItems => {
      if (!Array.isArray(prevItems)) return [];
      return prevItems.map(item => ({ ...item, selected: true }));
    });
  };

  const deselectAllItems = () => {
    setItems(prevItems => {
      if (!Array.isArray(prevItems)) return [];
      return prevItems.map(item => ({ ...item, selected: false }));
    });
  };

  const getSelectedItems = () => {
    if (!Array.isArray(items)) return [];
    return items.filter(item => item.selected);
  };

  const getSelectedTotal = () => {
    const selectedItems = getSelectedItems();
    return selectedItems.reduce((total, item) => total + (item.pd_price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
    loadCartFromServer,
    saveCartToServer,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedItems,
    getSelectedTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
