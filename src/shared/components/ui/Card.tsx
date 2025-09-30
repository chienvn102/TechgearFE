import React, { forwardRef } from 'react';
import { cn } from '../../utils/index';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'customer' | 'admin' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'blue';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    variant = 'default',
    padding = 'md',
    shadow = 'md',
    border = true,
    rounded = 'lg',
    hover = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles với blue theme
          'bg-white text-neutral-900 transition-all duration-200',
          
          // Variant styles
          variant === 'customer' && 'bg-white',
          variant === 'admin' && 'bg-white border-neutral-200',
          variant === 'elevated' && 'bg-white shadow-blue-lg',
          
          // Padding variants
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-3',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          
          // Shadow variants với blue theme
          shadow === 'none' && 'shadow-none',
          shadow === 'sm' && 'shadow-soft',
          shadow === 'md' && 'shadow-card',
          shadow === 'lg' && 'shadow-lg',
          shadow === 'blue' && 'shadow-blue',
          
          // Border
          border && 'border border-neutral-200',
          
          // Rounded corners
          rounded === 'none' && 'rounded-none',
          rounded === 'sm' && 'rounded-sm',
          rounded === 'md' && 'rounded-md',
          rounded === 'lg' && 'rounded-lg',
          rounded === 'xl' && 'rounded-xl',
          
          // Hover effects với blue theme
          hover && 'hover:shadow-blue hover:scale-105 cursor-pointer',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// 🎨 Card sub-components với blue theme
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-neutral-200', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-600', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0 border-t border-neutral-200 bg-neutral-50', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Export default
export { Card };
export default Card;
