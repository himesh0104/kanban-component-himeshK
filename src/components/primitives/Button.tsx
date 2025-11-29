import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  theme = 'light',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
  
  const variantStyles = {
    primary: theme === 'dark' 
      ? 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500' 
      : 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: theme === 'dark'
      ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600 focus:ring-neutral-500'
      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 focus:ring-neutral-500',
    danger: theme === 'dark'
      ? 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500'
      : 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
    ghost: theme === 'dark'
      ? 'text-neutral-300 hover:bg-neutral-700 focus:ring-neutral-500'
      : 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};