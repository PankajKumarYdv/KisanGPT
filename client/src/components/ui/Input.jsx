import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-muted-foreground">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          clsx(
            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition-all disabled:opacity-50',
            error && 'border-destructive focus:ring-destructive',
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}
