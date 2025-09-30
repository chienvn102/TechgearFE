import { BaseService } from '../../../shared/services/api';
import type { ApiResponse, Cart, CartItem, Product } from '../../../types';

export class CartService extends BaseService {
  constructor() {
    super('');  // Cart sẽ được manage locally cho đến khi có backend API
  }

  // Temporary local storage functions
  // Sẽ thay thế bằng API calls khi backend ready

  /**
   * Get cart from localStorage
   */
  async getCart(): Promise<ApiResponse<Cart>> {
    try {
      if (typeof window === 'undefined') {
        return {
          success: true,
          data: { items: [], total: 0, itemCount: 0 }
        };
      }

      const cartData = localStorage.getItem('cart');
      const cart: Cart = cartData ? JSON.parse(cartData) : { items: [], total: 0, itemCount: 0 };
      
      return {
        success: true,
        data: cart
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get cart',
        data: { items: [], total: 0, itemCount: 0 }
      };
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(product: Product, quantity: number = 1, color?: string): Promise<ApiResponse<Cart>> {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data!;

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.pd_id === product.pd_id && item.selected_color === color
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product,
          quantity,
          selected_color: color
        });
      }

      // Recalculate totals
      this.recalculateCart(cart);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      return {
        success: true,
        message: 'Item added to cart',
        data: cart
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add item to cart'
      };
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateCartItem(productId: string, quantity: number, color?: string): Promise<ApiResponse<Cart>> {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data!;

      const itemIndex = cart.items.findIndex(
        item => item.product.pd_id === productId && item.selected_color === color
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        this.recalculateCart(cart);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        return {
          success: true,
          message: 'Cart updated',
          data: cart
        };
      }

      return {
        success: false,
        message: 'Item not found in cart'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update cart item'
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string, color?: string): Promise<ApiResponse<Cart>> {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data!;

      cart.items = cart.items.filter(
        item => !(item.product.pd_id === productId && item.selected_color === color)
      );

      // Recalculate totals
      this.recalculateCart(cart);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      return {
        success: true,
        message: 'Item removed from cart',
        data: cart
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove item from cart'
      };
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<Cart>> {
    try {
      const emptyCart: Cart = { items: [], total: 0, itemCount: 0 };
      localStorage.setItem('cart', JSON.stringify(emptyCart));

      return {
        success: true,
        message: 'Cart cleared',
        data: emptyCart
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to clear cart'
      };
    }
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cartResponse = await this.getCart();
      return cartResponse.data?.itemCount || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productId: string, color?: string): Promise<boolean> {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data!;
      
      return cart.items.some(
        item => item.product.pd_id === productId && item.selected_color === color
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Recalculate cart totals
   */
  private recalculateCart(cart: Cart): void {
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.total = cart.items.reduce((total, item) => {
      const price = item.product.pd_price || 0;
      return total + (price * item.quantity);
    }, 0);
  }
}

// Export singleton instance
export const cartService = new CartService();
