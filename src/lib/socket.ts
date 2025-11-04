// src/lib/socket.ts
// Socket.io client for real-time notifications

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private customerId: string | null = null;

  /**
   * Connect to Socket.io server
   */
  connect(customerId: string) {
    if (this.socket?.connected && this.customerId === customerId) {
      return;
    }

    // Disconnect previous connection if different customer
    if (this.socket && this.customerId !== customerId) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.customerId = customerId;

    this.socket.on('connect', () => {
      // Join customer-specific room
      this.socket?.emit('join:customer', customerId);
    });

    this.socket.on('disconnect', () => {
      });

    this.socket.on('connect_error', (error) => {
      });

    this.socket.on('reconnect', (attemptNumber) => {
      // Rejoin customer room after reconnection
      this.socket?.emit('join:customer', customerId);
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.customerId = null;
    }
  }

  /**
   * Listen for new notifications
   */
  onNotification(callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on('notification:new', callback);
  }

  /**
   * Remove notification listener
   */
  offNotification(callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off('notification:new', callback);
      } else {
        this.socket.off('notification:new');
      }
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current customer ID
   */
  getCurrentCustomerId(): string | null {
    return this.customerId;
  }
}

// Export singleton instance
export const socketService = new SocketService();
