import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-green-600 to-lime-600 text-white hover:from-green-700 hover:to-lime-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-gray-800 text-primary dark:text-lime-400 border-2 border-primary dark:border-lime-400 hover:bg-green-50 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent text-primary dark:text-lime-400 hover:bg-green-50 dark:hover:bg-gray-800',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
