/**
 * Simple toast notification system
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

class ToastService {
  private createToast(message: string, type: ToastType, options?: ToastOptions) {
    const { duration = 3000, position = 'top-right' } = options || {};
    
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.zIndex = '9999';
      
      // Position based on option
      switch (position) {
        case 'top-right':
          container.style.top = '1rem';
          container.style.right = '1rem';
          break;
        case 'top-left':
          container.style.top = '1rem';
          container.style.left = '1rem';
          break;
        case 'bottom-right':
          container.style.bottom = '1rem';
          container.style.right = '1rem';
          break;
        case 'bottom-left':
          container.style.bottom = '1rem';
          container.style.left = '1rem';
          break;
        case 'top-center':
          container.style.top = '1rem';
          container.style.left = '50%';
          container.style.transform = 'translateX(-50%)';
          break;
        case 'bottom-center':
          container.style.bottom = '1rem';
          container.style.left = '50%';
          container.style.transform = 'translateX(-50%)';
          break;
      }
      
      document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.style.margin = '0.5rem 0';
    toast.style.padding = '0.75rem 1rem';
    toast.style.borderRadius = '0.375rem';
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.animation = 'fadeIn 0.3s ease-out forwards';
    toast.style.transition = 'all 0.3s ease';
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '350px';
    
    // Set colors based on type
    switch (type) {
      case 'success':
        toast.style.backgroundColor = '#10B981';
        toast.style.color = 'white';
        toast.style.borderLeft = '5px solid #059669';
        break;
      case 'error':
        toast.style.backgroundColor = '#EF4444';
        toast.style.color = 'white';
        toast.style.borderLeft = '5px solid #B91C1C';
        break;
      case 'warning':
        toast.style.backgroundColor = '#F59E0B';
        toast.style.color = 'white';
        toast.style.borderLeft = '5px solid #B45309';
        break;
      case 'info':
        toast.style.backgroundColor = '#3B82F6';
        toast.style.color = 'white';
        toast.style.borderLeft = '5px solid #1D4ED8';
        break;
    }
    
    // Add content
    toast.innerHTML = message;
    
    // Add to container
    container.appendChild(toast);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(20px);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Auto-remove after duration
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        container?.removeChild(toast);
        // Remove container if empty
        if (container?.childElementCount === 0) {
          document.body.removeChild(container);
        }
      }, 300);
    }, duration);
  }

  success(message: string, options?: ToastOptions) {
    this.createToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    this.createToast(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    this.createToast(message, 'info', options);
  }

  warning(message: string, options?: ToastOptions) {
    this.createToast(message, 'warning', options);
  }
}

export const toast = new ToastService();
