import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'customer' | 'admin';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    success,
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    // 🎨 Dynamic styling với blue theme
    const getInputClasses = () => {
      const baseClasses = 'flex h-10 w-full rounded-lg border transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-3 py-2 text-sm';
      
      // Error state
      if (error) {
        return cn(baseClasses, 'border-error-500 bg-white focus:border-error-500 focus:ring-2 focus:ring-error-500/20');
      }
      
      // Success state
      if (success) {
        return cn(baseClasses, 'border-success-500 bg-white focus:border-success-500 focus:ring-2 focus:ring-success-500/20');
      }
      
      // Variant-based styling
      switch (variant) {
        case 'customer':
          return cn(baseClasses, 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-blue');
        case 'admin':
          return cn(baseClasses, 'border-neutral-300 bg-white focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20');
        default:
          return cn(baseClasses, 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20');
      }
    };
    
    return (
      <div className="w-full space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              getInputClasses(),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-error-600 flex items-center gap-1">
            <span className="text-error-500">⚠️</span>
            {error}
          </p>
        )}
        
        {/* Success message */}
        {success && (
          <p className="text-sm text-success-600 flex items-center gap-1">
            <span className="text-success-500">✅</span>
            {success}
          </p>
        )}
        
        {/* Helper text */}
        {helperText && !error && !success && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
