import React from 'react';
import Skeleton from './Skeleton.jsx';

export default function LoadingSkeleton({ type = 'table', count = 5 }) {
  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col items-center space-y-3 pb-6 border-b border-border">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="md:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <Skeleton className="h-6 w-32 border-b border-border pb-2" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Table default
  return (
    <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 grid grid-cols-5 gap-4">
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
