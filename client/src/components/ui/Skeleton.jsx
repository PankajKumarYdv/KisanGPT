import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse bg-muted rounded-lg', className)
      )}
      {...props}
    />
  );
}
