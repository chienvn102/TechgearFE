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
    
    // 🎨 Dynamic styling with blue theme
    const getInputClasses = () => {
      const baseClasses = 'flex w-full rounded-lg border transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 px-3 py-2 text-sm';
      
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="h-5 w-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
