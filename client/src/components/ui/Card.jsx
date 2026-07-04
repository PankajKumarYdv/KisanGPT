import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={twMerge(
        clsx('bg-card border rounded-2xl p-6 shadow-sm overflow-hidden', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}
