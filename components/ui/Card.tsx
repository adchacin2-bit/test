import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-green-100 dark:border-gray-700';
  const hoverStyles = hoverable ? 'hover:shadow-2xl hover:border-green-300 dark:hover:border-lime-400 cursor-pointer transition-all duration-200 hover:scale-105' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
