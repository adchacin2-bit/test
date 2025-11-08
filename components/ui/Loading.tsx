import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message, size = 'md' }: LoadingProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeStyles[size]} border-4 border-green-200 border-t-lime-600 rounded-full animate-spin`} />
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
