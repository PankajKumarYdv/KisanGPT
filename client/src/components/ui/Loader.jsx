import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Loader({ className, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex justify-center items-center py-4">
      <div
        className={twMerge(
          clsx(
            'border-primary border-t-transparent rounded-full animate-spin',
            sizes[size],
            className
          )
        )}
      />
    </div>
  );
}
