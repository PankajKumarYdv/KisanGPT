import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ className, variant = 'primary', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-95 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-opacity-95 focus:ring-secondary',
    accent: 'bg-accent text-white hover:bg-opacity-95 focus:ring-accent',
    outline: 'border border-border text-foreground hover:bg-muted focus:ring-muted',
    ghost: 'text-foreground hover:bg-muted focus:ring-muted shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    />
  );
}

